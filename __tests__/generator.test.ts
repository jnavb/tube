import { generator, runtimeNames } from '../src/compiler/generator';
import { TransformedAST } from '../src/models';

describe('Compile: common cases', () => {
  it('generates code for a pipe invocation with functions', () => {
    const input: TransformedAST = {
      type: 'Program',
      curriedFns: [],
      pipeExpressions: [],
      pipeInvocations: [
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fnOne' },
            { type: 'Function', value: 'fnTwo' },
            { type: 'Function', value: 'fnThree' },
          ],
        },
      ],
    };

    const result = generator(input);
    const expected = `
${runtimeNames.pipe}(fnOne, fnTwo, fnThree)();
`;

    expect(result).toEqual(expected);
  });

  it('generates code for a pipe invocation with functions', () => {
    const input: TransformedAST = {
      type: 'Program',
      curriedFns: [],
      pipeExpressions: [
        {
          type: 'PipeStatement',
          value: 'fnABC',
          childs: [
            { type: 'Function', value: 'fnA' },
            { type: 'Function', value: 'fnB' },
            { type: 'Function', value: 'fnC' },
          ],
        },
      ],
      pipeInvocations: [
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fnOne' },
            { type: 'Function', value: 'fnTwo' },
            { type: 'Function', value: 'fnThree' },
          ],
        },
      ],
    };

    const result = generator(input);
    const expected = `
const fnABC = ${runtimeNames.pipe}(fnA, fnB, fnC);
${runtimeNames.pipe}(fnOne, fnTwo, fnThree)();
`;

    expect(result).toEqual(expected);
  });

  it('generates code for a pipe invocation with functions', () => {
    const input: TransformedAST = {
      type: 'Program',
      curriedFns: [],
      pipeExpressions: [],
      pipeInvocations: [
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fnOne' },
            { type: 'Function', value: 'fnTwo' },
            { type: 'Function', value: 'fnThree' },
            { type: 'Method', value: 'toString' },
          ],
        },
      ],
    };

    const result = generator(input);
    const expected = `
${runtimeNames.pipe}(fnOne, fnTwo, fnThree, x => x.toString())();
`;

    expect(result).toEqual(expected);
  });

  it('generates code for a pipe invocation with side effect', () => {
    const input: TransformedAST = {
      type: 'Program',
      curriedFns: [],
      pipeExpressions: [],
      pipeInvocations: [
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fnOne' },
            { type: 'SideEffect', value: 'console.log' },
            { type: 'Function', value: 'fnTwo' },
          ],
        },
      ],
    };

    const result = generator(input);
    const expected = `
${runtimeNames.pipe}(fnOne, ${runtimeNames.sideEffect}(console.log), fnTwo)();
`;

    expect(result).toEqual(expected);
  });

  it('generates code for a pipe invocation with negation', () => {
    const input: TransformedAST = {
      type: 'Program',
      curriedFns: [],
      pipeExpressions: [],
      pipeInvocations: [
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fnOne' },
            { type: 'Function', value: 'greaterThanZero', negated: true },
            { type: 'Function', value: 'fnTwo' },
          ],
        },
      ],
    };

    const result = generator(input);
    const expected = `
${runtimeNames.pipe}(fnOne, ${runtimeNames.negate}(greaterThanZero), fnTwo)();
`;

    expect(result).toEqual(expected);
  });

  it('generates code for a pipe invocation with functions', () => {
    const input: TransformedAST = {
      type: 'Program',
      curriedFns: [{ type: 'CurryStatement', value: 'fnTwo' }],
      pipeExpressions: [],
      pipeInvocations: [
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fnOne' },
            {
              type: 'Function',
              value: 'fnTwo',
              args: [
                { type: 'String', value: 'str1' },
                { type: 'Number', value: '2' },
                { type: 'String', value: 'str3' },
                { type: 'Variable', value: 'var1' },
              ],
            },
            { type: 'Function', value: 'fnThree' },
          ],
        },
      ],
    };

    const result = generator(input);
    const expected = `
const __tube_curried_fnTwo = ${runtimeNames.curry}(fnTwo);
${runtimeNames.pipe}(fnOne, __tube_curried_fnTwo('str1', 2, 'str3', var1), fnThree)();
`;

    expect(result).toEqual(expected);
  });

  it('generates code for a pipe invocation with if/else blocks', () => {
    const input: TransformedAST = {
      type: 'Program',
      curriedFns: [],
      pipeExpressions: [],
      pipeInvocations: [
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fnOne' },
            { type: 'Function', value: 'fnTwo' },
            {
              type: 'Function',
              value: 'isA',
              if: {
                type: 'Function',
                value: 'isB',
                if: { type: 'Function', value: 'fn2aLevel' },
                else: { type: 'Function', value: 'fn2bLevel' },
              },
              else: { type: 'Function', value: 'fn1bLevel' },
            },
            { type: 'Function', value: 'fnThree' },
          ],
        },
      ],
    };

    const result = generator(input);
    const expected = `
${runtimeNames.pipe}(fnOne, fnTwo, x => isA(x) ? (x => isB(x) ? (fn2aLevel)(x) : (fn2bLevel)(x))(x) : (fn1bLevel)(x), fnThree)();
`;

    expect(result).toEqual(expected);
  });

  it('generates code for several pipe statements and pipe invocations', () => {
    const input: TransformedAST = {
      type: 'Program',
      curriedFns: [
        { type: 'CurryStatement', value: 'fnThree' },
        { type: 'CurryStatement', value: 'fnTen' },
      ],
      pipeExpressions: [
        {
          type: 'PipeStatement',
          value: 'fnPipeA',
          childs: [
            { type: 'Function', value: 'fnOneA' },
            { type: 'Function', value: 'fnTwoA' },
            { type: 'Function', value: 'fnThreeA' },
          ],
        },
        {
          type: 'PipeStatement',
          value: 'fnPipeB',
          childs: [
            { type: 'Function', value: 'fnOneB' },
            { type: 'Function', value: 'fnTwoB' },
            { type: 'Function', value: 'fnThreeB' },
          ],
        },
      ],
      pipeInvocations: [
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fnOne' },
            { type: 'Function', value: 'fnTwo' },
            { type: 'Method', value: 'methodOne' },
            { type: 'Method', value: 'methodTwo' },
            {
              type: 'Function',
              value: 'fnThree',
              args: [{ type: 'String', value: 'str1' }],
            },
            { type: 'Function', value: 'fnFour' },
            {
              type: 'Function',
              value: 'fnFive',
              negated: true,
              if: { type: 'Function', value: 'fnSix' },
              else: { type: 'Function', value: 'fnEight' },
            },
            { type: 'SideEffect', value: 'sideEffectOne' },
            { type: 'Function', value: 'fnNine.Nine' },
            {
              type: 'Function',
              value: 'fnTen',
              args: [{ type: 'Number', value: '3' }],
            },
          ],
        },
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fnEleven' },
            { type: 'Function', value: 'fnTwelve' },
          ],
        },
      ],
    };

    const result = generator(input);
    const expected = `
const __tube_curried_fnThree = ${runtimeNames.curry}(fnThree);
const __tube_curried_fnTen = ${runtimeNames.curry}(fnTen);
const fnPipeA = ${runtimeNames.pipe}(fnOneA, fnTwoA, fnThreeA);
const fnPipeB = ${runtimeNames.pipe}(fnOneB, fnTwoB, fnThreeB);
${runtimeNames.pipe}(fnOne, fnTwo, x => x.methodOne(), x => x.methodTwo(), __tube_curried_fnThree('str1'), fnFour, x => ${runtimeNames.negate}(fnFive)(x) ? (fnSix)(x) : (fnEight)(x), ${runtimeNames.sideEffect}(sideEffectOne), fnNine.Nine, __tube_curried_fnTen(3))();
${runtimeNames.pipe}(fnEleven, fnTwelve)();
`;

    expect(result).toEqual(expected);
  });

  it('generates code for a pipe invocation with union statement', () => {
    const input: TransformedAST = {
      type: 'Program',
      curriedFns: [{ type: 'CurryStatement', value: 'fnTwo' }],
      pipeExpressions: [],
      pipeInvocations: [
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fnOne' },
            {
              type: 'Function',
              value: 'fnTwo',
              args: [{ type: 'Number', value: '1' }],
            },
            {
              type: 'UnionStatement',
              childs: [
                { type: 'Function', value: 'fnUnionA' },
                { type: 'Function', value: 'fnUnionB' },
                { type: 'Function', value: 'fnUnionC' },
              ],
            },
            { type: 'Function', value: 'fnThree' },
          ],
        },
      ],
    };

    const result = generator(input);
    const expected = `
const __tube_curried_fnTwo = ${runtimeNames.curry}(fnTwo);
${runtimeNames.pipe}(fnOne, __tube_curried_fnTwo(1), ${runtimeNames.union}(fnUnionA, fnUnionB, fnUnionC), fnThree)();
`;

    expect(result).toEqual(expected);
  });

  it('should throw an error when is an unkown node type', () => {
    const input: TransformedAST = {
      type: 'Program',
      curriedFns: [{ type: 'UnkownNodeType' as any, value: 'fnTwo' }],
      pipeExpressions: [],
      pipeInvocations: [],
    };

    expect(() => generator(input)).toThrowError(
      ` type not supported`,
    );
  });
});
