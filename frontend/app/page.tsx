'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/app/lib/context';
import ServerList from '@/app/components/ServerList';
import Sidebar from '@/app/components/Sidebar';
import ChatArea from '@/app/components/ChatArea';
import FriendsPanel from '@/app/components/FriendsPanel';
import ThreadPanel from '@/app/components/ThreadPanel';
import VoicePanel from '@/app/components/VoicePanel';

export default function Home() {
  const [isDesktop, setIsDesktop] = useState(true);
  const app = useApp();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isDesktop) {
    return (
      <div className="flex flex-col h-screen w-full max-w-96 mx-auto border-l border-r border-neutral-800">
        <h1 className="p-4 text-center text-neutral-400">Mobile view coming soon</h1>
      </div>
    );
  }

  const showThreadPanel = !!app.threadKey;
  const threadCol = showThreadPanel ? ' 296px' : '';

  return (
    <div className="h-screen w-screen overflow-hidden bg-bg">
      <div className="grid gap-0 h-full" style={{ gridTemplateColumns: '56px 216px minmax(0,1fr)' + threadCol + ' 264px' }}>
        <ServerList />
        {app.scopeKind === 'friends' ? (
          <div style={{ gridColumn: 'span 2' }} className="h-full min-w-0 min-h-0">
            <FriendsPanel />
          </div>
        ) : (
          <>
            <Sidebar />
            <ChatArea />
          </>
        )}
        {showThreadPanel && <ThreadPanel />}
        <VoicePanel />
      </div>
    </div>
  );
}
