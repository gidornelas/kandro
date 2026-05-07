import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding NEXUS database...");

  // ─── Clean existing data ──────────────────────────────
  await prisma.$transaction([
    prisma.activity.deleteMany(),
    prisma.voiceParticipant.deleteMany(),
    prisma.voiceSession.deleteMany(),
    prisma.fileNodeTeam.deleteMany(),
    prisma.fileNode.deleteMany(),
    prisma.teamPermission.deleteMany(),
    prisma.teamMember.deleteMany(),
    prisma.team.deleteMany(),
    prisma.cardComment.deleteMany(),
    prisma.subtask.deleteMany(),
    prisma.cardAssignee.deleteMany(),
    prisma.cardLabel.deleteMany(),
    prisma.kanbanCard.deleteMany(),
    prisma.kanbanColumn.deleteMany(),
    prisma.taskCardRef.deleteMany(),
    prisma.attachment.deleteMany(),
    prisma.reaction.deleteMany(),
    prisma.message.deleteMany(),
    prisma.channel.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.workspaceMember.deleteMany(),
    prisma.workspace.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash("nexus123", 12);

  // ─── Users (matching mock IDs) ────────────────────────
  const rc = await prisma.user.create({
    data: { id: "rc", email: "rafael@nexus.io", passwordHash, name: "Rafael Costa", initials: "RC", color: "#7c6af7", role: "Lead Designer" },
  });
  const al = await prisma.user.create({
    data: { id: "al", email: "ana@nexus.io", passwordHash, name: "Ana Lima", initials: "AL", color: "#f472b6", role: "UX Designer" },
  });
  const cm = await prisma.user.create({
    data: { id: "cm", email: "carlos@nexus.io", passwordHash, name: "Carlos Matos", initials: "CM", color: "#fbbf24", role: "Product Manager", status: "busy" },
  });
  const jl = await prisma.user.create({
    data: { id: "jl", email: "joao@nexus.io", passwordHash, name: "João Lemos", initials: "JL", color: "#60a5fa", role: "Dev Frontend" },
  });
  const ms = await prisma.user.create({
    data: { id: "ms", email: "marina@nexus.io", passwordHash, name: "Marina Silva", initials: "MS", color: "#34d399", role: "Brand Designer", status: "away" },
  });

  console.log("  ✓ 5 users created");

  // ─── Workspace ────────────────────────────────────────
  const ws = await prisma.workspace.create({
    data: {
      id: "acme",
      name: "Acme Design",
      initials: "AD",
      color: "#7c6af7",
      members: {
        create: [
          { userId: rc.id, role: "owner" },
          { userId: al.id, role: "member" },
          { userId: cm.id, role: "admin" },
          { userId: jl.id, role: "member" },
          { userId: ms.id, role: "member" },
        ],
      },
    },
  });

  console.log("  ✓ Workspace 'Acme Design' created");

  // ─── Channels ─────────────────────────────────────────
  const geral = await prisma.channel.create({
    data: { id: "geral", workspaceId: ws.id, name: "geral", icon: "#", type: "text", description: "Canal geral da equipe" },
  });
  const designRevs = await prisma.channel.create({
    data: { id: "design-reviews", workspaceId: ws.id, name: "design-reviews", icon: "#", type: "text", description: "Reviews de design" },
  });
  const releases = await prisma.channel.create({
    data: { id: "releases", workspaceId: ws.id, name: "releases", icon: "#", type: "text", description: "Lançamentos e deploys" },
  });
  const adminOps = await prisma.channel.create({
    data: { id: "admin-ops", workspaceId: ws.id, name: "admin-ops", icon: "#", type: "text", private: true, description: "Operações administrativas" },
  });
  const sprint12 = await prisma.channel.create({
    data: {
      id: "sprint12", workspaceId: ws.id, name: "Sprint 12", icon: "⊞", type: "board", description: "Board do sprint atual",
      kanbanColumns: {
        create: [
          { id: "backlog", name: "Backlog", color: "#9899b0", position: 0 },
          { id: "progress", name: "Em Progresso", color: "#60a5fa", position: 1 },
          { id: "review", name: "Em Revisão", color: "#fbbf24", position: 2 },
          { id: "done", name: "Concluído", color: "#4ade80", position: 3 },
        ],
      },
    },
  });
  const dsv2 = await prisma.channel.create({
    data: { id: "dsv2", workspaceId: ws.id, name: "Design System v2", icon: "⊞", type: "board", description: "Evolução do design system" },
  });
  const onboarding = await prisma.channel.create({
    data: { id: "onboarding", workspaceId: ws.id, name: "Onboarding Flow", icon: "⊞", type: "board", description: "Fluxo de onboarding" },
  });
  const standup = await prisma.channel.create({
    data: { id: "standup", workspaceId: ws.id, name: "Standup Daily", icon: "🔊", type: "voice", description: "Daily standup" },
  });
  const reviewsVoice = await prisma.channel.create({
    data: { id: "reviews-voice", workspaceId: ws.id, name: "Design Reviews", icon: "🔊", type: "voice", description: "Reviews de design por voz" },
  });

  console.log("  ✓ 9 channels created");

  // ─── Kanban Cards ────────────────────────────────────
  const now = new Date();
  const cards = await Promise.all([
    prisma.kanbanCard.create({ data: { id: "c1", columnId: "backlog", title: "Definir tokens de cor para dark mode", priority: "Média", priorityColor: "#fbbf24", due: new Date(now.getFullYear(), 4, 10), position: 0 } }),
    prisma.kanbanCard.create({ data: { id: "c2", columnId: "backlog", title: "Auditoria de acessibilidade nos componentes", priority: "Alta", priorityColor: "#f87171", due: new Date(now.getFullYear(), 4, 8), dueType: "overdue", position: 1 } }),
    prisma.kanbanCard.create({ data: { id: "c3", columnId: "backlog", title: "Documentar guidelines de spacing", priority: "Baixa", priorityColor: "#9899b0", due: new Date(now.getFullYear(), 4, 15), position: 2 } }),
    prisma.kanbanCard.create({ data: { id: "c4", columnId: "backlog", title: "Benchmark de onboarding de concorrentes", priority: "Média", priorityColor: "#fbbf24", due: new Date(now.getFullYear(), 4, 12), position: 3 } }),
    prisma.kanbanCard.create({ data: { id: "c5", columnId: "progress", title: "Redesenhar fluxo de checkout", priority: "Alta", priorityColor: "#f87171", due: new Date(now.getFullYear(), 4, 6), dueType: "warning", progress: 65, position: 0 } }),
    prisma.kanbanCard.create({ data: { id: "c6", columnId: "progress", title: "Implementar componente DataTable", priority: "Alta", priorityColor: "#f87171", due: new Date(now.getFullYear(), 4, 5), dueType: "overdue", progress: 80, position: 1 } }),
    prisma.kanbanCard.create({ data: { id: "c7", columnId: "progress", title: "Criar ilustrações para empty states", priority: "Média", priorityColor: "#fbbf24", due: new Date(now.getFullYear(), 4, 9), progress: 40, position: 2 } }),
    prisma.kanbanCard.create({ data: { id: "c8", columnId: "review", title: "Revisar handoff da nova landing", priority: "Alta", priorityColor: "#f87171", due: new Date(now.getFullYear(), 4, 4), dueType: "overdue", progress: 95, position: 0 } }),
    prisma.kanbanCard.create({ data: { id: "c9", columnId: "review", title: "Testes de usabilidade do onboarding", priority: "Média", priorityColor: "#fbbf24", due: new Date(now.getFullYear(), 4, 7), dueType: "warning", progress: 90, position: 1 } }),
    prisma.kanbanCard.create({ data: { id: "c10", columnId: "done", title: "Definir arquitetura de informação", priority: "Alta", priorityColor: "#f87171", due: new Date(now.getFullYear(), 4, 1), progress: 100, position: 0 } }),
    prisma.kanbanCard.create({ data: { id: "c11", columnId: "done", title: "Criar logo versão monocromática", priority: "Baixa", priorityColor: "#9899b0", due: new Date(now.getFullYear(), 3, 30), progress: 100, position: 1 } }),
    prisma.kanbanCard.create({ data: { id: "c12", columnId: "done", title: "Setup do projeto no GitHub", priority: "Média", priorityColor: "#fbbf24", due: new Date(now.getFullYear(), 3, 28), progress: 100, position: 2 } }),
    prisma.kanbanCard.create({ data: { id: "c13", columnId: "done", title: "Wireframes da dashboard", priority: "Alta", priorityColor: "#f87171", due: new Date(now.getFullYear(), 3, 29), progress: 100, position: 3 } }),
    prisma.kanbanCard.create({ data: { id: "c14", columnId: "done", title: "Pesquisa com 12 usuários", priority: "Alta", priorityColor: "#f87171", due: new Date(now.getFullYear(), 3, 25), progress: 100, position: 4 } }),
  ]);

  // Card labels
  await prisma.cardLabel.createMany({
    data: [
      { cardId: "c1", name: "Design", color: "#7c6af7" },
      { cardId: "c2", name: "UX", color: "#f472b6" }, { cardId: "c2", name: "Dev", color: "#34d399" },
      { cardId: "c3", name: "Design", color: "#7c6af7" },
      { cardId: "c4", name: "UX", color: "#f472b6" },
      { cardId: "c5", name: "UX", color: "#f472b6" }, { cardId: "c5", name: "Design", color: "#7c6af7" },
      { cardId: "c6", name: "Dev", color: "#34d399" },
      { cardId: "c7", name: "Design", color: "#7c6af7" },
      { cardId: "c8", name: "Design", color: "#7c6af7" }, { cardId: "c8", name: "Dev", color: "#34d399" },
      { cardId: "c9", name: "UX", color: "#f472b6" },
      { cardId: "c10", name: "UX", color: "#f472b6" },
      { cardId: "c11", name: "Design", color: "#7c6af7" },
      { cardId: "c12", name: "Dev", color: "#34d399" },
      { cardId: "c13", name: "UX", color: "#f472b6" }, { cardId: "c13", name: "Design", color: "#7c6af7" },
      { cardId: "c14", name: "UX", color: "#f472b6" },
    ],
  });

  // Card assignees
  await prisma.cardAssignee.createMany({
    data: [
      { cardId: "c1", userId: "rc" }, { cardId: "c1", userId: "al" },
      { cardId: "c2", userId: "al" },
      { cardId: "c3", userId: "ms" },
      { cardId: "c4", userId: "cm" },
      { cardId: "c5", userId: "al" }, { cardId: "c5", userId: "rc" },
      { cardId: "c6", userId: "jl" },
      { cardId: "c7", userId: "ms" },
      { cardId: "c8", userId: "rc" }, { cardId: "c8", userId: "jl" },
      { cardId: "c9", userId: "cm" }, { cardId: "c9", userId: "al" },
      { cardId: "c10", userId: "al" },
      { cardId: "c11", userId: "ms" },
      { cardId: "c12", userId: "jl" },
      { cardId: "c13", userId: "rc" }, { cardId: "c13", userId: "al" },
      { cardId: "c14", userId: "cm" },
    ],
  });

  console.log("  ✓ 14 kanban cards with labels & assignees created");

  // ─── Messages ─────────────────────────────────────────
  // We create messages one-by-one so we can add reactions
  const m1 = await prisma.message.create({
    data: { id: "m1", channelId: "geral", userId: "cm", text: "Bom dia, equipe! @Ana Lima você pode revisar os wireframes da nova landing page até amanhã?", createdAt: new Date("2026-05-04T09:14:00") },
  });
  const m2 = await prisma.message.create({
    data: { id: "m2", channelId: "geral", userId: "al", text: "Claro! Vou começar agora de manhã. A propósito, o `useAuth()` já está integrado no novo fluxo?", createdAt: new Date("2026-05-04T09:22:00") },
  });
  const m3 = await prisma.message.create({
    data: { id: "m3", channelId: "geral", userId: "jl", text: "Sim, finalizei ontem à noite. Deixei o arquivo atualizado no Figma com as anotações de handoff.", createdAt: new Date("2026-05-04T09:30:00") },
  });
  const m4 = await prisma.message.create({
    data: { id: "m4", channelId: "geral", userId: "rc", text: "Pessoal, precisamos criar uma task para revisar a hierarquia tipográfica do novo Design System. Alguém pode pegar?", createdAt: new Date("2026-05-04T10:05:00") },
  });
  const m5 = await prisma.message.create({
    data: { id: "m5", channelId: "geral", userId: "ms", text: "Finalizei os novos ícones do set de navegação. @Rafael Costa quando você quiser dar uma olhada, está no board.", createdAt: new Date("2026-05-04T10:42:00") },
  });
  const m6 = await prisma.message.create({
    data: { id: "m6", channelId: "geral", userId: "rc", text: "Perfeito, Marina! Vou revisar depois do almoço. O progresso da sprint está ótimo.", createdAt: new Date("2026-05-04T11:15:00") },
  });

  // Attachments
  await prisma.attachment.create({
    data: { messageId: "m3", name: "landing-v3.fig", size: 12400000, icon: "🎨", encrypted: true },
  });

  // Reactions
  await prisma.reaction.createMany({
    data: [
      { messageId: "m1", userId: "rc", emoji: "👍" },
      { messageId: "m1", userId: "al", emoji: "👍" },
      { messageId: "m1", userId: "cm", emoji: "✅" },
      { messageId: "m3", userId: "rc", emoji: "🙏" },
      { messageId: "m3", userId: "al", emoji: "🙏" },
      { messageId: "m3", userId: "cm", emoji: "🙏" },
      { messageId: "m4", userId: "jl", emoji: "📝" },
      { messageId: "m4", userId: "cm", emoji: "📝" },
      { messageId: "m5", userId: "rc", emoji: "🎉" },
      { messageId: "m5", userId: "al", emoji: "🎉" },
      { messageId: "m5", userId: "jl", emoji: "🎉" },
      { messageId: "m5", userId: "cm", emoji: "🎉" },
      { messageId: "m5", userId: "ms", emoji: "🎉" },
    ],
  });

  console.log("  ✓ 6 messages with reactions created");

  // ─── Teams (matching mock) ────────────────────────────
  const teamDesign = await prisma.team.create({
    data: { id: "design", workspaceId: ws.id, name: "Design", color: "#7c6af7" },
  });
  const teamProduto = await prisma.team.create({
    data: { id: "produto", workspaceId: ws.id, name: "Produto", color: "#f97316" },
  });
  const teamDev = await prisma.team.create({
    data: { id: "dev", workspaceId: ws.id, name: "Dev", color: "#4ade80" },
  });
  const teamMarketing = await prisma.team.create({
    data: { id: "marketing", workspaceId: ws.id, name: "Marketing", color: "#f87171" },
  });
  const teamLideranca = await prisma.team.create({
    data: { id: "lideranca", workspaceId: ws.id, name: "Liderança", color: "#fbbf24" },
  });

  // Team members
  await prisma.teamMember.createMany({
    data: [
      { teamId: "design", userId: "rc" }, { teamId: "design", userId: "al" }, { teamId: "design", userId: "ms" },
      { teamId: "produto", userId: "cm" }, { teamId: "produto", userId: "jl" }, { teamId: "produto", userId: "rc" },
      { teamId: "dev", userId: "jl" },
      { teamId: "marketing", userId: "ms" }, { teamId: "marketing", userId: "cm" },
      { teamId: "lideranca", userId: "rc" }, { teamId: "lideranca", userId: "cm" },
    ],
  });

  // Team permissions
  await prisma.teamPermission.createMany({
    data: [
      { teamId: "design", resourceId: "design-reviews", resourceType: "channel", actions: ["view", "post", "comment", "edit"] },
      { teamId: "design", resourceId: "dsv2", resourceType: "board", actions: ["view", "comment", "edit"] },
      { teamId: "design", resourceId: "onboarding", resourceType: "board", actions: ["view", "comment", "edit"] },
      { teamId: "design", resourceId: "design-assets", resourceType: "folder", actions: ["view", "edit", "manage"] },
      { teamId: "design", resourceId: "brand-guide", resourceType: "folder", actions: ["view", "edit"] },
      { teamId: "produto", resourceId: "releases", resourceType: "channel", actions: ["view", "post", "comment", "edit"] },
      { teamId: "produto", resourceId: "sprint12", resourceType: "board", actions: ["view", "comment", "edit", "manage"] },
      { teamId: "produto", resourceId: "dsv2", resourceType: "board", actions: ["view", "comment", "edit"] },
      { teamId: "produto", resourceId: "onboarding", resourceType: "board", actions: ["view", "comment", "edit"] },
      { teamId: "produto", resourceId: "research", resourceType: "folder", actions: ["view", "edit", "manage"] },
      { teamId: "dev", resourceId: "releases", resourceType: "channel", actions: ["view", "post", "comment", "edit"] },
      { teamId: "dev", resourceId: "sprint12", resourceType: "board", actions: ["view", "comment", "edit"] },
      { teamId: "dev", resourceId: "specs-tecnicas", resourceType: "folder", actions: ["view", "edit", "manage"] },
      { teamId: "marketing", resourceId: "campanhas", resourceType: "folder", actions: ["view", "edit", "manage"] },
      { teamId: "marketing", resourceId: "brand-guide", resourceType: "folder", actions: ["view"] },
      { teamId: "lideranca", resourceId: "geral", resourceType: "channel", actions: ["view", "post", "comment", "edit", "manage"] },
      { teamId: "lideranca", resourceId: "design-reviews", resourceType: "channel", actions: ["view", "post", "comment", "edit", "manage"] },
      { teamId: "lideranca", resourceId: "releases", resourceType: "channel", actions: ["view", "post", "comment", "edit", "manage"] },
      { teamId: "lideranca", resourceId: "admin-ops", resourceType: "channel", actions: ["view", "post", "comment", "edit", "manage", "admin"] },
      { teamId: "lideranca", resourceId: "sprint12", resourceType: "board", actions: ["view", "comment", "edit", "manage"] },
      { teamId: "lideranca", resourceId: "dsv2", resourceType: "board", actions: ["view", "comment", "edit", "manage"] },
      { teamId: "lideranca", resourceId: "onboarding", resourceType: "board", actions: ["view", "comment", "edit", "manage"] },
      { teamId: "lideranca", resourceId: "design-assets", resourceType: "folder", actions: ["view", "edit", "manage"] },
      { teamId: "lideranca", resourceId: "brand-guide", resourceType: "folder", actions: ["view", "edit", "manage"] },
      { teamId: "lideranca", resourceId: "research", resourceType: "folder", actions: ["view", "edit", "manage"] },
      { teamId: "lideranca", resourceId: "campanhas", resourceType: "folder", actions: ["view", "edit", "manage"] },
      { teamId: "lideranca", resourceId: "specs-tecnicas", resourceType: "folder", actions: ["view", "edit", "manage"] },
    ],
  });

  console.log("  ✓ 5 teams with members & permissions created");

  // ─── File folder structure ────────────────────────────
  const folderDesign = await prisma.fileNode.create({
    data: { id: "design-assets", workspaceId: ws.id, name: "Design Assets", type: "folder", icon: "📁", uploadedById: "rc" },
  });
  const folderBrand = await prisma.fileNode.create({
    data: { id: "brand-guide", workspaceId: ws.id, name: "Brand Guidelines", type: "folder", icon: "📁", uploadedById: "ms" },
  });
  const folderResearch = await prisma.fileNode.create({
    data: { id: "research", workspaceId: ws.id, name: "Research", type: "folder", icon: "📁", uploadedById: "cm" },
  });
  const folderCampanhas = await prisma.fileNode.create({
    data: { id: "campanhas", workspaceId: ws.id, name: "Campanhas", type: "folder", icon: "📁", uploadedById: "ms" },
  });
  const folderSpecs = await prisma.fileNode.create({
    data: { id: "specs-tecnicas", workspaceId: ws.id, name: "Specs Técnicas", type: "folder", icon: "📁", uploadedById: "jl" },
  });

  // File-team associations
  await prisma.fileNodeTeam.createMany({
    data: [
      { fileNodeId: "design-assets", teamId: "design" },
      { fileNodeId: "design-assets", teamId: "lideranca" },
      { fileNodeId: "brand-guide", teamId: "design" },
      { fileNodeId: "brand-guide", teamId: "marketing" },
      { fileNodeId: "brand-guide", teamId: "lideranca" },
      { fileNodeId: "research", teamId: "produto" },
      { fileNodeId: "research", teamId: "lideranca" },
      { fileNodeId: "campanhas", teamId: "marketing" },
      { fileNodeId: "specs-tecnicas", teamId: "dev" },
      { fileNodeId: "specs-tecnicas", teamId: "lideranca" },
    ],
  });

  // ─── Projects ─────────────────────────────────────────
  const projSprint = await prisma.project.create({
    data: { id: "sprint12", workspaceId: ws.id, name: "Sprint 12", status: "Em andamento", dateRange: "14–28 Mai" },
  });
  const projDs = await prisma.project.create({
    data: { id: "dsv2", workspaceId: ws.id, name: "Design System v2", status: "Em andamento", dateRange: "01–31 Mai" },
  });
  const projOnboarding = await prisma.project.create({
    data: { id: "onboarding", workspaceId: ws.id, name: "Onboarding Flow", status: "Planejado", dateRange: "Jun 2025" },
  });

  await prisma.projectMember.createMany({
    data: [
      { projectId: "sprint12", userId: "rc", role: "owner" },
      { projectId: "sprint12", userId: "al", role: "member" },
      { projectId: "sprint12", userId: "cm", role: "member" },
      { projectId: "sprint12", userId: "jl", role: "member" },
      { projectId: "sprint12", userId: "ms", role: "member" },
      { projectId: "dsv2", userId: "rc", role: "owner" },
      { projectId: "dsv2", userId: "al", role: "member" },
      { projectId: "dsv2", userId: "ms", role: "member" },
      { projectId: "onboarding", userId: "cm", role: "owner" },
      { projectId: "onboarding", userId: "al", role: "member" },
    ],
  });

  console.log("  ✓ 3 projects with members created");

  // ─── Direct Messages ──────────────────────────────────
  const dmRoomAl = await prisma.directMessageRoom.create({
    data: { id: "dm-al", userAId: "rc", userBId: "al" },
  });
  const dmRoomJl = await prisma.directMessageRoom.create({
    data: { id: "dm-jl", userAId: "rc", userBId: "jl" },
  });
  const dmRoomCm = await prisma.directMessageRoom.create({
    data: { id: "dm-cm", userAId: "rc", userBId: "cm" },
  });
  const dmRoomMs = await prisma.directMessageRoom.create({
    data: { id: "dm-ms", userAId: "rc", userBId: "ms" },
  });

  await prisma.directMessage.createMany({
    data: [
      { roomId: "dm-al", userId: "al", text: "Rafael, vi seu comentário no checkout. Podemos simplificar o step 2.", createdAt: new Date("2026-05-03T16:30:00") },
      { roomId: "dm-al", userId: "rc", text: "Concordo! Ajustamos na daily amanhã.", createdAt: new Date("2026-05-03T16:45:00") },
      { roomId: "dm-al", userId: "al", text: "Wireframes atualizados! 🎉", createdAt: new Date("2026-05-04T09:05:00") },
    ],
  });

  console.log("  ✓ 4 DM rooms with messages created");

  // ─── Card Thread Messages ─────────────────────────────
  await prisma.cardThreadMessage.createMany({
    data: [
      { cardId: "c5", userId: "cm", text: "Queda de 18% na conversão. Precisamos priorizar." },
      { cardId: "c5", userId: "rc", text: "Vou alocar tempo amanhã. Tenho referências do Stripe." },
      { cardId: "c5", userId: "al", text: "Wireframes prontos! Reduzimos de 6 para 3 passos." },
    ],
  });

  console.log("  ✓ 3 card thread messages created");
  console.log("\n✅ Seed complete! Users can login with password 'nexus123'");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
