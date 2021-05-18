import {
  AST,
  CurryStatement,
  FunctionStatement,
  Node,
  PipeInvocation,
  PipeStatement,
  TransformedAST,
  Visitor
} from '../models';

const traverse = (visitor: Visitor) => (node: Node, parent?: Node) => {
  traverseNode(node, parent);

  function traverseNode(n: Node, p?: Node) {
    let fns = visitor[n.type];

    if (fns && fns.enter) {
      fns.enter(n, p);
    }

    explorechildren(n);

    if (fns && fns.exit) {
      fns.exit(n, p);
    }
  }

  function explorechildren(node: Node) {
    switch (node.type) {
      case 'Program':
      case 'PipeStatement':
      case 'PipeInvocation':
      case 'UnionStatement':
        node.children.forEach((child) => {
          traverseNode(child, node);
        });
        break;

      case 'Function':
        if (node.args) {
          node.args.forEach((child) => {
            traverseNode(child, node);
          });
        }
        if (node.if) {
          traverseNode(node.if, node);
        }
        if (node.else) {
          traverseNode(node.else, node);
        }
        break;

      case 'SwitchStatement':
        node.cases.forEach((child) => {
          traverseNode(child, node);
        });
        break;

      case 'Method':
      case 'Number':
      case 'String':
      case 'SwitchCase':
      case 'SideEffect':
      case 'Variable':
      case 'Wrap':
      case 'Aggregate':
        break;

      default:
        throw new SyntaxError(node.type + ' type not supported');
    }
  }
};

const exists = (nodes: Node[], node: Node) =>
  nodes.some(({ value }) => value === node.value);

export const transformer = (ast: AST) => {
  let newAst: TransformedAST = {
    type: 'Program',
    curriedFns: [],
    pipeExpressions: [],
    pipeInvocations: [],
  };

  const traverseWithVisitor = traverse({
    PipeStatement: {
      enter(node: PipeStatement, _: AST) {
        const alreadyDeclared = exists(newAst.pipeExpressions, node);
        if (alreadyDeclared) return;
        newAst.pipeExpressions.push(node);
      },
    },
    PipeInvocation: {
      enter(node: PipeInvocation, _: AST) {
        newAst.pipeInvocations.push(node);
      },
    },
    Function: {
      enter(node: FunctionStatement, _: PipeStatement) {
        const {
          value,
          args,
          flipArguments,
          initialFunction,
          disableAutoCurrying,
          defer,
          wrap,
        } = node;

        if (initialFunction) delete node.args;

        const alreadyDeclared = exists(newAst.curriedFns, node);
        if (alreadyDeclared) return;

        const isPipeExpression = exists(newAst.pipeExpressions, node);
        if (isPipeExpression || defer || wrap) {
          node.disableAutoCurrying = true;
          return;
        }

        if (args?.length && !initialFunction && !disableAutoCurrying) {
          const curryExpression: CurryStatement = {
            type: 'CurryStatement',
            value,
          };
          newAst.curriedFns.push(curryExpression);

          if (flipArguments) {
            node.args.reverse();
          }
        }
      },
    },
  });

  traverseWithVisitor(ast);

  return newAst;
};
