'use client';

import { useApp } from '@/app/lib/context';
import { DMS, initials, tint } from '@/app/lib/data';

export default function ChatArea() {
  const app = useApp();
  const SERVERS = app.servers;

  let conversation: any = {};
  let icon = '';

  if (app.activeId.startsWith('dm/')) {
    const dmId = app.activeId.replace('dm/', '');
    const dm = DMS.find((d) => d.id === dmId) || DMS[0];
    conversation = {
      name: dm.name,
      topic: 'mensagem direta',
      intro: `Conversa direta com ${dm.name}.`,
      icon: 'ph ph-at',
    };
  } else {
    const [serverId, channelId] = app.activeId.split('/');
    const server = SERVERS[serverId];
    const channel = server.channels.find((c) => c.id === channelId) || server.channels[0];
    conversation = {
      name: `#${channel.name}`,
      topic: channel.topic,
      intro: channel.intro,
      icon: 'ph ph-hash',
    };
  }

  const messages = app.convos[app.activeId] || [];

  const handleSend = () => {
    app.sendMessage(app.draft);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="flex flex-col min-w-0 min-h-0">
      <header className="flex items-center gap-4 px-8 py-6 border-b border-neutral-800">
        <i className={`${conversation.icon} text-base text-neutral-600`}></i>
        <span className="font-heading text-base font-500">{conversation.name}</span>
        <span className="w-px h-3.5 bg-neutral-800"></span>
        <span className="flex-1 min-w-0 text-xs text-neutral-600 truncate">{conversation.topic}</span>
        <i className="ph ph-magnifying-glass text-base text-neutral-600 cursor-pointer"></i>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto pb-6">
        <div className="px-8 py-8 pb-6 max-w-xl">
          <div className="font-heading text-xl font-500">{conversation.name}</div>
          <div className="mt-2 text-sm text-neutral-600 break-words">{conversation.intro}</div>
        </div>

        {messages.map((msg, idx) => {
          const prev = idx > 0 ? messages[idx - 1] : null;
          const head = !prev || prev.name !== msg.name;
          const replyCount = msg.replies?.length || 0;

          return (
            <div
              key={msg.id}
              onClick={() => {
                if (replyCount > 0) {
                  app.setThreadKey({ key: app.activeId, idx });
                }
              }}
              className={`flex gap-4 px-8 py-1 cursor-pointer transition-colors ${
                app.threadKey?.idx === idx && app.threadKey?.key === app.activeId
                  ? 'bg-neutral-900'
                  : 'hover:bg-neutral-900/50'
              }`}
              style={{ marginTop: head ? '16.8px' : '0' }}
            >
              <div className="w-8 flex-shrink-0">
                {head && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-neutral-900"
                    style={{ backgroundColor: tint(msg.name) }}
                  >
                    {initials(msg.name)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 max-w-sm">
                {head && (
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm font-500 text-neutral-200">{msg.name}</span>
                    <span className="text-xs text-neutral-600">{msg.time}</span>
                  </div>
                )}
                <div className="text-sm leading-relaxed text-neutral-300 break-words">{msg.text}</div>
                {replyCount > 0 && (
                  <div className="inline-flex items-center gap-2 mt-2 text-xs text-accent-300">
                    <i className="ph ph-arrow-bend-down-right text-xs"></i>
                    <span>{replyCount === 1 ? '1 resposta' : `${replyCount} respostas`}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-8 pb-8">
        <div className="flex items-center gap-4 p-3 rounded-md bg-surface ring-1 ring-inset ring-neutral-800">
          <i className="ph ph-plus text-base text-neutral-600 cursor-pointer"></i>
          <input
            value={app.draft}
            onChange={(e) => app.setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Escrever em ${conversation.name}`}
            className="flex-1 min-w-0 border-0 outline-0 bg-transparent text-sm text-text placeholder-neutral-600"
          />
          <i
            onClick={handleSend}
            className={`ph ph-paper-plane-right text-base cursor-pointer transition-colors ${
              app.draft.trim() ? 'text-accent-300' : 'text-neutral-700'
            }`}
          ></i>
        </div>
      </div>
    </main>
  );
}
