using Microsoft.EntityFrameworkCore;
using SalaApp.Api.Models;

namespace SalaApp.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<Server> Servers => Set<Server>();

    public DbSet<Channel> Channels => Set<Channel>();

    public DbSet<Message> Messages => Set<Message>();

    public DbSet<ServerMember> ServerMembers => Set<ServerMember>();

    public DbSet<FriendRequest> FriendRequests => Set<FriendRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Server -> Owner (User): não deixa apagar um usuário que ainda é dono de um servidor.
        modelBuilder.Entity<Server>()
            .HasOne(s => s.Owner)
            .WithMany()
            .HasForeignKey(s => s.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Channel -> Server: apagar o servidor apaga seus canais.
        modelBuilder.Entity<Channel>()
            .HasOne(c => c.Server)
            .WithMany(s => s.Channels)
            .HasForeignKey(c => c.ServerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Message -> Channel: apagar o canal apaga suas mensagens.
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Channel)
            .WithMany(c => c.Messages)
            .HasForeignKey(m => m.ChannelId)
            .OnDelete(DeleteBehavior.Cascade);

        // Message -> Author (User): não deixa apagar um usuário que já postou mensagem.
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Author)
            .WithMany(u => u.Messages)
            .HasForeignKey(m => m.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Message -> ParentMessage (auto-relacionamento para threads): não deixa apagar uma
        // mensagem-pai que ainda tem respostas.
        modelBuilder.Entity<Message>()
            .HasOne(m => m.ParentMessage)
            .WithMany(m => m.Replies)
            .HasForeignKey(m => m.ParentMessageId)
            .OnDelete(DeleteBehavior.Restrict);

        // ServerMember -> Server / User: apagar servidor ou usuário remove a membership.
        modelBuilder.Entity<ServerMember>()
            .HasOne(sm => sm.Server)
            .WithMany(s => s.Members)
            .HasForeignKey(sm => sm.ServerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ServerMember>()
            .HasOne(sm => sm.User)
            .WithMany(u => u.Memberships)
            .HasForeignKey(sm => sm.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Um usuário só pode ter uma membership por servidor.
        modelBuilder.Entity<ServerMember>()
            .HasIndex(sm => new { sm.ServerId, sm.UserId })
            .IsUnique();

        // FriendRequest -> Sender / Receiver (User): dois FKs pra mesma tabela, então
        // WithMany() sem propriedade de coleção nomeada (mesmo padrão de Server.Owner) pra
        // evitar ambiguidade. Restrict nos dois pra não deixar apagar um usuário que ainda
        // tem solicitações de amizade pendentes ou aceitas.
        modelBuilder.Entity<FriendRequest>()
            .HasOne(fr => fr.Sender)
            .WithMany()
            .HasForeignKey(fr => fr.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FriendRequest>()
            .HasOne(fr => fr.Receiver)
            .WithMany()
            .HasForeignKey(fr => fr.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

        // Não permite duas solicitações Pending entre o mesmo par (na mesma direção).
        // Filtrado por Status = 0 (Pending) pra permitir reenviar depois de um Reject.
        modelBuilder.Entity<FriendRequest>()
            .HasIndex(fr => new { fr.SenderId, fr.ReceiverId })
            .IsUnique()
            .HasFilter("\"Status\" = 0");

        // Índices auxiliares pra listar pedidos recebidos/enviados por status.
        modelBuilder.Entity<FriendRequest>()
            .HasIndex(fr => new { fr.ReceiverId, fr.Status });

        modelBuilder.Entity<FriendRequest>()
            .HasIndex(fr => new { fr.SenderId, fr.Status });
    }
}
