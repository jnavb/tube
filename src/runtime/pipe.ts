export const pipe = (...fn) => (x) => fn.reduce((y, f) => f(y), x);
