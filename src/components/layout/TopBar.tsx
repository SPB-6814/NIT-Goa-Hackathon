import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

export const TopBar = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Campus Connect
      </h1>
      
      {/* Profile menu moved to sidebar */}
    </div>
  );
};