'use client';

import { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useParticipants,
} from '@livekit/components-react';
import { fetchVoiceToken, VoiceToken } from '@/app/lib/voice';
import { initials, tint } from '@/app/lib/data';

interface VoiceChannelProps {
  /** Guid real de um Channel do backend (a sala do LiveKit é nomeada com esse id). */
  channelId: string;
}

/**
 * Conecta na sala de voz LiveKit do canal (token vem de GET /api/voice/token) e
 * mostra participantes + controle de mudo. Componente autocontido — não está
 * ligado à UI mock existente (VoicePanel.tsx).
 */
export default function VoiceChannel({ channelId }: VoiceChannelProps) {
  const [voiceToken, setVoiceToken] = useState<VoiceToken | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setVoiceToken(null);
    setError(null);

    fetchVoiceToken(channelId)
      .then((token) => {
        if (!cancelled) setVoiceToken(token);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
    };
  }, [channelId]);

  if (error) {
    return <div className="p-4 text-sm text-red-400">Não foi possível entrar na sala: {error}</div>;
  }

  if (!voiceToken) {
    return <div className="p-4 text-sm text-neutral-600">Conectando na sala de voz...</div>;
  }

  return (
    <LiveKitRoom token={voiceToken.token} serverUrl={voiceToken.url} connect audio video={false}>
      <RoomAudioRenderer />
      <VoiceChannelRoom />
    </LiveKitRoom>
  );
}

function VoiceChannelRoom() {
  const participants = useParticipants();
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();

  return (
    <div className="flex flex-col gap-3 p-6">
      <div className="flex flex-col gap-3">
        {participants.map((participant) => {
          const displayName = participant.name || participant.identity;
          const muted = !participant.isMicrophoneEnabled;
          const speaking = participant.isSpeaking && !muted;

          return (
            <div
              key={participant.identity}
              className="flex items-center gap-4 p-3 rounded-md bg-surface ring-1 ring-inset transition-all"
              style={{
                boxShadow: speaking ? 'inset 0 0 0 1px #5d5294, 0 0 28px rgba(145,132,217,0.16)' : undefined,
              }}
            >
              <div
                className="w-8.5 h-8.5 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-neutral-900"
                style={{ backgroundColor: tint(displayName) }}
              >
                {initials(displayName)}
              </div>
              <span
                className="flex-1 min-w-0 truncate text-sm transition-colors"
                style={{ color: speaking ? '#e7e5fe' : '#9397ab' }}
              >
                {displayName}
              </span>
              {muted && <i className="ph ph-microphone-slash text-sm text-neutral-600"></i>}
            </div>
          );
        })}
      </div>

      <div
        onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
        title="Microfone"
        className={`h-10 flex items-center justify-center rounded-md cursor-pointer transition-colors ${
          !isMicrophoneEnabled ? 'bg-neutral-800 text-neutral-300' : 'bg-accent-800 text-accent-200'
        }`}
      >
        <i className={`ph ${!isMicrophoneEnabled ? 'ph-microphone-slash' : 'ph-microphone'} text-base`}></i>
      </div>
    </div>
  );
}
