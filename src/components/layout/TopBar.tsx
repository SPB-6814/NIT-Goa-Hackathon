import { User, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Home, Calendar, Search, FolderKanban, Bell, Plus, PenSquare, Map } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

export const TopBar = () => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { title: 'Map View', url: '/map', icon: Map },
    { title: 'Home', url: '/', icon: Home },
    { title: 'Events', url: '/events', icon: Calendar },
    { title: 'Search', url: '/search', icon: Search },
    { title: 'Active Projects', url: '/dashboard', icon: FolderKanban },
    { title: 'Notifications', url: '/notifications', icon: Bell },
  ];

  return (
    <div className="h-14 lg:h-16 border-b bg-card flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      {/* Mobile menu button */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            {/* Logo area */}
            <div className="p-4 border-b">
              <h1 className="text-lg font-bold text-gradient">Campus Connect</h1>
              <p className="text-xs text-muted-foreground mt-1">Student Collaboration Hub</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200 mb-1.5"
                  activeClassName="bg-primary/10 text-primary font-semibold"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </NavLink>
              ))}
            </nav>

            {/* Profile section */}
            <div className="p-4 border-t space-y-2">
              <Link
                to={`/profile/${user?.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">My Profile</span>
              </Link>
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <h1 className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Campus Connect
      </h1>
      
      {/* Desktop profile menu */}
      <div className="hidden lg:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/profile/${user?.id}`} className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut} className="flex items-center text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};