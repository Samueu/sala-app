using System.Text.Json.Serialization;

namespace SalaApp.Api.Models;

/// <summary>
/// Status de uma solicitação de amizade. Serializado como string ("Pending"/"Accepted"/
/// "Rejected") tanto nas respostas REST quanto nos eventos SignalR que reusam os mesmos
/// DTOs, sem precisar mexer em JsonSerializerOptions globais (que afetariam MVC e o
/// protocolo do SignalR separadamente).
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum FriendRequestStatus
{
    /// <remarks>
    /// Pending = 0 é usado literalmente no filtro do índice único em
    /// AppDbContext.OnModelCreating (HasFilter("\"Status\" = 0")) — não reordene os
    /// valores deste enum sem atualizar esse filtro também.
    /// </remarks>
    Pending,
    Accepted,
    Rejected,
}
