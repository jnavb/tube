import { parser } from '../src/compiler/parser';
import { AST, Token } from '../src/models';

describe('AST: common cases', () => {
  it('should parse some functions', () => {
    const input: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnThree' },
      { type: 'EmptyLine' },
    ];

    const result = parser(input);
    const expected: AST = {
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

  it('should parse a pipe invocation with a method with arguments', () => {
    const input: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 0 },
      { type: 'Method', value: 'methodOne' },
      { type: 'Number', value: '2' },
      { type: 'Variable', value: 'var1' },
      { type: 'String', value: 'str1' },
      { type: 'NewLine', level: 0 },
    ];

    const result = parser(input);
    const expected = {
      type: 'Program',
      childs: [
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fnOne' },
            { type: 'Function', value: 'fnTwo' },
            {
              type: 'Method',
              value: 'methodOne',
              args: [
                { type: 'Number', value: '2' },
                { type: 'Variable', value: 'var1' },
                { type: 'String', value: 'str1' },
              ],
            },
          ],
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  it('should parse two pipes of functions', () => {
    const input: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'EmptyLine' },
      { type: 'Function', value: 'fnThree' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnFour' },
      { type: 'EmptyLine' },
    ];

    const result = parser(input);
    const expected: AST = {
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
            },
          ],
        },
        {
          type: 'PipeInvocation',
          childs: [
            {
              type: 'Function',
              value: 'fnThree',
            },
            {
              type: 'Function',
              value: 'fnFour',
            },
          ],
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  it('should parse a pipe with functions, side-effects, methods...', () => {
    const input: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'state' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'toSomething' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'sum' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'oneHundredOrMore' },
      { type: 'NewLine', level: 0 },
      { type: 'Method', value: 'toString' },
      { type: 'NewLine', level: 0 },
      { type: 'Method', value: 'concat' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'trace' },
      { type: 'NewLine', level: 0 },
      { type: 'Negation' },
      { type: 'Function', value: 'allUppercase' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'trace' },
      { type: 'NewLine', level: 0 },
      { type: 'SideEffect', value: 'console.log' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'JSON.stringify' },
      { type: 'EmptyLine' },
    ];

    const result = parser(input);
    const expected: AST = {
      type: 'Program',
      childs: [
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'state' },
            { type: 'Function', value: 'toSomething' },
            { type: 'Function', value: 'sum' },
            { type: 'Function', value: 'oneHundredOrMore' },
            { type: 'Method', value: 'toString' },
            { type: 'Method', value: 'concat' },
            { type: 'Function', value: 'trace' },
            { type: 'Function', value: 'allUppercase', negated: true },
            { type: 'Function', value: 'trace' },
            { type: 'SideEffect', value: 'console.log' },
            { type: 'Function', value: 'JSON.stringify' },
          ],
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  it('should parse string, number and variable arguments', () => {
    const input: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fn1' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fn2' },
      { type: 'String', value: 'arg1' },
      { type: 'Number', value: '1' },
      { type: 'Variable', value: 'var1' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fn3' },
      { type: 'Number', value: '1' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fn4' },
      { type: 'String', value: 'arg2' },
      { type: 'Number', value: '2' },
      { type: 'EmptyLine' },
    ];

    const result = parser(input);
    const expected: AST = {
      type: 'Program',
      childs: [
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fn1' },
            {
              type: 'Function',
              value: 'fn2',
              args: [
                { type: 'String', value: 'arg1' },
                { type: 'Number', value: '1' },
                { type: 'Variable', value: 'var1' },
              ],
            },
            {
              type: 'Function',
              value: 'fn3',
              args: [{ type: 'Number', value: '1' }],
            },
            {
              type: 'Function',
              value: 'fn4',
              args: [
                { type: 'String', value: 'arg2' },
                { type: 'Number', value: '2' },
              ],
            },
          ],
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  it('should parse a switch block', () => {
    const input: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fn1' },
      { type: 'NewLine', level: 1 },
      { type: 'SwitchCase', case: 'isA', value: 'fnA' },
      { type: 'NewLine', level: 1 },
      { type: 'SwitchCase', case: 'isB', value: 'fnB' },
      { type: 'NewLine', level: 1 },
      { type: 'SwitchCase', case: 'isC', value: 'fnC' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fn2' },
      { type: 'EmptyLine' },
      { type: 'Negation' },
      { type: 'Function', value: 'allUppercase' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'trace' },
      { type: 'NewLine', level: 0 },
      { type: 'SideEffect', value: 'console.log' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'JSON.stringify' },
      { type: 'EmptyLine' },
    ];

    const result = parser(input);
    const expected: AST = {
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
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'allUppercase', negated: true },
            { type: 'Function', value: 'trace' },
            { type: 'SideEffect', value: 'console.log' },
            { type: 'Function', value: 'JSON.stringify' },
          ],
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  it('should parse multiple nested if/else blocks', () => {
    const input: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnA' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnB' },
      { type: 'NewLine', level: 2 },
      { type: 'Function', value: 'fnC' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnD' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnE' },
      { type: 'EmptyLine' },
      { type: 'Function', value: 'fnF' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnG' },
    ];

    const result = parser(input);
    const expected: AST = {
      type: 'Program',
      childs: [
        {
          type: 'PipeInvocation',
          childs: [
            {
              type: 'Function',
              value: 'fnA',
              if: {
                type: 'Function',
                value: 'fnB',
                if: { type: 'Function', value: 'fnC' },
              },
              else: { type: 'Function', value: 'fnD' },
            },
            { type: 'Function', value: 'fnE' },
          ],
        },
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fnF' },
            { type: 'Function', value: 'fnG' },
          ],
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  it('should parse if/else blocks with args', () => {
    const input: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnA' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnB' },
      { type: 'String', value: 'input1' },
      { type: 'Number', value: '2' },
      { type: 'String', value: 'input3' },
      { type: 'NewLine', level: 2 },
      { type: 'Function', value: 'fnC' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnD' },
      { type: 'String', value: 'input1' },
      { type: 'String', value: 'input2' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnE' },
      { type: 'EmptyLine' },
      { type: 'Function', value: 'fnF' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnG' },
    ];

    const result = parser(input);
    const expected: AST = {
      type: 'Program',
      childs: [
        {
          type: 'PipeInvocation',
          childs: [
            {
              type: 'Function',
              value: 'fnA',
              if: {
                type: 'Function',
                value: 'fnB',
                args: [
                  { type: 'String', value: 'input1' },
                  { type: 'Number', value: '2' },
                  { type: 'String', value: 'input3' },
                ],
                if: { type: 'Function', value: 'fnC' },
              },
              else: {
                type: 'Function',
                value: 'fnD',
                args: [
                  { type: 'String', value: 'input1' },
                  { type: 'String', value: 'input2' },
                ],
              },
            },
            { type: 'Function', value: 'fnE' },
          ],
        },
        {
          type: 'PipeInvocation',
          childs: [
            { type: 'Function', value: 'fnF' },
            { type: 'Function', value: 'fnG' },
          ],
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  it('should parse a pipe statement', () => {
    const input: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Arrow' },
      { type: 'Function', value: 'fnPipe' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnThree' },
      { type: 'NewLine', level: 0 },
    ];

    const result = parser(input);
    const expected: AST = {
      type: 'Program',
      childs: [
        {
          type: 'PipeStatement',
          value: 'fnPipe',
          childs: [
            { type: 'Function', value: 'fnOne' },
            { type: 'Function', value: 'fnTwo' },
            { type: 'Function', value: 'fnThree' },
          ],
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  it('should parse two pipe statements', () => {
    const input: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Arrow' },
      { type: 'Function', value: 'fnPipe' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnThree' },
      { type: 'EmptyLine' },
      { type: 'Arrow' },
      { type: 'Function', value: 'fnPipe' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnThree' },
    ];

    const result = parser(input);
    const expected: AST = {
      type: 'Program',
      childs: [
        {
          type: 'PipeStatement',
          value: 'fnPipe',
          childs: [
            { type: 'Function', value: 'fnOne' },
            { type: 'Function', value: 'fnTwo' },
            { type: 'Function', value: 'fnThree' },
          ],
        },
        {
          type: 'PipeStatement',
          value: 'fnPipe',
          childs: [
            { type: 'Function', value: 'fnOne' },
            { type: 'Function', value: 'fnTwo' },
            { type: 'Function', value: 'fnThree' },
          ],
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  it('should parse a pipe statement and a pipe invocation', () => {
    const input: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Arrow' },
      { type: 'Function', value: 'fnPipe' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnThree' },
      { type: 'EmptyLine' },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnThree' },
      { type: 'EmptyLine' },
    ];

    const result = parser(input);
    const expected: AST = {
      type: 'Program',
      childs: [
        {
          type: 'PipeStatement',
          value: 'fnPipe',
          childs: [
            { type: 'Function', value: 'fnOne' },
            { type: 'Function', value: 'fnTwo' },
            { type: 'Function', value: 'fnThree' },
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
          ],
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  it('should parse a union statement', () => {
    const input: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 1 },
      { type: 'Union' },
      { type: 'Function', value: 'fnUnionOne' },
      { type: 'NewLine', level: 1 },
      { type: 'Union' },
      { type: 'Function', value: 'fnUnionTwo' },
      { type: 'NewLine', level: 1 },
      { type: 'Union' },
      { type: 'Function', value: 'fnUnionThree' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnThree' },
      { type: 'NewLine', level: 0 },
    ];

    const result = parser(input);
    const expected: AST = {
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

    expect(result).toStrictEqual(expected);
  });

  it('should throw an error when is an unkown token', () => {
    const input: Token[] = [
      { type: 'TypeNotSupported' as any, value: 'fnOne' },
    ];

    expect(() => parser(input)).toThrowError(
      `token type not supported`,
    );
  });

  it('should throw an error when is an unkown token', () => {
    const input: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Arrow' },
      { type: 'Negation', value: 'fnPipe' },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 1 },
    ];

    expect(() => parser(input)).toThrowError(
      `Invalid PipeStatement format`,
    );
  });
});

describe('AST: edge cases for NewLine and EmptyLine', () => {
  it('should parse without a final EmptyLine', () => {
    const input: Token[] = [
      { type: 'EmptyLine' },
      { type: 'Function', value: 'fnOne' },
    ];

    const result = parser(input);
    const expected: AST = {
      type: 'Program',
      childs: [
        {
          type: 'PipeInvocation',
          childs: [
            {
              type: 'Function',
              value: 'fnOne',
            },
          ],
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  it('should parse without a starting and final EmptyLine', () => {
    const input: Token[] = [{ type: 'Function', value: 'fnOne' }];

    const result = parser(input);
    const expected: AST = {
      type: 'Program',
      childs: [
        {
          type: 'PipeInvocation',
          childs: [
            {
              type: 'Function',
              value: 'fnOne',
            },
          ],
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  it('should parse with multiple NewLines', () => {
    const input: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'NewLine', level: 0 },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
    ];

    const result = parser(input);
    const expected: AST = {
      type: 'Program',
      childs: [
        {
          type: 'PipeInvocation',
          childs: [
            {
              type: 'Function',
              value: 'fnOne',
            },
          ],
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });
});
