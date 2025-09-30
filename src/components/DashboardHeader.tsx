import { Search, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardHeader() {
  return (
    <header className="bg-card border-b-0 h-[72px] px-6 flex items-center justify-between" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      {/* Search bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for anything…"
            className="pl-12 bg-secondary border-0 rounded-full h-12 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Right side - notifications and user */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full hover:bg-secondary">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* User profile */}
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/placeholder-user.jpg" alt="Anima Agrawal" />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              AA
            </AvatarFallback>
          </Avatar>
          
          <div className="text-sm">
            <div className="font-medium text-foreground">Anima Agrawal</div>
            <div className="text-muted-foreground text-xs">U.P., India</div>
          </div>
          
          <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
}