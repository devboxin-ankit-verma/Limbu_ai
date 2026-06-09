export const INTEGRATION_CONFIG = {
  mockGoogle: process.env.INTEGRATION_MOCK_GOOGLE === "true",
  googleClientId: process.env.GOOGLE_BUSINESS_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_BUSINESS_CLIENT_SECRET ?? "",
  googleRedirectUri:
    process.env.GOOGLE_BUSINESS_REDIRECT_URI ??
    "http://localhost:3002/api/integrations/google/callback",
  encryptionKey: process.env.INTEGRATION_CREDENTIAL_ENCRYPTION_KEY ?? "",
};
