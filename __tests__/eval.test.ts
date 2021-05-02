import { compile } from '../src/compiler/compile';
import * as tube from '../src/main';

const mockState = () => ({
  n1: 1,
  n2: 2,
  str1: 'str1',
  str2: 'str2',
  arr1: [1, 2, 3],
  arr2: ['a', 'b', 'c'],
  obj1: { a: 1, b: 'b', c: [4, 5, 6] },
  obj2: { c: 1, d: 'd', f: [] },
  fn1: () => {}
});

type Mock = ReturnType<typeof mockState>;

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

const isString = (v: any): v is string => typeof v === 'string';
const isArray = (v: any): v is unknown[] => Array.isArray(v);
const isEmpty = (v: unknown[]) => Boolean(v.length);
const noop = (v) => v;

const append = (str: string) => (v: string) => v + str;
const appendHello = append('hello');

const first = (v: any[]) => v[0];
const last = (v: any[]) => v[v.length - 1];
const returnFalse = () => false;
const sum = (a: number, b: number) => a + b;
const sumFour = (a: number) => a + 4;
const addOne = (a: number) => a + 1;
const duplicateArr = (arr: any[]) => arr.concat(arr);

const __tube_lang__ = tube;

describe('execution of compiled code', () => {
  beforeEach(() => {
    console.log = jest.fn();
  });

  it('evaluates a pipe invocation with functions', () => {
    const input = `
mockState
getN1
`;

    const compiledCode = compile(input);
    const jsCode = `getN1(mockState())`;

    const result = eval(compiledCode);
    const desired = eval(jsCode);

    expect(result).toStrictEqual(desired);
  });

  it('evaluates a pipe invocation with a method', () => {
    const input = `
mockState
getStr1
::toString
`;

    const compiledCode = compile(input);
    const jsCode = `getStr1(mockState()).toString()`;

    const result = eval(compiledCode);
    const desired = eval(jsCode);

    expect(result).toStrictEqual(desired);
  });

  it('evaluates a pipe invocation with a method with an argument', () => {
    const input = `
mockState
getArr1
::map to addOne
`;

    const compiledCode = compile(input);
    const jsCode = `getArr1(mockState()).map(addOne)`;

    const result = eval(compiledCode);
    const desired = eval(jsCode);

    expect(result).toStrictEqual(desired);
  });

  it('evaluates a pipe invocation with a side effect', () => {
    const input = `
mockState
getN1
< console.log >
sumFour
`;

    const compiledCode = compile(input);
    const jsCode = `
    const n = getN1(mockState());
    console.log(n);
    sumFour(n)
    `;

    const result = eval(compiledCode);
    const desired = eval(jsCode);

    expect(result).toStrictEqual(desired);

    expect(console.log).toBeCalledTimes(2);
    expect(console.log).toBeCalledWith(1);
  });

  it('evaluates a pipe expression used inside a pipe invocation', () => {
    const input = `
-> fnPipe
    getObj1
    getArrC
    duplicateArr

mockState
fnPipe
< console.log >
`;

    const compiledCode = compile(input);
    const jsCode = `
    const n = duplicateArr(getArrC(getObj1(mockState())));
    console.log(n);
    n;
    `;

    const result = eval(compiledCode);
    const desired = eval(jsCode);

    expect(result).toStrictEqual(desired);

    expect(console.log).toBeCalledTimes(2);
    expect(console.log).toBeCalledWith([4, 5, 6, 4, 5, 6]);
  });

  it('evaluates a pipe with a truthy condition in an if/else block', () => {
    const input = `
mockState
getArr1
isArray
    : first
    : noop
`;

    const compiledCode = compile(input);
    const jsCode = `
    let res = getArr1(mockState());
    if (isArray(res)) {
      res = first(res);
    } else {
      res = noop(res);
    }
    res;
    `;

    const result = eval(compiledCode);
    const desired = eval(jsCode);

    expect(result).toEqual(1);
    expect(result).toStrictEqual(desired);
  });

  it('evaluates a pipe with a falsy condition in an if/else block', () => {
    const input = `
mockState
getStr1
isArray
    : noop
    : appendHello
`;

    const compiledCode = compile(input);
    const jsCode = `
        let res = getStr1(mockState());
        if (isArray(res)) {
          res = noop(res);
        } else {
          res = appendHello(res);
        }
        res;
        `;

    const result = eval(compiledCode);
    const desired = eval(jsCode);

    expect(result).toEqual('str1hello');
    expect(result).toStrictEqual(desired);
  });

  it('evaluates a pipe with an if/else block with arguments', () => {
    const input = `
mockState
getStr1
isArray
    : noop
    : append 'hello'
`;

    const compiledCode = compile(input);
    const jsCode = `
        let res = getStr1(mockState());
        if (isArray(res)) {
          res = noop(res);
        } else {
          res = append('hello')(res);
        }
        res;
        `;

    const result = eval(compiledCode);
    const desired = eval(jsCode);

    expect(result).toEqual('str1hello');
    expect(result).toStrictEqual(desired);
  });

  it('evaluates a pipe with an if block', () => {
    const input = `
mockState
getStr1
isArray
    : append 'hello'
`;

    const compiledCode = compile(input);
    const jsCode = `
        let res = getStr1(mockState());
        if (isArray(res)) {
          res = append('hello')(res);
        }
        res;
        `;

    const result = eval(compiledCode);
    const desired = eval(jsCode);

    expect(result).toEqual('str1');
    expect(result).toStrictEqual(desired);
  });

  it('evaluates a pipe with a negation', () => {
    const input = `
mockState
getArr1
negate isArray
    : noop
    : first
`;

    const compiledCode = compile(input);
    const jsCode = `
    let res = getArr1(mockState());
    if (!isArray(res)) {
      res = noop(res);
    } else {
      res = first(res);
    }
    res;
    `;

    const result = eval(compiledCode);
    const desired = eval(jsCode);

    expect(result).toEqual(1);
    expect(result).toStrictEqual(desired);
  });

  describe('union expressions', () => {
    it('evaluates an object union ', () => {
      const input = `
mockState
    U getObj1
    U getObj2
`;

      const compiledCode = compile(input);
      const jsCode = `
      let res = mockState();
      res = { ...getObj1(res), ...getObj2(res) };
      res;
      `;

      const result = eval(compiledCode);
      const desired = eval(jsCode);

      expect(result).toEqual({ a: 1, b: 'b', c: 1, d: 'd', f: [] });
      expect(result).toStrictEqual(desired);
    });

    it('evaluates a boolean union ', () => {
      const input = `
mockState
    U getTrue
    U getFalse
`;

      const compiledCode = compile(input);
      const jsCode = `
      getTrue() || getFalse()
      `;

      const result = eval(compiledCode);
      const desired = eval(jsCode);

      expect(result).toEqual(true);
      expect(result).toStrictEqual(desired);
    });

    it('evaluates a number union ', () => {
      const input = `
mockState
    U getN1
    U getN2
`;

      const compiledCode = compile(input);
      const jsCode = `
      let res = mockState();
      getN1(res) + getN2(res)
      `;

      const result = eval(compiledCode);
      const desired = eval(jsCode);

      expect(result).toEqual(3);
      expect(result).toStrictEqual(desired);
    });

    it('evaluates an array union ', () => {
      const input = `
mockState
    U getArr1
    U getArr2
    U getArr1
`;

      const compiledCode = compile(input);
      const jsCode = `
      let res = mockState();
      [...getArr1(res), ...getArr2(res), ...getArr1(res)]
      `;

      const result = eval(compiledCode);
      const desired = eval(jsCode);

      expect(result).toEqual([1, 2, 3, 'a', 'b', 'c', 1, 2, 3]);
      expect(result).toStrictEqual(desired);
    });

    it('ignores null and undefined values ', () => {
      const input = `
mockState
    U getArr1
    U getUndefined
    U getNull
`;

      const compiledCode = compile(input);
      const jsCode = `
      let res = mockState();
      [...getArr1(res)]
      `;

      const result = eval(compiledCode);
      const desired = eval(jsCode);

      expect(result).toEqual([1, 2, 3]);
      expect(result).toStrictEqual(desired);
    });

    it('throws an error when union has different types', () => {
      const input = `
mockState
    U getArr1
    U getObj1
`;

      const compiledCode = compile(input);

      expect(() => eval(compiledCode)).toThrowError(
        `Mismatch between returning types of union expression`,
      );
    });

    it('throws an error for union with not supported types', () => {
      const input = `
mockState
    U getFn1
    U getArr1
`;

      const compiledCode = compile(input);

      expect(() => eval(compiledCode)).toThrowError(
        `as returning type of a union expression, not supported`,
      );
    });
  });
});
