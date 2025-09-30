import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardContent } from "./DashboardContent";

export function Dashboard() {
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: '24px' }}>
        <DashboardHeader />
        <DashboardContent />
      </div>
    </div>
  );
}