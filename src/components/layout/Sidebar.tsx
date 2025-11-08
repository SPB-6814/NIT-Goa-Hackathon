import { Home, Calendar, Search, FolderKanban, Bell, Settings, Plus, PenSquare, User, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ProjectFormDialog } from '@/components/ProjectFormDialog';
import { CreatePostDialog } from '@/components/CreatePostDialog';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Sidebar = () => {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const { user, signOut } = useAuth();

  const navItems = [
    { title: 'Home', url: '/', icon: Home },
    { title: 'Events', url: '/events', icon: Calendar },
    { title: 'Search', url: '/search', icon: Search },
    { title: 'Active Projects', url: '/dashboard', icon: FolderKanban },
    { title: 'Notifications', url: '/notifications', icon: Bell },
    { title: 'Settings', url: '/settings', icon: Settings },
  ];

  return (
    <>
      <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col h-full">
        {/* Reddit-style logo/brand area */}
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-gradient">Campus Connect</h1>
          <p className="text-xs text-muted-foreground mt-1">Student Collaboration Hub</p>
        </div>

        {/* Gamified Create Project button */}
        <div className="p-4 space-y-2">
          <Button 
            onClick={() => setShowPostForm(true)}
            variant="accent"
            size="pill"
            className="w-full font-bold shadow-glow-orange hover:shadow-glow-lg"
          >
            <PenSquare className="mr-2 h-5 w-5" />
            Create Post
          </Button>
          <Button 
            onClick={() => setShowProjectForm(true)}
            variant="gradient"
            size="pill"
            className="w-full font-bold shadow-glow-md hover:shadow-glow-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Project
          </Button>
        </div>
        
        {/* Reddit-style navigation */}
        <nav className="flex-1 px-3 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200 mb-1.5 group"
              activeClassName="bg-primary/10 text-primary font-semibold shadow-sm border-l-4 border-primary"
            >
              <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">{item.title}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer area with profile dropdown */}
        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sidebar-accent/50 cursor-pointer hover:bg-sidebar-accent transition-colors">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.email || 'Your Profile'}</p>
                  <p className="text-xs text-muted-foreground truncate">View & Edit</p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
      </aside>

      <ProjectFormDialog 
        open={showProjectForm} 
        onOpenChange={setShowProjectForm}
      />
      
      <CreatePostDialog
        open={showPostForm}
        onOpenChange={setShowPostForm}
      />
    </>
  );
};