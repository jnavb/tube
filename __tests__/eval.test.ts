import { compile } from '../src/compiler/compile';
import * as tube from '../src/main';

const state = () => ({
  n0: 0,
  n1: 1,
  n2: 2,
  str1: 'str1',
  str2: 'str2',
  arr1: [1, 2, 3],
  arr2: ['a', 'b', 'c'],
  obj1: { a: 1, b: 'b', c: [4, 5, 6] },
  obj2: { c: 1, d: 'd', f: [] },
  a: { b: 22 },
  b: { a: 33 },
  fn1: () => {},
});

type Mock = ReturnType<typeof state>;

const state$ = () => state();
const getN1 = ({ n1 }: Mock) => n1;
const getN2 = ({ n2 }: Mock) => n2;
const getStr1 = ({ str1 }: Mock) => str1;
const getStr2 = ({ str2 }: Mock) => str2;
const getArr1 = ({ arr1 }: Mock) => arr1;
const getArr2 = ({ arr2 }: Mock) => arr2;
const getObj1 = ({ obj1 }: Mock) => obj1;
const getObj2 = ({ obj2 }: Mock) => obj2;
const getArrC = ({ c }: Mock['obj1']) => c;
const getFn1 = ({ fn1 }: Mock) => fn1;
const getTrue = () => true;
const getFalse = () => false;
const getNull = () => null;
const getUndefined = () => undefined;
const pick = (props) => (obj) =>
  props.split('.').reduce((acc, v) => acc[v], obj);
const pickVariadic = (...props) => (obj) =>
  props.reduce((acc, v) => acc[v], obj);
const isGreaterThanZero = (n) => n > 0;
const isLessThanZero = (n) => n < 0;

const isString = (v: any): v is string => typeof v === 'string';
const isArray = (v: any): v is unknown[] => Array.isArray(v);
const isEmpty = (v: unknown[]) => Boolean(v.length);
const noop = (v) => v;
const booleanFactory = (v: boolean) => () => v;

const append = (str: string) => (v: string) => v + str;
const appendHello = append('hello');

const first = (v: any[]) => v[0];
const last = (v: any[]) => v[v.length - 1];
const returnFalse = () => false;
const sum = (a: number, b: number) => a + b;
const subtract = (a, b) => a - b
const addFour = (a: number) => a + 4;
const addOne = (a: number) => a + 1;
const duplicateArr = (arr: any[]) => arr.concat(arr);
const returnThirdArgument = (obj, _, b) => obj[b]
const createDate = date => new Date(date)

const __tube_lang__ = tube;

