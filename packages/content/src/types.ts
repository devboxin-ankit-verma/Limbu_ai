export type ContentContext = {
  userId: string;
  workspaceId: string;
  organizationId: string;
  isSuperAdmin?: boolean;
};

export type PostContent = {
  text?: string;
  title?: string;
  keywords?: string;
  tone?: string;
};
