import { Link, useLocation, useSearchParams } from "react-router";
import { FileText } from "lucide-react";
import { AppShell } from "@/components/common/app-shell";
import { PageRouter } from "@/pages/_router";
import { UserCard } from "@/components/user-card";
import { routes } from "@/routes";
import type { NavGroup } from "@/types/navigation";

function RouterLink({
  href,
  children,
  ...props
}: { href: string } & React.ComponentProps<"a">) {
  const [searchParams] = useSearchParams();
  return (
    <Link to={{ pathname: href, search: searchParams.toString() }} {...props}>
      {children}
    </Link>
  );
}

function useNavGroups(): NavGroup[] {
  const location = useLocation();
  return [
    {
      label: "Pages",
      items: routes.map((route) => ({
        label: route.title,
        href: route.path,
        icon: route.icon ?? FileText,
        isActive: location.pathname === route.path,
      })),
    },
  ];
}

export default function App() {
  const groups = useNavGroups();
  return (
    <AppShell
      groups={groups}
      actions={<UserCard />}
      linkComponent={RouterLink}
      variant="header"
    >
      <PageRouter />
    </AppShell>
  );
}
