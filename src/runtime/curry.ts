// Thanks Eric E.
export const curry = (f, arr = []) => (...args) =>
  ((a) => (a.length === f.length ? f(...a) : curry(f, a)))([...arr, ...args]);
