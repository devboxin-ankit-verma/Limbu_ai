export interface WorkspaceSettings {
  isDefault?: boolean;
}

export function parseWorkspaceSettings(settings: unknown): WorkspaceSettings {
  if (settings && typeof settings === "object" && !Array.isArray(settings)) {
    return settings as WorkspaceSettings;
  }
  return {};
}