describe('execution of compiled code', () => {
  beforeEach(() => {
    console.warn = jest.fn();
  });

  it('evaluates a pipe invocation with functions', () => {
    const input = `
state
getN1
`;

    const compiledCode = compile(input);
    const jsCode = `getN1(state())`;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toStrictEqual(expected);
  });

  it('evaluates a pipe invocation with a method', () => {
    const input = `
state
getStr1
::toString
`;

    const compiledCode = compile(input);
    const jsCode = `getStr1(state()).toString()`;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toStrictEqual(expected);
  });

  it('evaluates a pipe invocation with a method with an argument', () => {
    const input = `
state
getArr1
::map to addOne
`;

    const compiledCode = compile(input);
    const jsCode = `getArr1(state()).map(addOne)`;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toStrictEqual(expected);
  });

  it('evaluates a pipe invocation with a side effect', () => {
    const input = `
state
getN1
< console.warn >
addFour
`;

    const compiledCode = compile(input);
    const jsCode = `
    const n = getN1(state());
    console.warn(n);
    addFour(n)
    `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toStrictEqual(expected);

    expect(console.warn).toBeCalledTimes(2);
    expect(console.warn).toBeCalledWith(1);
  });

  it('evaluates a pipe statement used inside a pipe invocation', () => {
    const input = `
-> fnPipe
    getObj1
    getArrC
    duplicateArr

state
fnPipe
< console.warn >
`;

    const compiledCode = compile(input);
    const jsCode = `
    const n = duplicateArr(getArrC(getObj1(state())));
    console.warn(n);
    n;
    `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toStrictEqual(expected);

    expect(console.warn).toBeCalledTimes(2);
    expect(console.warn).toBeCalledWith([4, 5, 6, 4, 5, 6]);
  });

  it('evaluates a pipe invocation with switch block', () => {
    const input = `
state
pick 'n1'
    : isGreaterThanZero : addFour
    : isLessThanZero : addOne
`;

    const compiledCode = compile(input);
    const jsCode = `
    let res = pick('n1')(state())

    if (isGreaterThanZero(res)) {
      res = addFour(res)
    } else if (isLessThanZero(res)) {
      res = addOne(res)
    }
    res;
    `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toEqual(5);
    expect(result).toStrictEqual(expected);
  });

  it('evaluates a pipe invocation with a switch block and default clause', () => {
    const input = `
state
pick 'n0'
    : isGreaterThanZero : addFour
    : default : addOne
    : isLessThanZero : addOne
`;

    const compiledCode = compile(input);
    const jsCode = `
    let res = pick('n0')(state())

    if (isGreaterThanZero(res)) {
      res = addFour(res)
    } else if (isLessThanZero(res)) {
      res = addOne(res)
    } else {
      res = addOne(res)
    }
    res;
    `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toEqual(1);
    expect(result).toStrictEqual(expected);
  });

  it('evaluates a pipe with a truthy condition in an if/else block', () => {
    const input = `
state
getArr1
isArray
    : first
    : noop
`;

    const compiledCode = compile(input);
    const jsCode = `
    let res = getArr1(state());
    if (isArray(res)) {
      res = first(res);
    } else {
      res = noop(res);
    }
    res;
    `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toEqual(1);
    expect(result).toStrictEqual(expected);
  });

  it('evaluates a pipe with a falsy condition in an if/else block', () => {
    const input = `
state
getStr1
isArray
    : noop
    : appendHello
`;

    const compiledCode = compile(input);
    const jsCode = `
        let res = getStr1(state());
        if (isArray(res)) {
          res = noop(res);
        } else {
          res = appendHello(res);
        }
        res;
        `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toEqual('str1hello');
    expect(result).toStrictEqual(expected);
  });

  it('evaluates a pipe with an if/else block with arguments', () => {
    const input = `
state
getStr1
isArray
    : noop
    : append 'hello'
`;

    const compiledCode = compile(input);
    const jsCode = `
        let res = getStr1(state());
        if (isArray(res)) {
          res = noop(res);
        } else {
          res = append('hello')(res);
        }
        res;
        `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toEqual('str1hello');
    expect(result).toStrictEqual(expected);
  });

  it('evaluates a pipe with an if block', () => {
    const input = `
state
getStr1
isArray
    : append 'hello'
`;

    const compiledCode = compile(input);
    const jsCode = `
        let res = getStr1(state());
        if (isArray(res)) {
          res = append('hello')(res);
        }
        res;
        `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toEqual('str1');
    expect(result).toStrictEqual(expected);
  });

  it('evaluates a pipe with a negation', () => {
    const input = `
state
getArr1
! isArray
    : noop
    : first
`;

    const compiledCode = compile(input);
    const jsCode = `
    let res = getArr1(state());
    if (!isArray(res)) {
      res = noop(res);
    } else {
      res = first(res);
    }
    res;
    `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toEqual(1);
    expect(result).toStrictEqual(expected);
  });

  describe('union statements', () => {
    it('evaluates an object union ', () => {
      const input = `
state
    U getObj1
    U getObj2
`;

      const compiledCode = compile(input);
      const jsCode = `
      let res = state();
      res = { ...getObj1(res), ...getObj2(res) };
      res;
      `;

      const result = eval(compiledCode);
      const expected = eval(jsCode);

      expect(result).toEqual({ a: 1, b: 'b', c: 1, d: 'd', f: [] });
      expect(result).toStrictEqual(expected);
    });

    it('evaluates a boolean union ', () => {
      const input = `
state
    U getTrue
    U getFalse
`;

      const compiledCode = compile(input);
      const jsCode = `
      getTrue() || getFalse()
      `;

      const result = eval(compiledCode);
      const expected = eval(jsCode);

      expect(result).toEqual(true);
      expect(result).toStrictEqual(expected);
    });

    it('evaluates a number union ', () => {
      const input = `
state
    U getN1
    U getN2
`;

      const compiledCode = compile(input);
      const jsCode = `
      let res = state();
      getN1(res) + getN2(res)
      `;

      const result = eval(compiledCode);
      const expected = eval(jsCode);

      expect(result).toEqual(3);
      expect(result).toStrictEqual(expected);
    });

    it('evaluates an array union ', () => {
      const input = `
state
    U getArr1
    U getArr2
    U getArr1
`;

      const compiledCode = compile(input);
      const jsCode = `
      let res = state();
      [...getArr1(res), ...getArr2(res), ...getArr1(res)]
      `;

      const result = eval(compiledCode);
      const expected = eval(jsCode);

      expect(result).toEqual([1, 2, 3, 'a', 'b', 'c', 1, 2, 3]);
      expect(result).toStrictEqual(expected);
    });

    it('ignores null and undefined values ', () => {
      const input = `
state
    U getArr1
    U getUndefined
    U getNull
`;

      const compiledCode = compile(input);
      const jsCode = `
      let res = state();
      [...getArr1(res)]
      `;

      const result = eval(compiledCode);
      const expected = eval(jsCode);

      expect(result).toEqual([1, 2, 3]);
      expect(result).toStrictEqual(expected);
    });

    it('throws an error when union has different types', () => {
      const input = `
state
    U getArr1
    U getObj1
`;

      const compiledCode = compile(input);

      expect(() => eval(compiledCode)).toThrowError(
        `Mismatch between returning types of union statement`,
      );
    });

    it('throws an error for union with not supported types', () => {
      const input = `
state
    U getFn1
    U getArr1
`;

      const compiledCode = compile(input);

      expect(() => eval(compiledCode)).toThrowError(
        `as returning type of a union statement, not supported`,
      );
    });
  });

  it('evaluates a pipe statement with methods', () => {
    const input = `
-> fnPipe
    getObj1
    getArrC
    ::toString
    appendHello
    ::toString

state
fnPipe
`;

    const compiledCode = compile(input);
    const jsCode = `
    const n = appendHello(getArrC(getObj1(state())).toString()).toString();
    n;
    `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toStrictEqual(expected);
    expect(result).toStrictEqual('4,5,6hello');
  });

  it('evaluates a pipe statement with arguments', () => {
    const input = `
-> fnPipe
    getObj1
    getArrC
    ::toString
    append 'hello'

state
fnPipe
`;

    const compiledCode = compile(input);
    const jsCode = `
    const n = append('hello')(getArrC(getObj1(state())).toString());
    n;
    `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toStrictEqual(expected);
    expect(result).toStrictEqual('4,5,6hello');
  });

  it('evaluates a pipe statement with a side effect', () => {
    const input = `
-> fnPipe
    getObj1
    getArrC
    duplicateArr
    < console.warn >

state
fnPipe
`;

    const compiledCode = compile(input);
    const jsCode = `
    const n = duplicateArr(getArrC(getObj1(state())));
    n;
    `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toStrictEqual(expected);

    expect(console.warn).toBeCalledTimes(1);
    expect(console.warn).toBeCalledWith([4, 5, 6, 4, 5, 6]);
  });

  it('evaluates a pipe statement with an array union ', () => {
    const input = `
-> fnPipe
    U getArr1
    U getArr2
    U getArr1

state
fnPipe
`;

    const compiledCode = compile(input);
    const jsCode = `
    let res = state();
    [...getArr1(res), ...getArr2(res), ...getArr1(res)]
    `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toEqual([1, 2, 3, 'a', 'b', 'c', 1, 2, 3]);
    expect(result).toStrictEqual(expected);
  });

  it('evaluates a pipe statement with an array union with arguments', () => {
    const input = `
-> fnPipe
    U pick 'arr1'
    U getArr2
    U getArr1

state
fnPipe
`;

    const compiledCode = compile(input);
    const jsCode = `
    let res = state();
    [...getArr1(res), ...getArr2(res), ...getArr1(res)]
    `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toEqual([1, 2, 3, 'a', 'b', 'c', 1, 2, 3]);
    expect(result).toStrictEqual(expected);
  });

  it('evaluates a pipe statement with an if/else block', () => {
    const input = `
-> fnPipe
    getArr1
    isArray
        : first
        : noop

state
fnPipe
`;

    const compiledCode = compile(input);
    const jsCode = `
    let res = getArr1(state());
    if (isArray(res)) {
      res = first(res);
    } else {
      res = noop(res);
    }
    res;
    `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toEqual(1);
    expect(result).toStrictEqual(expected);
  });

  it('evaluates a pipe invocation with a curried function called more than once', () => {
    const input = `
state
pick 'obj2'
pick 'c'
`;

    const compiledCode = compile(input);
    const jsCode = `
    pick('c')(pick('obj2')(state()))
    `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toEqual(1);
    expect(result).toStrictEqual(expected);
  });

  it('evaluates a pipe with a function with undeterminated arity using keyword "..."', () => {
    const input = `
state
pickVariadic ... 'n1'
`;

    const compiledCode = compile(input);
    const jsCode = `
    let res = pickVariadic('n1')(state())
    res;
    `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toEqual(1);
    expect(result).toStrictEqual(expected);
  });

  it('evaluates a pipe with a function with undeterminated arity using keyword alias "ary"', () => {
    const input = `
state
pickVariadic ary 'n1'
`;

    const compiledCode = compile(input);
    const jsCode = `
    let res = pickVariadic('n1')(state())
    res;
    `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toEqual(1);
    expect(result).toStrictEqual(expected);
  });

  it('evaluates a pipe with a special characters as function name', () => {
    const input = `
state$
getN1
`;

    const compiledCode = compile(input);
    const jsCode = `getN1(state$())`;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toEqual(1);
    expect(result).toStrictEqual(expected);
  });

  it('evaluates a pipe with flipped arguments using keyword "flip"', () => {
    const input = `
state
returnThirdArgument flip 'n1' 'n2'
`;

    const compiledCode = compile(input);
    const jsCode = `
    let res = getN1(state())
    res;
    `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toEqual(1);
    expect(result).toStrictEqual(expected);
  });

  it('evaluates a pipe with flipped arguments using keyword "flip"', () => {
    const input = `
state
getN1
subtract flip 1000
`;

    const compiledCode = compile(input);
    const jsCode = `
    let res = subtract(getN1(state()), 1000)
    res;
    `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toEqual(-999);
    expect(result).toStrictEqual(expected);
  });

  it('evaluates a pipe with arguments at first function', () => {
    const input = `
defer createDate for '1995-12-17T03:24:00'
`;

    const compiledCode = compile(input);
    const jsCode = `
    createDate('1995-12-17T03:24:00')
    `;

    const result = eval(compiledCode);
    const expected = eval(jsCode);

    expect(result).toStrictEqual(expected);
  });

});
