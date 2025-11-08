import { Home, Calendar, Search, FolderKanban, Bell, Settings, Plus } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ProjectFormDialog } from '@/components/ProjectFormDialog';

export const Sidebar = () => {
  const [showProjectForm, setShowProjectForm] = useState(false);

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
      <aside className="w-60 border-r bg-card flex flex-col h-full">
        <div className="p-4">
          <Button 
            onClick={() => setShowProjectForm(true)}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
        
        <nav className="flex-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors mb-1"
              activeClassName="bg-primary/10 text-primary font-medium"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <ProjectFormDialog 
        open={showProjectForm} 
        onOpenChange={setShowProjectForm}
      />
    </>
  );
};