import { compile } from '../src/compiler/compile';
import { runtimeNames } from '../src/compiler/generator';

describe('Compile: common cases', () => {
  it('compiles a pipe invocation with functions', () => {
    const input = `
fnOne
fnTwo
fnThree
`;

    const result = compile(input);
    const expected = `
${runtimeNames.pipe}(fnOne, fnTwo, fnThree)();
`;

    expect(result).toEqual(expected);
  });

  it('compiles a pipe invocation with pipe statement and a pipe invocation', () => {
    const input = `
-> fnABC
    fnA
    fnB
    fnC

fnOne
fnTwo
fnThree
fnABC
`;

    const result = compile(input);
    const expected = `
const fnABC = ${runtimeNames.pipe}(fnA, fnB, fnC);
${runtimeNames.pipe}(fnOne, fnTwo, fnThree, fnABC)();
`;

    expect(result).toEqual(expected);
  });

  it('compiles a pipe invocation with a method', () => {
    const input = `
fnOne
fnTwo
fnThree
::toString
`;

    const result = compile(input);
    const expected = `
${runtimeNames.pipe}(fnOne, fnTwo, fnThree, x => x.toString())();
`;

    expect(result).toEqual(expected);
  });

  it('compiles a pipe invocation with a method with arguments', () => {
    const input = `
fnOne
fnTwo
fnThree
::map to ids
`;

    const result = compile(input);
    const expected = `
${runtimeNames.pipe}(fnOne, fnTwo, fnThree, x => x.map(ids))();
`;

    expect(result).toEqual(expected);
  });

  it('compiles a pipe invocation with a side effect', () => {
    const input = `
fnOne
fnTwo
fnThree
< console.log >
fnFour
`;

    const result = compile(input);
    const expected = `
${runtimeNames.pipe}(fnOne, fnTwo, fnThree, ${runtimeNames.sideEffect}(console.log), fnFour)();
`;

    expect(result).toEqual(expected);
  });

  it('compiles a pipe invocation with a function negation', () => {
    const input = `
fnOne
fnTwo
aint fnThree
fnFour
`;

    const result = compile(input);
    const expected = `
${runtimeNames.pipe}(fnOne, fnTwo, ${runtimeNames.negate}(fnThree), fnFour)();
`;

    expect(result).toEqual(expected);
  });

  it('compiles a pipe invocation with a function with arguments', () => {
    const input = `
fnOne
fnTwo with 'str1' and var2 and 3
fnThree
`;

    const result = compile(input);
    const expected = `
const __tube_curried_fnTwo = ${runtimeNames.curry}(fnTwo);
${runtimeNames.pipe}(fnOne, __tube_curried_fnTwo('str1', var2, 3), fnThree)();
`;

    expect(result).toEqual(expected);
  });

  it('compiles several pipe invocations with nested if else clauses', () => {
    const input = `
fnOne
fnTwo
fnThree
    : fn1A
    : fn1B
fnFour

fnOne
fnTwo
fnThree
    : fn1A
        : fn2A
        : fn2B
    : fn1B
fnFour
`;

    const result = compile(input);
    const expected = `
${runtimeNames.pipe}(fnOne, fnTwo, x => fnThree(x) ? (fn1A)(x) : (fn1B)(x), fnFour)();
${runtimeNames.pipe}(fnOne, fnTwo, x => fnThree(x) ? (x => fn1A(x) ? (fn2A)(x) : (fn2B)(x))(x) : (fn1B)(x), fnFour)();
`;

    expect(result).toEqual(expected);
  });

  it('compiles a pipe invocation with union statement', () => {
    const input = `
fnOne
fnTwo with 1
    U fnUnionA
    U fnUnionB
    U fnUnionC
fnThree
`;

    const result = compile(input);
    const expected = `
const __tube_curried_fnTwo = ${runtimeNames.curry}(fnTwo);
${runtimeNames.pipe}(fnOne, __tube_curried_fnTwo(1), ${runtimeNames.union}(fnUnionA, fnUnionB, fnUnionC), fnThree)();
`;

    expect(result).toEqual(expected);
  });

  it('compiles a pipe statement with only union statement', () => {
    const input = `
-> fnPipeA
    U fnUnionA
    U fnUnionB
    U fnUnionC

state
fnPipeA
`;

    const result = compile(input);
    const expected = `
const fnPipeA = ${runtimeNames.pipe}(${runtimeNames.union}(fnUnionA, fnUnionB, fnUnionC));
${runtimeNames.pipe}(state, fnPipeA)();
`;

    expect(result).toEqual(expected);
  });

  it('compiles a pipe invocation with pipe statements and pipe invocations', () => {
    const input = `
-> fnPipeA
    fnOneA
    fnTwoA
    fnThreeA

-> fnPipeB
    fnOneB
    fnTwoB
    fnThreeB

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
`;

    const result = compile(input);
    const expected = `
const __tube_curried_match = ${runtimeNames.curry}(match);
const __tube_curried_divide = ${runtimeNames.curry}(divide);
const fnPipeA = ${runtimeNames.pipe}(fnOneA, fnTwoA, fnThreeA);
const fnPipeB = ${runtimeNames.pipe}(fnOneB, fnTwoB, fnThreeB);
${runtimeNames.pipe}(state, toSomething, sum, oneHundredOrMore, x => x.toString(), x => x.concat(), __tube_curried_match('hello'), trace, x => ${runtimeNames.negate}(allUppercase)(x) ? (fnOne)(x) : (fnTwo)(x), trace, ${runtimeNames.sideEffect}(console.log), JSON.stringify, __tube_curried_divide(3))();
`;

    expect(result).toEqual(expected);
  });

  it('compiles a pipe invocation with a switch block', () => {
    const input = `
state
pick 'n1'
    : isGreaterThanZero : addFour
    : isLessThanZero : addOne
    : isZero : addThree
`;

    const result = compile(input);
    const expected = `
const __tube_curried_pick = ${runtimeNames.curry}(pick);
${runtimeNames.pipe}(state, __tube_curried_pick('n1'), x => isGreaterThanZero(x) ? addFour(x) : isLessThanZero(x) ? addOne(x) : isZero(x) ? addThree(x) : x)();
`;

    expect(result).toEqual(expected);
  });

  it('compiles a pipe invocation with a switch block and a default clause', () => {
    const input = `
state
pick 'n1'
    : isGreaterThanZero : addFour
    : default : addThree
    : isLessThanZero : addOne
`;

    const result = compile(input);
    const expected = `
const __tube_curried_pick = ${runtimeNames.curry}(pick);
${runtimeNames.pipe}(state, __tube_curried_pick('n1'), x => isGreaterThanZero(x) ? addFour(x) : isLessThanZero(x) ? addOne(x) : addThree(x))();
`;

    expect(result).toEqual(expected);
  });

  it('compiles a pipe invocation with a switch block and a standalone default clause', () => {
    const input = `
state
pick 'n1'
    : default : addThree
`;

    const result = compile(input);
    const expected = `
const __tube_curried_pick = ${runtimeNames.curry}(pick);
${runtimeNames.pipe}(state, __tube_curried_pick('n1'), x => addThree(x))();
`;

    expect(result).toEqual(expected);
  });
});
