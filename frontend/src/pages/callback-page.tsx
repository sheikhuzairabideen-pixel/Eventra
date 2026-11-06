import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router";
import PageShell from "@/components/page-shell";
import { LoadingState } from "@/components/state-views";

const CallbackPage: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated) {
      const redirectPath = localStorage.getItem("redirectPath");
      if (redirectPath) {
        localStorage.removeItem("redirectPath");
        navigate(redirectPath);
      }
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <PageShell width="narrow" footer={false}>
      <LoadingState label={isLoading ? "Checking your login…" : "Signing you in…"} />
    </PageShell>
  );
};

export default CallbackPage;
