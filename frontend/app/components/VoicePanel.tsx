'use client';

import { useApp } from '@/app/lib/context';
import { initials, tint } from '@/app/lib/data';

export default function VoicePanel() {
  const app = useApp();
  const server = app.servers[app.serverId];
  const rooms =
    app.scopeKind === 'dm' ? Object.values(app.servers).flatMap((s) => s.rooms) : server.rooms;

  const voiceRoom = app.voiceRoom ? rooms.find((r) => r.id === app.voiceRoom) : null;
  const voicePeople = voiceRoom ? voiceRoom.people : [];

  return (
    <section className="flex flex-col min-w-0 min-h-0 border-l border-neutral-800 bg-gradient-to-b from-neutral-900 to-bg w-66">
      <header className="flex items-center gap-3 px-6 py-6 border-b border-neutral-800">
        <span className="flex-1 text-xs tracking-widest uppercase text-neutral-600">Voz</span>
        {app.voiceRoom && (
          <span className="flex items-center gap-2 text-xs text-accent-300">
            <span className="w-1 h-1 rounded-full bg-accent-400 animate-pulse"></span>
            <span>conexão boa</span>
          </span>
        )}
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        {app.voiceRoom && voiceRoom ? (
          <div>
            <div className="font-heading text-sm font-500">{voiceRoom.name}</div>
            <div className="mt-1 text-xs text-neutral-600">
              {voicePeople.length} {voicePeople.length === 1 ? 'pessoa' : 'pessoas'} na sala
            </div>
            <div className="flex flex-col gap-3 mt-8">
              {voicePeople.map((name) => {
                const muted = name === 'Você' && app.muted;
                const speaking = name === app.speaking && !muted;
                return (
                  <div
                    key={name}
                    className="flex items-center gap-4 p-3 rounded-md bg-surface ring-1 ring-inset transition-all"
                    style={{
                      boxShadow: speaking ? 'inset 0 0 0 1px #5d5294, 0 0 28px rgba(145,132,217,0.16)' : undefined,
                    }}
                  >
                    <div
                      className="w-8.5 h-8.5 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-neutral-900"
                      style={{ backgroundColor: tint(name) }}
                    >
                      {initials(name)}
                    </div>
                    <span
                      className="flex-1 min-w-0 truncate text-sm transition-colors"
                      style={{
                        color: speaking ? '#e7e5fe' : '#9397ab',
                      }}
                    >
                      {name}
                    </span>
                    {muted && <i className="ph ph-microphone-slash text-sm text-neutral-600"></i>}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => app.setVoiceRoom(room.id)}
                className="p-4 rounded-md bg-surface ring-1 ring-inset ring-neutral-800 cursor-pointer hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <i className="ph ph-speaker-high text-sm text-neutral-600"></i>
                  <span className="flex-1 min-w-0 truncate text-sm text-neutral-200">{room.name}</span>
                  <span className="text-xs text-neutral-600">{room.people.length}</span>
                </div>
                <div className="mt-3 text-xs text-neutral-600">
                  {room.people.length > 0 ? room.people.join(', ') : 'ninguém aqui agora'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {app.voiceRoom && (
        <div className="flex gap-3 p-6 border-t border-neutral-800">
          <div
            onClick={() => app.setMuted(!app.muted)}
            title="Microfone"
            className={`flex-1 h-10 flex items-center justify-center rounded-md cursor-pointer transition-colors ${
              app.muted ? 'bg-neutral-800 text-neutral-300' : 'bg-accent-800 text-accent-200'
            }`}
          >
            <i className={`ph ${app.muted ? 'ph-microphone-slash' : 'ph-microphone'} text-base`}></i>
          </div>
          <div
            onClick={() => app.setDeafened(!app.deafened)}
            title="Áudio"
            className={`flex-1 h-10 flex items-center justify-center rounded-md cursor-pointer transition-colors ${
              app.deafened ? 'bg-neutral-800 text-neutral-300' : 'bg-accent-800 text-accent-200'
            }`}
          >
            <i className={`ph ${app.deafened ? 'ph-speaker-slash' : 'ph-headphones'} text-base`}></i>
          </div>
          <div
            onClick={() => app.setVoiceRoom(null)}
            title="Sair"
            className="flex-1 h-10 flex items-center justify-center rounded-md cursor-pointer bg-neutral-800 text-neutral-300 hover:text-neutral-200 transition-colors"
          >
            <i className="ph ph-phone-x text-base"></i>
          </div>
        </div>
      )}
    </section>
  );
}
