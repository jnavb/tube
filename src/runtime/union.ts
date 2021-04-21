export const union = (...fns) => (x) =>
  fns
    .map((f) => f(x))
    .reduce((acc, value) => {
      if (typeof value === 'undefined') {
        return acc;
      }

      if (typeof acc !== typeof value) {
        throw new Error('Mismatch between returning types of union expression');
      }

      if (Array.isArray(value) || typeof value === 'string') {
        return acc.concat(value);
      }
      if (typeof value === 'object') {
        return Object.assign({}, acc, value);
      }
      if (typeof value === 'boolean') {
        return acc || value;
      }
      if (typeof value === 'number' || typeof value === 'bigint') {
        return acc + value;
      }

      throw new Error(
        `Type ${typeof value} as returning type of a union expression, not supported`,
      );
    });
