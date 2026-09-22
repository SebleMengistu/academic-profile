/**
 * Express 5 types req.params values as `string | string[]`.
 * This helper normalises them to a plain string.
 */
export const param = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? '' : value ?? '';
