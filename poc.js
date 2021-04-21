const __tube_lang__ = require('./build/src/main.js');
const { compile } = __tube_lang__;

const implementationWorld = `
const state = () => ({ A: { B: { a: 1, b: 2, c:3, d:4 } } })

const getA = ({ A }) => A
const getB = ({ B }) => B

const sumB = v => state => ({ ...state, b: state.b + v })
const sumBFour = sumB(4)

const isLengthGreaterThan = v => state => state.length > v

const shift = state => state.slice(1)
const pop = state => state.slice(0, state.length - 1)
const divide = times => state => state / times
const first = state => state[0]
`;

const declarativeWorld = compile(`
-> extractAB
    getA
    getB

state
extractAB
< console.log >
Object.values
isLengthGreaterThan 2
    : shift
    : pop
first
< console.log >
::toString
divide by 2
< console.log >
`);

eval(implementationWorld + declarativeWorld);
