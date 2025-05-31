export function isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

export function hasAllProperties<T extends Record<string, unknown>>(
  obj: unknown,
  keys: readonly (keyof T)[]
): obj is T {
  if (!isObject(obj)) return false;
  return keys.every((key) => key in obj);
}

export function isHTMLElement(element: unknown): element is HTMLElement {
  return element instanceof HTMLElement;
}

export function isEventTargetElement(target: EventTarget | null): target is HTMLElement {
  return target instanceof HTMLElement;
}

export function isErrorResponse(response: unknown): response is { error: string; message?: string } {
  return (
    isObject(response) &&
    hasProperty(response, "error") &&
    isString(response["error"])
  );
}

export function isAxiosError(error: unknown): error is {
  response?: { data?: unknown; status: number };
  message: string;
} {
  return (
    isObject(error) &&
    hasProperty(error, "message") &&
    isString(error["message"])
  );
}

export function invariant(condition: unknown, message: string): asserts condition {
  if (condition === false || condition === null || condition === undefined) {
    throw new Error(`Invariant failed: ${message}`);
  }
}

export function assertExists<T>(value: T | null | undefined, message: string): asserts value is T {
  invariant(isNotNullOrUndefined(value), message);
}

export function assertIsString(value: unknown, message: string): asserts value is string {
  invariant(isString(value), message);
}

export function assertHasProperty<K extends string>(
  obj: unknown,
  key: K,
  message: string
): asserts obj is Record<K, unknown> {
  invariant(hasProperty(obj, key), message);
} 