import { useEffect } from "react";
import { useRoles } from "@/hooks/use-roles";
import { useNavigate } from "react-router";
import PageShell from "@/components/page-shell";
import { LoadingState } from "@/components/state-views";

const DashboardPage: React.FC = () => {
  const { isLoading, isOrganizer, isStaff } = useRoles();
  const navigate = useNavigate();

  // Redirect from an effect, once roles are known. (Navigating during render,
  // as before, sent everyone to My tickets while roles were still loading.)
  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isOrganizer) {
      navigate("/dashboard/events");
      return;
    }

    if (isStaff) {
      navigate("/dashboard/validate-qr");
      return;
    }

    navigate("/dashboard/tickets");
  }, [isLoading, isOrganizer, isStaff, navigate]);

  return (
    <PageShell width="narrow" footer={false}>
      <LoadingState />
    </PageShell>
  );
};

export default DashboardPage;
