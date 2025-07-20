export function removeUndefinedValues<T>(object: T): T {
  if (object == null) {
    return object;
  }
  return Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(object as object).filter(([_, value]) => value !== undefined)
  ) as T;
}
