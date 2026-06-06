const sessionMemory = new Map<string, Record<string, string>>();

function sessionKey(organizationId: string, userId: string, threadId: string) {
  return `${organizationId}:${userId}:${threadId}`;
}

export function getShortTermMemory(
  organizationId: string,
  userId: string,
  threadId: string,
): Record<string, string> | undefined {
  return sessionMemory.get(sessionKey(organizationId, userId, threadId));
}

export function setShortTermMemory(
  organizationId: string,
  userId: string,
  threadId: string,
  memory: Record<string, string>,
) {
  sessionMemory.set(sessionKey(organizationId, userId, threadId), memory);
}

export function patchShortTermMemory(
  organizationId: string,
  userId: string,
  threadId: string,
  patch: Record<string, string>,
) {
  const key = sessionKey(organizationId, userId, threadId);
  const current = sessionMemory.get(key) ?? {};
  sessionMemory.set(key, { ...current, ...patch });
}

export function clearShortTermMemory(organizationId: string, userId: string, threadId: string) {
  sessionMemory.delete(sessionKey(organizationId, userId, threadId));
}

export function resetShortTermMemoryForTests() {
  sessionMemory.clear();
}
