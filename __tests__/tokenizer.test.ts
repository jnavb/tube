import { tokenizer } from '../src/compiler/tokenizer';
import { Token } from '../src/models';

describe('Tokenizer: common cases', () => {
  it('tokenize a pipe invocation with functions', () => {
    const input = `
fnOne
fnTwo
fnThree
`;

    const result = tokenizer(input);
    const desired: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnThree' },
      { type: 'NewLine', level: 0 },
    ];

    expect(result).toStrictEqual(desired);
  });

  it('tokenize a pipe declaration with functions', () => {
    const input = `
-> fnPipe
    fnOne
    fnTwo
    fnThree
`;

    const result = tokenizer(input);
    const desired: Token[] = [
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

    expect(result).toStrictEqual(desired);
  });

  it('tokenize a pipe invocation with a method', () => {
    const input = `
fnOne
fnTwo
fnThree
::toString
`;

    const result = tokenizer(input);
    const desired: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnThree' },
      { type: 'NewLine', level: 0 },
      { type: 'Method', value: 'toString' },
      { type: 'NewLine', level: 0 },
    ];

    expect(result).toStrictEqual(desired);
  });

  it('tokenize a pipe invocation with a method with arguments', () => {
    const input = `
fnOne
fnTwo
::toString with 2 and 'str1' and var1
`;

    const result = tokenizer(input);
    const desired: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 0 },
      { type: 'Method', value: 'toString' },
      { type: 'Number', value: '2' },
      { type: 'String', value: 'str1' },
      { type: 'Variable', value: 'var1' },
      { type: 'NewLine', level: 0 },
    ];

    expect(result).toStrictEqual(desired);
  });

  it('tokenize a pipe invocation with a side effect', () => {
    const input = `
fnOne
fnTwo
fnThree
< console.log >
fnFour
`;

    const result = tokenizer(input);
    const desired: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnThree' },
      { type: 'NewLine', level: 0 },
      { type: 'SideEffect', value: 'console.log' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnFour' },
      { type: 'NewLine', level: 0 },
    ];

    expect(result).toStrictEqual(desired);
  });

  it('tokenize a pipe invocation with a function negation', () => {
    const input = `
fnOne
fnTwo
aint greaterThanZero
fnFour
`;

    const result = tokenizer(input);
    const desired: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 0 },
      { type: 'Negation' },
      { type: 'Function', value: 'greaterThanZero' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnFour' },
      { type: 'NewLine', level: 0 },
    ];

    expect(result).toStrictEqual(desired);
  });

  it('tokenize a pipe invocation with a brancher', () => {
    const input = `
fnOne
fnTwo
    : fnThree
    : fnFour
fnFive
`;

    const result = tokenizer(input);
    const desired: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnThree' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnFour' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnFive' },
      { type: 'NewLine', level: 0 },
    ];

    expect(result).toStrictEqual(desired);
  });

  it('tokenize several pipe invocations', () => {
    const input = `
fnOne
fnTwo
greaterThanZero
    : fnFour
    : fnFive
fnSix

fnOne
fnTwo
greaterThanZero
    : fnFour
    : fnFive
fnSix
`;

    const result = tokenizer(input);
    const desired: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'greaterThanZero' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnFour' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnFive' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnSix' },
      { type: 'EmptyLine' },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'greaterThanZero' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnFour' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnFive' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnSix' },
      { type: 'NewLine', level: 0 },
    ];

    expect(result).toStrictEqual(desired);
  });

  it('tokenize a pipe invocation with a function call with variable as arg', () => {
    const input = `
fnOne
fnTwo with var1 and 'input2' and 2
fnThree
`;

    const result = tokenizer(input);
    const desired: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'Variable', value: 'var1' },
      { type: 'String', value: 'input2' },
      { type: 'Number', value: '2' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnThree' },
      { type: 'NewLine', level: 0 },
    ];

    expect(result).toStrictEqual(desired);
  });

  it('tokenize several pipe invocations with all the language features', () => {
    const input = `
state
toSomething
sum
oneHundredOrMore
::toString
::concat
match with 'hello'
trace
isnt allUppercase
    : fnOne
    : fnTwo
trace
< console.log >
JSON.stringify
divide by 3

stateTwo
fnOne
fnTwo
`;

    const result = tokenizer(input);
    const desired: Token[] = [
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
      { type: 'Function', value: 'match' },
      { type: 'String', value: 'hello' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'trace' },
      { type: 'NewLine', level: 0 },
      { type: 'Negation' },
      { type: 'Function', value: 'allUppercase' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'trace' },
      { type: 'NewLine', level: 0 },
      { type: 'SideEffect', value: 'console.log' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'JSON.stringify' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'divide' },
      { type: 'Number', value: '3' },
      { type: 'EmptyLine' },
      { type: 'Function', value: 'stateTwo' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 0 },
    ];

    expect(result).toStrictEqual(desired);
  });

  it('tokenize a pipe invocation with a switch block', () => {
    const input = `
fnOne
getOne
    : isA : fnA
    : isB : fnB
    : isC : fnC
fnTwo
`;

    const result = tokenizer(input);
    const desired: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'getOne' },
      { type: 'NewLine', level: 1 },
      { type: 'SwitchCase', case: 'isA', value: 'fnA' },
      { type: 'NewLine', level: 1 },
      { type: 'SwitchCase', case: 'isB', value: 'fnB' },
      { type: 'NewLine', level: 1 },
      { type: 'SwitchCase', case: 'isC', value: 'fnC' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 0 },
    ];

    expect(result).toStrictEqual(desired);
  });

  it('tokenize a pipe invocation with a union block', () => {
    const input = `
fnOne
fnTwo
    U fnUnionOne
    U fnUnionTwo
    U fnUnionThree
fnThree
`;

    const result = tokenizer(input);
    const desired: Token[] = [
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

    expect(result).toStrictEqual(desired);
  });
});

