import { Home, Calendar, Search, FolderKanban, Bell, Plus } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useState } from 'react';
import { ProjectFormDialog } from '@/components/ProjectFormDialog';
import { CreatePostDialog } from '@/components/CreatePostDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { PenSquare } from 'lucide-react';

export const MobileBottomNav = () => {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);

  const navItems = [
    { title: 'Home', url: '/', icon: Home },
    { title: 'Search', url: '/search', icon: Search },
    { title: 'Dashboard', url: '/dashboard', icon: FolderKanban },
    { title: 'Notifications', url: '/notifications', icon: Bell },
  ];

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-sidebar-border safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors min-w-[60px]"
              activeClassName="text-primary font-semibold bg-primary/10"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.title}</span>
            </NavLink>
          ))}
          
          {/* Create menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className="rounded-full h-12 w-12 shadow-lg"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="mb-2">
              <DropdownMenuItem onClick={() => setShowPostForm(true)}>
                <PenSquare className="mr-2 h-4 w-4" />
                Create Post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowProjectForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

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
