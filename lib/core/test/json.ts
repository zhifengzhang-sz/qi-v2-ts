// What the Json type admits, checked on a value at run time: the tests' own reading of base's Json, so that a
// context holding undefined, a function, a Date or a class instance fails it.

export const isJson = (value: unknown): boolean =>
  value === null ||
  typeof value === "boolean" ||
  typeof value === "string" ||
  (typeof value === "number" && Number.isFinite(value)) ||
  (Array.isArray(value) && value.every(isJson)) ||
  (typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype &&
    Object.values(value as object).every(isJson));
