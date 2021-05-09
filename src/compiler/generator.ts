import { Node, TransformedAST } from '../models';

const packageName = '__tube_lang__';

export const runtimeNames = {
  pipe: packageName + '.pipe',
  curry: packageName + '.curry',
  sideEffect: packageName + '.sideEffect',
  negate: packageName + '.negate',
  union: packageName + '.union',
  curriedPreffix: '__tube_curried_',
};

export const generator = ({
  curriedFns,
  pipeExpressions,
  pipeInvocations,
}: TransformedAST) => {
  return _generator({
    type: 'Program',
    childs: [...curriedFns, ...pipeExpressions, ...pipeInvocations],
  });
};

const _generator = (node: Node): string => {
  let args = '';

  switch (node.type) {
    case 'Program':
      return '\n' + node.childs.map(_generator).join('\n') + '\n';

    case 'CurryStatement':
      return `const ${getNameOfFunctionCurried(node.value)} = ${
        runtimeNames.curry
      }(${node.value});`;

    case 'PipeStatement':
      const leftHandSide = `const ${node.value}`;
      const rightHandSide = `${runtimeNames.pipe}(${node.childs
        .map(_generator)
        .join(', ')})`;

      return leftHandSide + ' = ' + rightHandSide + ';';

    case 'PipeInvocation':
      const pipeIIPE = `${runtimeNames.pipe}(${node.childs
        .map(_generator)
        .join(', ')})`;

      return pipeIIPE + '();';

    case 'Function':
      let fn = '';
      args = node.args?.map(_generator).join(', ') || '';

      if (args) {
        fn = `${getNameOfFunctionCurried(node.value)}(${args})`;
      } else {
        fn = `${node.value}`;
      }

      if (node.negated) {
        fn = `${runtimeNames.negate}(${fn})`;
      }

      if (node.else) {
        fn = `x => ${fn}(x) ? (${_generator(node.if)})(x) : (${_generator(
          node.else,
        )})(x)`;
      } else if (node.if) {
        fn = `x => ${fn}(x) ? (${_generator(node.if)})(x) : x`;
      }

      return fn;

    case 'SwitchStatement':
      const cases = node.cases.map(_generator).join(' : ');
      const defaultClause = node.default
        ? `${node.default.value}(x)`
        : 'x'
      const switchFn = cases
        ? `x => ${cases} : ${defaultClause}`
        : `x => ${defaultClause}`

      return switchFn;
    
    case 'SwitchCase':
      return `${node.predicate}(x) ? ${node.value}(x)`;

    case 'UnionStatement':
      return `${runtimeNames.union}(${node.childs.map(_generator).join(', ')})`;

    case 'Number':
    case 'Variable':
      return node.value;

    case 'String':
      return "'" + node.value + "'";

    case 'SideEffect':
      return `${runtimeNames.sideEffect}(${node.value})`;

    case 'Method':
      args = node.args?.map(_generator).join(', ') || '';

      return `x => x.${node.value}(${args})`;

    default:
      throw new SyntaxError(node.type + ' type not supported');
  }
};

const getNameOfFunctionCurried = (fn: string) =>
  `${runtimeNames.curriedPreffix}${fn}`;
