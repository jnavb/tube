import { transformer } from '../src/compiler/transformer';
import { AST, TransformedAST } from '../src/models';

describe('Transformer: common cases', () => {
  it('should transform a pipe invocation and a pipe composition', () => {
    const input: AST = {
      type: 'Program',
      childs: [
        {
          type: 'PipeStatement',
          value: 'fnABC',
          childs: [
            {
              type: 'Function',
              value: 'fnA',
            },
            {
              type: 'Function',
              value: 'fnB',
            },
            {
              type: 'Function',
              value: 'fnC',
            },
          ],
        },
        {
          type: 'PipeInvocation',
          childs: [
            {
              type: 'Function',
              value: 'fnOne',
            },
            {
              type: 'Function',
              value: 'fnTwo',
            },
            {
              type: 'Function',
              value: 'fnThree',
            },
            {
              type: 'Function',
              value: 'fnABC',
            },
          ],
        },
      ],
    };

    const result = transformer(input);
    const expected: TransformedAST = {
      type: 'Program',
      curriedFns: [],
      pipeExpressions: [
        {
          type: 'PipeStatement',
          value: 'fnABC',
          childs: [
            {
              type: 'Function',
              value: 'fnA',
            },
            {
              type: 'Function',
              value: 'fnB',
            },
            {
              type: 'Function',
              value: 'fnC',
            },
          ],
        },
      ],
      pipeInvocations: [
        {
          type: 'PipeInvocation',
          childs: [
            {
              type: 'Function',
              value: 'fnOne',
            },
            {
              type: 'Function',
              value: 'fnTwo',
            },
            {
              type: 'Function',
              value: 'fnThree',
            },
            {
              type: 'Function',
              value: 'fnABC',
            },
          ],
        },
      ],
    };

    expect(result).toEqual(expected);
  });

  it('should transform a pipe invocation with number arguments', () => {
    const input: AST = {
      type: 'Program',
      childs: [
        {
          type: 'PipeInvocation',
          childs: [
            {
              type: 'Function',
              value: 'fnOne',
            },
            {
              type: 'Function',
              value: 'fnTwo',
              args: [
                {
                  type: 'Number',
                  value: '1',
                },
                {
                  type: 'Variable',
                  value: 'var1',
                },
                {
                  type: 'String',
                  value: 'str1',
                },
              ],
            },
            {
              type: 'Function',
              value: 'fnThree',
            },
          ],
        },
      ],
    };

    const result = transformer(input);
    const expected: TransformedAST = {
      type: 'Program',
      curriedFns: [
        {
          type: 'CurryStatement',
          value: 'fnTwo',
        },
      ],
      pipeExpressions: [],
      pipeInvocations: [
        {
          type: 'PipeInvocation',
          childs: [
            {
              type: 'Function',
              value: 'fnOne',
            },

            {
              type: 'Function',
              value: 'fnTwo',
              args: [
                {
                  type: 'Number',
                  value: '1',
                },
                {
                  type: 'Variable',
                  value: 'var1',
                },
                {
                  type: 'String',
                  value: 'str1',
                },
              ],
            },
            {
              type: 'Function',
              value: 'fnThree',
            },
          ],
        },
      ],
    };

    expect(result).toEqual(expected);
  });

  it('should transform a union statement', () => {
    const input: AST = {
      type: 'Program',
      childs: [
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fnOne' },
            { type: 'Function', value: 'fnTwo' },
            {
              type: 'UnionStatement',
              childs: [
                { type: 'Function', value: 'fnUnionOne' },
                { type: 'Function', value: 'fnUnionTwo' },
                { type: 'Function', value: 'fnUnionThree' },
              ],
            },
            { type: 'Function', value: 'fnThree' },
          ],
        },
      ],
    };

    const result = transformer(input);
    const expected: TransformedAST = {
      type: 'Program',
      curriedFns: [],
      pipeExpressions: [],
      pipeInvocations: [
        {
          type: 'PipeInvocation',
          childs: [
            {
              type: 'Function',
              value: 'fnOne',
            },
            {
              type: 'Function',
              value: 'fnTwo',
            },
            {
              type: 'UnionStatement',
              childs: [
                {
                  type: 'Function',
                  value: 'fnUnionOne',
                },
                {
                  type: 'Function',
                  value: 'fnUnionTwo',
                },
                {
                  type: 'Function',
                  value: 'fnUnionThree',
                },
              ],
            },
            {
              type: 'Function',
              value: 'fnThree',
            },
          ],
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  it('should transform a method', () => {
    const input: AST = {
      type: 'Program',
      childs: [
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

    const result = transformer(input);
    const expected: TransformedAST = {
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

    expect(result).toStrictEqual(expected);
  });

  it('should transform a pipe with string arguments', () => {
    const input: AST = {
      type: 'Program',
      childs: [
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fnOne' },
            {
              type: 'Function',
              value: 'fnTwo',
              args: [
                {
                  type: 'String',
                  value: 'input1',
                },
                {
                  type: 'Number',
                  value: '2',
                },
                {
                  type: 'String',
                  value: 'input3',
                },
              ],
            },
            { type: 'Function', value: 'fnThree' },
          ],
        },
      ],
    };

    const result = transformer(input);
    const expected: TransformedAST = {
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
                { type: 'String', value: 'input1' },
                { type: 'Number', value: '2' },
                { type: 'String', value: 'input3' },
              ],
            },
            { type: 'Function', value: 'fnThree' },
          ],
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  it('should transform a pipe with a side effect', () => {
    const input: AST = {
      type: 'Program',
      childs: [
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fnOne' },
            { type: 'SideEffect', value: 'sideEffectOne' },
            {
              type: 'Function',
              value: 'fnTen',
              args: [{ type: 'Number', value: '3' }],
            },
          ],
        },
      ],
    };

    const result = transformer(input);
    const expected: TransformedAST = {
      type: 'Program',
      curriedFns: [
        {
          type: 'CurryStatement',
          value: 'fnTen',
        },
      ],
      pipeExpressions: [],
      pipeInvocations: [
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fnOne' },
            { type: 'SideEffect', value: 'sideEffectOne' },
            {
              type: 'Function',
              value: 'fnTen',
              args: [{ type: 'Number', value: '3' }],
            },
          ],
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  it('should transform a pipe with a switch block', () => {
    const input: AST = {
      type: 'Program',
      childs: [
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fn1' },
            {
              type: 'SwitchStatement',
              cases: [
                { type: 'SwitchCase', predicate: 'isA', value: 'fnA' },
                { type: 'SwitchCase', predicate: 'isB', value: 'fnB' },
                { type: 'SwitchCase', predicate: 'isC', value: 'fnC' },
              ],
            },
            { type: 'Function', value: 'fn2' },
          ],
        },
      ],
    };

    const result = transformer(input);
    const expected: TransformedAST = {
      type: 'Program',
      curriedFns: [],
      pipeExpressions: [],
      pipeInvocations: [
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fn1' },
            {
              type: 'SwitchStatement',
              cases: [
                { type: 'SwitchCase', predicate: 'isA', value: 'fnA' },
                { type: 'SwitchCase', predicate: 'isB', value: 'fnB' },
                { type: 'SwitchCase', predicate: 'isC', value: 'fnC' },
              ],
            },
            { type: 'Function', value: 'fn2' },
          ],
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  it('should throw an error when is an unkown node type', () => {
    const input: AST = {
      type: 'Program',
      childs: [
        {
          type: 'UnkownNodeType' as any,
          childs: [],
        },
      ],
    };

    expect(() => transformer(input)).toThrowError(
      ` type not supported`,
    );
  });
});
