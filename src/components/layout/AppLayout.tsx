import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { FloatingChatButton } from '@/components/chat/FloatingChatButton';
import { TeammateMatchNotifications } from '@/components/TeammateMatchNotifications';
import { Outlet } from 'react-router-dom';

export const AppLayout = () => {
  return (
    <div className="h-screen flex flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <Sidebar />
        <main className="flex-1 relative overflow-auto pb-16 lg:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
      <FloatingChatButton />
      <TeammateMatchNotifications />
    </div>
  );
};