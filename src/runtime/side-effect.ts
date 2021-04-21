export const sideEffect = (f) => (x) => {
  f(x);
  return x;
};
