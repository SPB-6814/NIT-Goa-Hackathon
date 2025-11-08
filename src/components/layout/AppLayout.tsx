import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { FloatingChatButton } from '@/components/chat/FloatingChatButton';
import { Outlet } from 'react-router-dom';

export const AppLayout = () => {
  return (
    <div className="h-screen flex flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 relative overflow-auto">
          <Outlet />
        </main>
      </div>
      <FloatingChatButton />
    </div>
  );
};