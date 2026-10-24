export function errMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed';
}
