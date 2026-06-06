export type ActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export type OrgActionResult = ActionResult;

export type WorkspaceActionResult = ActionResult;

export type ChatActionResult = ActionResult;
