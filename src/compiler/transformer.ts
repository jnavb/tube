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

    exploreChilds(n);

    if (fns && fns.exit) {
      fns.exit(n, p);
    }
  }

  function exploreChilds(node: Node) {
    switch (node.type) {
      case 'Program':
      case 'PipeStatement':
      case 'PipeInvocation':
      case 'UnionStatement':
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
        break;

      default:
        throw new SyntaxError(node.type + ' type not supported');
    }
  }
};

const exists = (nodes: Node[], node: Node) =>
  nodes.some(({ value }) => value === node.value);

const modifyFirstChild = node => {
  const firstChild = node.childs[0];
  const firstChildArgs = firstChild.args ?? ([] as any);
  firstChild.initialFunction = true;

  if (firstChildArgs.length > 1) {
    throw new TypeError(
      `Invalid first function of pipe. Only nullary or unary functions allowed`,
    );
  }

  const firstArgumentOfFirstFunction = firstChildArgs[0];
  if (firstArgumentOfFirstFunction) {
    node.arg = firstArgumentOfFirstFunction;
  }
}

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
        modifyFirstChild(node);

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
        } = node;

        if (initialFunction) delete node.args;

        const alreadyDeclared = exists(newAst.curriedFns, node);
        if (alreadyDeclared) return;

        const isPipeExpression = exists(newAst.pipeExpressions, node);
        if (isPipeExpression) {
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
