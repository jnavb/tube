import {
  AST,
  CurryExpression,
  FunctionExpression,
  Node,
  PipeExpression,
  PipeInvocation,
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

    exploreChilds(n);

    if (fns && fns.exit) {
      fns.exit(n, p);
    }
  }

  function exploreChilds(node: Node) {
    switch (node.type) {
      case 'Program':
      case 'PipeExpression':
      case 'PipeInvocation':
      case 'UnionExpression':
        node.childs.forEach((child) => {
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

      case 'SwitchExpression':
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
        break;

      default:
        throw new SyntaxError(node.type + ' type not supported');
    }
  }
};


const exists = (nodes: Node[], node: Node) =>
  nodes.some(({ value }) => value === node.value)


export const transformer = (ast: AST) => {
  let newAst: TransformedAST = {
    type: 'Program',
    curriedFns: [],
    pipeExpressions: [],
    pipeInvocations: [],
  };

  const traverseWithVisitor = traverse({
    PipeExpression: {
      enter(node: PipeExpression, _: AST) {
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
      enter(node: FunctionExpression, _: PipeExpression) {
        const { value, args } = node;

        const alreadyDeclared = exists(newAst.curriedFns, node);
        if (alreadyDeclared) return;

        if (args?.length) {
          const curryExpression: CurryExpression = {
            type: 'CurryExpression',
            value,
          };
          newAst.curriedFns.push(curryExpression);
        }
      },
    },
  });

  traverseWithVisitor(ast);

  return newAst;
};
