export function renderTemplate(
  template: string,
  variables: Record<string, unknown>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = variables[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

export function wrapEmailHtml(body: string): string {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;line-height:1.5;color:#111">${body}<hr style="margin-top:2rem;border:none;border-top:1px solid #eee"/><p style="font-size:12px;color:#666">Limbu — AI workspace platform</p></body></html>`;
}
