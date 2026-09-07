'use client';

import { useApp } from '@/app/lib/context';
import { DMS, initials, tint } from '@/app/lib/data';

export default function Sidebar() {
  const app = useApp();
  const server = app.servers[app.serverId];
  const onDirects = app.scopeKind === 'dm';

  const handleChannelClick = (channelId: string) => {
    const id = `${app.serverId}/${channelId}`;
    app.setActiveId(id);
    app.setThreadKey(null);
  };

  const handleDirectClick = (dmId: string) => {
    app.setActiveId(`dm/${dmId}`);
    app.setThreadKey(null);
  };

  const items = onDirects
    ? DMS.map((dm) => {
        const id = `dm/${dm.id}`;
        const isActive = app.activeId === id;
        const messages = app.convos[id] || [];
        const preview = messages.length > 0 ? messages[messages.length - 1].text : '';

        return (
          <div
            key={dm.id}
            onClick={() => handleDirectClick(dm.id)}
            className={`flex items-center gap-3 p-3 rounded-md cursor-pointer font-size-14 transition-colors ${
              isActive
                ? 'bg-neutral-800 text-neutral-100'
                : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100'
            }`}
          >
            <span
              className="w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-neutral-900"
              style={{ backgroundColor: tint(dm.name) }}
            >
              {initials(dm.name)}
            </span>
            <span className="flex-1 truncate">{dm.name}</span>
            {dm.unread > 0 && !isActive && (
              <span className="min-w-4 h-4 px-1 flex items-center justify-center rounded-full text-xs font-bold text-neutral-900 bg-accent-400">
                {dm.unread}
              </span>
            )}
          </div>
        );
      })
    : server.channels.map((channel) => {
        const id = `${app.serverId}/${channel.id}`;
        const isActive = app.activeId === id;
        const messages = app.convos[id] || [];
        const preview = messages.length > 0 ? `${messages[messages.length - 1].name}: ${messages[messages.length - 1].text}` : '';

        return (
          <div
            key={channel.id}
            onClick={() => handleChannelClick(channel.id)}
            className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
              isActive
                ? 'bg-neutral-800 text-neutral-100'
                : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100'
            }`}
          >
            <i className="ph ph-hash text-sm opacity-70"></i>
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate">{channel.name}</div>
              <div className="text-xs text-neutral-700 truncate">{preview}</div>
            </div>
            {channel.unread && !isActive && (
              <span className="min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full text-xs font-bold text-neutral-900 bg-accent-400">
                {channel.unread}
              </span>
            )}
          </div>
        );
      });

  return (
    <aside className="flex flex-col min-h-0 bg-neutral-900 border-r border-neutral-800">
      <div className="p-8 pb-6">
        <div className="font-heading text-base font-500">{onDirects ? 'Diretas' : server.name}</div>
        <div className="mt-2 text-xs text-neutral-600">
          {onDirects ? `${DMS.length} conversas` : `${server.channels.length} canais · ${server.rooms.length} salas`}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6 space-y-8">
        <div>
          <div className="px-3 pb-3 text-xs tracking-widest uppercase text-neutral-600">
            {onDirects ? 'Diretas' : 'Canais'}
          </div>
          <div className="flex flex-col gap-0.5">{items}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 border-t border-neutral-800">
        <div className="w-6.5 h-6.5 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-neutral-900 bg-accent-400">
          VC
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm">Você</div>
          <div className="text-xs text-neutral-600">{app.voiceRoom ? 'em chamada' : 'disponível'}</div>
        </div>
        <i className="ph ph-gear text-base text-neutral-600 cursor-pointer"></i>
      </div>
    </aside>
  );
}
