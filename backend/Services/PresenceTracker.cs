using System.Collections.Concurrent;

namespace SalaApp.Api.Services;

/// <summary>
/// Rastreia quais usuários estão online via SignalR, contando conexões (um usuário pode
/// ter várias abas/dispositivos abertos ao mesmo tempo — só fica offline quando a
/// última cai).
///
/// Registrado como Singleton, em memória: funciona só pra uma instância do backend.
/// Se o deploy escalar pra múltiplas instâncias, cada uma teria seu próprio estado de
/// presença isolado (precisaria de um backplane tipo Redis pra sincronizar) — fora do
/// escopo atual.
/// </summary>
public class PresenceTracker : IPresenceTracker
{
    private readonly ConcurrentDictionary<Guid, ConcurrentDictionary<string, byte>> _connections = new();

    public bool AddConnection(Guid userId, string connectionId)
    {
        var connectionIds = _connections.GetOrAdd(userId, _ => new ConcurrentDictionary<string, byte>());
        connectionIds.TryAdd(connectionId, 0);
        // Checar a contagem logo após o próprio TryAdd (em vez de antes dele) encurta a
        // janela de corrida entre duas conexões novas do mesmo usuário chegando ao mesmo
        // tempo — não elimina totalmente (ConcurrentDictionary.Count é um snapshot), mas
        // pra uma feature de presença um falso positivo ocasional (duas notificações de
        // "ficou online" em vez de uma) é aceitável e se autocorrige na próxima mudança.
        return connectionIds.Count == 1;
    }

    public bool RemoveConnection(Guid userId, string connectionId)
    {
        if (!_connections.TryGetValue(userId, out var connectionIds))
        {
            return false;
        }

        connectionIds.TryRemove(connectionId, out _);

        if (!connectionIds.IsEmpty)
        {
            return false;
        }

        // Remove a entrada do usuário só se continuar vazia (evita ficar acumulando
        // dicionários vazios pra todo usuário que já passou por aqui).
        _connections.TryRemove(userId, out _);
        return true;
    }

    public bool IsOnline(Guid userId) =>
        _connections.TryGetValue(userId, out var connectionIds) && !connectionIds.IsEmpty;
}
