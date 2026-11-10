import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import PageShell from "@/components/page-shell";
import { LoadingState } from "@/components/state-views";

/**
 * RegisterPage — immediately redirects the user to Keycloak's built-in
 * registration form via the OIDC flow.
 *
 * We use the `kc_action=REGISTRATION` Keycloak-specific query parameter
 * so the user lands directly on the "Create account" screen rather than
 * the login screen.  After registration (and automatic sign-in) Keycloak
 * redirects back to our /callback route which handles the token and then
 * returns the user to the application.
 *
 * No passwords are collected or stored here.
 */
const RegisterPage: React.FC = () => {
  const { isLoading, isAuthenticated, signinRedirect } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      // kc_action=REGISTRATION tells Keycloak to open its registration page
      // directly instead of the login page.
      signinRedirect({
        extraQueryParams: { kc_action: "REGISTRATION" },
      });
    }
  }, [isLoading, isAuthenticated, signinRedirect]);

  return (
    <PageShell width="narrow" footer={false}>
      <LoadingState label="Taking you to create an account…" />
    </PageShell>
  );
};

export default RegisterPage;

