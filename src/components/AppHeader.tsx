import { Search, Bell, ChevronDown, User, Type, PanelLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";

interface UserData {
  name: string;
  lastName: string;
  nameRol?: string;
}

// Custom SidebarTrigger component para mejor control
const CustomSidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
CustomSidebarTrigger.displayName = "CustomSidebarTrigger";

export function AppHeader() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useNavigate();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData>({
    name: "",
    lastName: ""
  });

  useEffect(() => {
    // Obtener datos del usuario desde localStorage
    const dataUser = localStorage.getItem('dataUser');
    if (dataUser) {
      try {
        const parsedData = JSON.parse(dataUser);
        if (parsedData.userData) {
          setUserData(parsedData.userData);
        }
      } catch (error) {
        console.warn('Error parsing user data');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('dataUser');
    localStorage.removeItem('token');
    localStorage.removeItem('companyInfo'); // Opcional: limpiar también info de empresa
    navigate('/');
  };

  // Generar iniciales para el avatar
  const getInitials = () => {
    if (userData.name && userData.lastName) {
      return `${userData.name.charAt(0)}${userData.lastName.charAt(0)}`;
    }
    return "US";
  };

  return (
    <div>
      <header className={cn(
        "h-16 bg-card border-b border-border px-6 py-2 flex items-center justify-between  shadow-sm z-30",
        "transition-all duration-300 ease-in-out",
        "fixed ",
        // Ajuste basado en el estado del sidebar
      )}
        style={{
          width: '-webkit-fill-available',

        }}>
        <div className="flex items-center gap-4">
          <SidebarTrigger />
        
        </div>

        <div className="flex items-center gap-4 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 hover:bg-secondary">
                <Avatar className="h-10 w-10 transition-transform hover:scale-105">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground">
                    {userData.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userData.nameRol || "Usuario"}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/perfil')} className="gap-2" style={{ cursor: "pointer" }}>
                <User className="h-4 w-4" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive" style={{ cursor: "pointer" }}>
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </div>

  );
}