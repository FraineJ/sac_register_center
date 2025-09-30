import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";


export function AppLayout() {




  return (

      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <div>
            <AppSidebar />
          </div>
         
          <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
            <AppHeader />
            
            
            <main className="flex-1 bg-dashboard-background py-4">
              <div className="pt-10 px-2"> {/* Añadido padding horizontal */}
                <Outlet />
              </div>
            </main>
          </div>
        </div>
        
   
      </SidebarProvider> 

  );
}