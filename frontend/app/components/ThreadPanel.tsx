'use client';

import { useApp } from '@/app/lib/context';
import { initials, tint } from '@/app/lib/data';

export default function ThreadPanel() {
  const app = useApp();

  if (!app.threadKey) return null;

  const messages = app.convos[app.threadKey.key] || [];
  const parentMsg = messages[app.threadKey.idx];

  if (!parentMsg) return null;

  const handleSend = () => {
    app.sendReply(app.threadDraft);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="flex flex-col min-w-0 min-h-0 bg-neutral-900 border-l border-neutral-800 w-72">
      <header className="flex items-center gap-3 p-6 border-b border-neutral-800">
        <i className="ph ph-arrow-bend-down-right text-base text-neutral-600"></i>
        <span className="flex-1 min-w-0 font-heading text-sm font-500">Thread</span>
        <i
          onClick={() => app.setThreadKey(null)}
          className="ph ph-x text-base text-neutral-600 cursor-pointer hover:text-neutral-400 transition-colors"
        ></i>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        <div className="pb-6 border-b border-neutral-800">
          <div className="flex items-baseline gap-3">
            <span className="text-xs font-500 text-neutral-200">{parentMsg.name}</span>
            <span className="text-xs text-neutral-600">{parentMsg.time}</span>
          </div>
          <div className="mt-2 text-sm leading-relaxed text-neutral-300 break-words">{parentMsg.text}</div>
        </div>

        <div className="flex flex-col gap-6 pt-6">
          {(parentMsg.replies || []).map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <div
                className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-neutral-900"
                style={{ backgroundColor: tint(reply.name) }}
              >
                {initials(reply.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-500 text-neutral-200">{reply.name}</span>
                  <span className="text-xs text-neutral-600">{reply.time}</span>
                </div>
                <div className="text-sm leading-tight text-neutral-300 break-words mt-1">{reply.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-center gap-3 p-3 rounded-md bg-surface ring-1 ring-inset ring-neutral-800">
          <input
            value={app.threadDraft}
            onChange={(e) => app.setThreadDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Responder na thread"
            className="flex-1 min-w-0 border-0 outline-0 bg-transparent text-xs text-text placeholder-neutral-600"
          />
          <i
            onClick={handleSend}
            className={`ph ph-paper-plane-right text-base cursor-pointer transition-colors ${
              app.threadDraft.trim() ? 'text-accent-300' : 'text-neutral-700'
            }`}
          ></i>
        </div>
      </div>
    </section>
  );
}