describe('Tokenizer: edge cases for methods', () => {
  it('should throw an error for a method with emtpy spaces after ::', () => {
    const input = `
fnOne
fnTwo
:: fnThree
`;

    expect(() => tokenizer(input)).toThrowError(
      `Line 3 Char 2 🔴 Method invocation not allowed with empty spaces after '::'`,
    );
  });
});

describe('Tokenizer: edge cases for arguments', () => {
  it('should tokenize correctly verbose and non verbose arguments', () => {
    const nonVerbose = tokenizer(`
fnOne
fnTwo var1 'str1' 2
`);

    const verbose = tokenizer(`
fnOne
fnTwo with var1 with 'str1' by 2
`);

    expect(verbose).toStrictEqual(nonVerbose);
  });
});

describe('Tokenizer: edge cases for side effects', () => {
  it('should throw an error for a side effect without closing clause', () => {
    const input = `
fnOne
fnTwo
< console.log
`;

    expect(() => tokenizer(input)).toThrowError(
      `Line 3 Char 14 🔴 Side effect clause not closed`,
    );
  });

  it('should throw an error for a side effect with not correct starting spacing format', () => {
    const input = `
fnOne
fnTwo
<  console.log >
`;

    expect(() => tokenizer(input)).toThrowError(
      `Line 3 Char 2 🔴 Side effect call format not allowed`,
    );
  });

  it('should throw an error for a side effect with not correct final spacing format', () => {
    const input = `
fnOne
fnTwo
< console.log  >
`;

    expect(() => tokenizer(input)).toThrowError(
      `Line 3 Char 14 🔴 Side effect call format not allowed`,
    );
  });

  describe('Tokenizer: edge cases for negations', () => {
    it('should throw an error for two negations in a row', () => {
      const input = `
fnOne
aint aint console.log
`;

      expect(() => tokenizer(input)).toThrowError(
        `Line 2 Char 9 🔴 More than one sucesive negation not allowed`,
      );
    });
  });
});

describe('Tokenizer: edge cases for functions', () => {
  it('should parse functions inside an object', () => {
    const input = `
state
JSON.stringify
`;

    const result = tokenizer(input);
    const desired: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'state' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'JSON.stringify' },
      { type: 'NewLine', level: 0 },
    ];

    expect(result).toStrictEqual(desired);
  });

  it('should parse function with number', () => {
    const input = `
state
fn1
`;

    const result = tokenizer(input);
    const desired: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'state' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fn1' },
      { type: 'NewLine', level: 0 },
    ];

    expect(result).toStrictEqual(desired);
  });

  it('should parse function with uppercase letters', () => {
    const input = `
state
fnONE
`;

    const result = tokenizer(input);
    const desired: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'state' },
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnONE' },
      { type: 'NewLine', level: 0 },
    ];

    expect(result).toStrictEqual(desired);
  });
});

describe('Tokenizer: misc edge cases', () => {
  it('should parse a pipe invocation without break line at the start of the script', () => {
    const input = `fnOne
`;

    const result = tokenizer(input);
    const desired: Token[] = [
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
    ];

    expect(result).toStrictEqual(desired);
  });

  it('should parse a pipe invocation without break line at the end of the script', () => {
    const input = `
fnOne
`;

    const result = tokenizer(input);
    const desired: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 0 },
    ];

    expect(result).toStrictEqual(desired);
  });
});

describe('Tokenizer: edge cases for indentation', () => {
  it('tokenize a indentation with spaces', () => {
    const input = `
fnOne
    : fnTwo
    : fnThree
`;

    const result = tokenizer(input);
    const desired: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnThree' },
      { type: 'NewLine', level: 0 },
    ];

    expect(result).toStrictEqual(desired);
  });

  it('tokenize a indentation with tabs', () => {
    const input = `
fnOne
	: fnTwo
	: fnThree
`;

    const result = tokenizer(input);
    const desired: Token[] = [
      { type: 'NewLine', level: 0 },
      { type: 'Function', value: 'fnOne' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnTwo' },
      { type: 'NewLine', level: 1 },
      { type: 'Function', value: 'fnThree' },
      { type: 'NewLine', level: 0 },
    ];

    expect(result).toStrictEqual(desired);
  });

  it('tokenize a pipe invocation with a brancher', () => {
    const input = `
fnOne
fnTwo
: fnThree
: fnFour
fnFive
`;

    expect(() => tokenizer(input)).toThrowError(
      `Line 3 Char 1 🔴 Invalid indentation for a conditional clause`,
    );
  });
});
