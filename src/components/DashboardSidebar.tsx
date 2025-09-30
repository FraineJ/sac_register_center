import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard,
  Users,
  Truck,
  Wrench,
  MessageSquare,
  Settings,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "usuarios", label: "Usuarios", icon: Users, path: "/usuarios" },
  { id: "flota", label: "Flota", icon: Truck, path: "/flota" },
  { id: "mantenimiento", label: "Mantenimiento", icon: Wrench, path: "/mantenimiento" },
  { id: "operaciones", label: "Operaciones", icon: MessageSquare, path: "/operaciones" },
  { id: "configuracion", label: "Configuración", icon: Settings, path: "/configuracion" },
];

export function DashboardSidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside 
      className={cn(
        "bg-card border-r-0 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Logo and brand */}
      <div className="p-6 border-b-0">
        <div className="flex items-center gap-3">
          {/* Logo placeholder - three purple circles */}
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end"></div>
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end"></div>
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end"></div>
          </div>
          {!collapsed && (
            <span className="text-lg font-medium text-secondary-foreground">
              Ingenaren
            </span>
          )}
        </div>
        
        {/* Collapse button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="mt-4 w-8 h-8 p-0 hover:bg-secondary"
        >
          <Menu className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.id}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full justify-start h-12 px-3 transition-all duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm" 
                      : "text-muted-foreground hover:text-accent-foreground hover:bg-secondary",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                  {!collapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}