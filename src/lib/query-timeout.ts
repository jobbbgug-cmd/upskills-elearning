export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  defaultValue: T
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(defaultValue), timeoutMs)),
  ]);
}
