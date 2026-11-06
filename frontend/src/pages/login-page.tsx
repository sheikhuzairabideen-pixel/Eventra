import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import PageShell from "@/components/page-shell";
import { LoadingState } from "@/components/state-views";

const LoginPage: React.FC = () => {
  const { isLoading, isAuthenticated, signinRedirect } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      signinRedirect();
    }
  }, [isLoading, isAuthenticated, signinRedirect]);

  return (
    <PageShell width="narrow" footer={false}>
      <LoadingState label="Taking you to log in…" />
    </PageShell>
  );
};

export default LoginPage;
