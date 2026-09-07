namespace SalaApp.Api.Services;

public interface IPresenceTracker
{
    /// <summary>Registra uma conexão SignalR pro usuário. Retorna true se essa foi a primeira conexão dele (ficou online agora).</summary>
    bool AddConnection(Guid userId, string connectionId);

    /// <summary>Remove uma conexão SignalR do usuário. Retorna true se essa era a última (ficou offline agora).</summary>
    bool RemoveConnection(Guid userId, string connectionId);

    bool IsOnline(Guid userId);
}
