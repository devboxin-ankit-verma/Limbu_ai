import { PROTECTED_PAGE_PREFIXES } from "./protected-routes";

export { PROTECTED_PAGE_PREFIXES };

export const authPages = ["/login", "/register"] as const;

export const forbiddenRedirectUrl = "/dashboard?error=forbidden";

export const loginRedirectUrl = "/login";
