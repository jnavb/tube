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

  function exploreChilds(n: Node) {
    switch (n.type) {
      case 'Program':
      case 'PipeExpression':
      case 'PipeInvocation':
      case 'UnionExpression':
        n.childs.forEach((child) => {
          traverseNode(child, n);
        });
        break;

      case 'Function':
        if (n.args) {
          n.args.forEach((child) => {
            traverseNode(child, n);
          });
        }
        if (n.if) {
          traverseNode(n.if, n);
        }
        if (n.else) {
          traverseNode(n.else, n);
        }
        break;

      case 'SwitchExpression':
        n.cases.forEach((child) => {
          traverseNode(child, n);
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
        throw new SyntaxError(n.type);
    }
  }
};

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
        newAst.pipeExpressions.push(node);
      },
    },
    PipeInvocation: {
      enter(node: PipeInvocation, _: AST) {
        newAst.pipeInvocations.push(node);
      },
    },
    Function: {
      enter({ value, args }: FunctionExpression, _: PipeExpression) {
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
