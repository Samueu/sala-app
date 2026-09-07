'use client';

import { useApp } from '@/app/lib/context';
import { DMS } from '@/app/lib/data';

export default function ServerList() {
  const app = useApp();
  const SERVERS = app.servers;

  const handleServerClick = (serverId: string) => {
    const server = SERVERS[serverId];
    app.setServerId(serverId);
    app.setScopekind('server');
    app.setActiveId(`${serverId}/${server.channels[0].id}`);
  };

  const handleDirectsClick = () => {
    app.setScopekind('dm');
    app.setActiveId(`dm/${DMS[0].id}`);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-bg border-r border-neutral-800 h-full">
      {Object.keys(SERVERS).map((serverId) => {
        const server = SERVERS[serverId];
        const isActive = app.scopeKind === 'server' && serverId === app.serverId;

        return (
          <div
            key={serverId}
            onClick={() => handleServerClick(serverId)}
            title={server.name}
            className={`relative w-9 h-9 rounded-md flex items-center justify-center cursor-pointer font-heading font-500 text-xs transition-all ${
              isActive
                ? 'bg-accent-900 text-accent-200 ring-1 ring-accent-700'
                : 'bg-neutral-900 text-neutral-500 ring-1 ring-neutral-800 hover:ring-accent-500'
            }`}
          >
            <span>{server.mark}</span>
            {server.badge > 0 && !isActive && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 flex items-center justify-center rounded-full text-xs font-bold text-neutral-900 bg-accent-400">
                {server.badge}
              </span>
            )}
          </div>
        );
      })}

      <div className="w-4 h-px my-2 bg-neutral-800"></div>

      <div
        onClick={handleDirectsClick}
        title="Mensagens diretas"
        className={`w-9 h-9 rounded-md flex items-center justify-center cursor-pointer transition-all ${
          app.scopeKind === 'dm'
            ? 'bg-accent-900 text-accent-200 ring-1 ring-accent-700'
            : 'bg-neutral-900 text-neutral-500 ring-1 ring-neutral-800 hover:ring-accent-500'
        }`}
      >
        <i className="ph ph-chat-teardrop text-base"></i>
      </div>
    </div>
  );
}
