export const union = (...fns) => (x) => {
  const supportedTypes = new Set([
    'string',
    'object',
    'boolean',
    'number',
    'bigint',
  ]);

  return fns
    .map((f) => f(x))
    .reduce((acc, value) => {
      if (value == undefined) {
        return acc;
      }

      if (!supportedTypes.has(typeof acc) || !supportedTypes.has(typeof value)) {
        throw new Error(
          `Type ${typeof value} as returning type of a union statement, not supported`,
        );
      }

      if (
        typeof acc !== typeof value ||
        Array.isArray(acc) !== Array.isArray(value)
      ) {
        throw new Error('Mismatch between returning types of union statement');
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
    });
};
