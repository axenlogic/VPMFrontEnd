import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  ClipboardList,
  BarChart3,
  Home,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/user";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    roles: ["vpm_admin", "district_admin", "district_viewer"],
  },
  {
    title: "Intake Form",
    href: "/intake",
    icon: FileText,
  },
  {
    title: "Check Status",
    href: "/intake/status",
    icon: ClipboardList,
  },
  {
    title: "Admin Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["vpm_admin"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["vpm_admin", "district_admin"],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const userRole = (user as any)?.role || "public";

  const filteredItems = sidebarItems.filter(
    (item) => !item.roles || item.roles.includes(userRole as UserRole)
  );

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/20" style={{ backgroundColor: 'var(--brand-color)' }}>
      <div className="flex h-16 items-center justify-start border-b border-white/20 px-6">
        <img 
          src="/vpm-logo.png" 
          alt="VPM Logo" 
          className="h-10 w-auto object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/80 text-foreground shadow-sm"
                  : "text-foreground hover:bg-white/50"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;

