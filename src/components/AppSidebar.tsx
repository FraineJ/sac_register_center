import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronDown, CircleUserRound, Sailboat, Ship, ShipWheel, UsersRound } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar
} from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useEffect, useState } from "react";
import LogoSac from "../../public/logo-banner.png";

// Importa los íconos necesarios
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Ticket,
  Megaphone,
  Cog,
  ScrollText,
  CalendarCheck,
  CalendarRange,
  BriefcaseBusiness,
  IdCard,
  DollarSign,
  Wrench,
  Construction,
  Home
} from "lucide-react";

// Mapeo de nombres de íconos a componentes
const iconComponents: Record<string, React.ComponentType<any>> = {
  "layout-dashboard": LayoutDashboard,
  "user": Users,
  "calendar-days": CalendarDays,
  "ticket": Ticket,
  "megaphone": Megaphone,
  "cog": Cog,
  "scroll-text": ScrollText,
  "calendar-check": CalendarCheck,
  "calendar-range": CalendarRange,
  "briefcase-business": BriefcaseBusiness,
  "id-card": IdCard,
  "money": DollarSign,
  "sailboat": Sailboat,
  "ship-wheel": ShipWheel,
  "ship": Ship,
  "circle-user-round": CircleUserRound,
  "users-round": UsersRound,
  "wrench": Wrench,
  "construction": Construction,
  "home" : Home
};

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    try {
      const dataUser = localStorage.getItem("dataUser");
      if (dataUser) {
        const parsedData = JSON.parse(dataUser);

        // Verificar si los datos tienen la estructura esperada
        if (Array.isArray(parsedData)) {
          // Ordenar los ítems del menú por el campo 'order'
          const sortedMenu = [...parsedData].sort((a, b) => a.order - b.order);

          // Ordenar los submenús si existen
          const menuWithSortedSubmenus = sortedMenu.map((item) => ({
            ...item,
            sub_menus: item.sub_menus?.sort((a: any, b: any) => a.order - b.order) || []
          }));

          setMenuItems(menuWithSortedSubmenus);
        } else if (parsedData?.menu && Array.isArray(parsedData.menu)) {
          // Si los datos vienen en un objeto con propiedad 'menu'
          const sortedMenu = [...parsedData.menu].sort((a, b) => a.order - b.order);
          const menuWithSortedSubmenus = sortedMenu.map((item) => ({
            ...item,
            sub_menus: item.sub_menus?.sort((a: any, b: any) => a.order - b.order) || []
          }));
          setMenuItems(menuWithSortedSubmenus);
        } else {
          console.warn("El menú no tiene la estructura esperada", parsedData);
          setMenuItems([]);
        }
      }
    } catch (error) {
      console.error("Error al parsear datos del usuario:", error);
      setMenuItems([]);
    }
  }, []);

  const toggleSubmenu = (itemId: string) => {
    setOpenSubmenus((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const getNavClassName = (path: string | null) => {
    if (!path)
      return cn(
        "flex items-center h-12 rounded-md p-3 transition-all",
        "hover:bg-secondary text-foreground",
        collapsed ? "w-12 justify-center" : "w-full justify-start"
      );

    const isActive = location.pathname === path || location.pathname.startsWith(path + "/");

    return cn(
      "flex items-center h-12 rounded-md px-3 transition-all",
      isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground",
      collapsed ? "w-12 justify-center" : "w-full justify-start"
    );
  };

  // ✅ Fijamos estilo del submenú activo y evitamos cambio en hover
  const getSubNavClassName = (path: string) => {
    const isActive =
      location.pathname === path || location.pathname.startsWith(path + "/");

    return cn(
      "flex items-center h-10 rounded-md pl-2 transition-all text-sm",
      isActive
        ? "!bg-primary !text-white hover:!bg-primary hover:!text-white"
        : "hover:bg-secondary text-foreground"
    );
  };

  // ✅ Icono blanco cuando el submenú está activo
  const getIconComponent = (iconName: string, options?: { active?: boolean }) => {
    const IconComponent = iconComponents[iconName];
    if (!IconComponent) return null;
    return (
      <IconComponent
        className={cn("h-5 w-5 flex-shrink-0", options?.active ? "!text-white" : "text-inherit")}
      />
    );
  };

  return (
    <Sidebar
      className={cn(
        "h-screen border-r bg-card fixed z-40",
        "transition-[width] duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      {/* Logo con animación de altura */}
      <div
        className={cn(
          "border-b flex items-center ",
          "transition-all duration-300 ease-in-out",
          collapsed ? "h-16 flex p-2 justify-center!" : "h-20 p-4 flex justify-start"
        )}
      >
        {collapsed ? (
          <span className="text-lg font-bold animate-fade-in m-auto">I</span>
        ) : (
          <div className="flex gap-2 items-center">
            <img
              src={LogoSac}
              width={60}
              className="rounded-lg"
              alt="Logo SAC"
            />
            <span className="text-lg font-medium animate-fade-in">Sac register</span>
          </div>
        )}
      </div>

      <SidebarContent className="overflow-y-auto">
        <SidebarGroup className="py-4">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  {item.sub_menus && item.sub_menus.length > 0 ? (
                    <Collapsible
                      open={openSubmenus.includes(item.id.toString())}
                      onOpenChange={() => toggleSubmenu(item.id.toString())}
                    >
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton className={getNavClassName(item.route)}>
                                {getIconComponent(item.icon)}
                                {!collapsed && (
                                  <>
                                    <span
                                      className={cn(
                                        "truncate flex-1 text-left",
                                        "transition-all duration-200 ease-in-out",
                                        "opacity-0 animate-fade-in",
                                        !collapsed && "opacity-100 ml-3"
                                      )}
                                    >
                                      {item.name}
                                    </span>
                                    <ChevronDown
                                      className={cn(
                                        "h-4 w-4 transition-transform duration-200",
                                        openSubmenus.includes(item.id.toString()) && "rotate-180"
                                      )}
                                    />
                                  </>
                                )}
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                          </TooltipTrigger>
                          {collapsed && (
                            <TooltipContent side="right" className="animate-fade-in">
                              {item.name}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>

                      {!collapsed && (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.sub_menus.map((subItem: any) => {
                              const isActive =
                                location.pathname === subItem.route ||
                                location.pathname.startsWith(subItem.route + "/");

                              return (
                                <SidebarMenuSubItem key={`${item.id}-${subItem.route}`}>
                                  <SidebarMenuSubButton asChild>
                                    <NavLink
                                      to={subItem.route}
                                      className={getSubNavClassName(subItem.route)}
                                      data-active={isActive ? "true" : "false"}
                                    >
                                      {getIconComponent(subItem.icon, { active: isActive })}
                                      {!collapsed && <span className="ml-2">{subItem.name}</span>}
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  ) : (
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild>
                            {item.route ? (
                              <NavLink to={item.route} className={getNavClassName(item.route)}>
                                {getIconComponent(item.icon)}
                                {!collapsed && (
                                  <span
                                    className={cn(
                                      "truncate",
                                      "transition-all duration-200 ease-in-out",
                                      "opacity-0 animate-fade-in",
                                      !collapsed && "opacity-100 ml-3"
                                    )}
                                  >
                                    {item.name}
                                  </span>
                                )}
                              </NavLink>
                            ) : (
                              <div className={getNavClassName(null)}>
                                {getIconComponent(item.icon)}
                                {!collapsed && (
                                  <span
                                    className={cn(
                                      "truncate",
                                      "transition-all duration-200 ease-in-out",
                                      "opacity-0 animate-fade-in",
                                      !collapsed && "opacity-100 ml-3"
                                    )}
                                  >
                                    {item.name}
                                  </span>
                                )}
                              </div>
                            )}
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        {collapsed && (
                          <TooltipContent side="right" className="animate-fade-in">
                            {item.name}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
