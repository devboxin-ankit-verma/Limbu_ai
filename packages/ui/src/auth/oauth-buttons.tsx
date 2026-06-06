const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem",
  border: "1px solid var(--border)",
  borderRadius: 8,
  background: "transparent",
  color: "var(--text)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
};

export function OAuthButtons({
  callbackUrl,
  signInWithGoogle,
  signInWithGitHub,
}: {
  callbackUrl?: string;
  signInWithGoogle: (callbackUrl?: string) => void | Promise<void>;
  signInWithGitHub: (callbackUrl?: string) => void | Promise<void>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <form action={signInWithGoogle.bind(null, callbackUrl)}>
        <button type="submit" style={buttonStyle}>
          Continue with Google
        </button>
      </form>
      <form action={signInWithGitHub.bind(null, callbackUrl)}>
        <button type="submit" style={buttonStyle}>
          Continue with GitHub
        </button>
      </form>
    </div>
  );
}
