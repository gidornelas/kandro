/**
 * In-memory PrismaClient mock for integration tests.
 *
 * Supports the subset of models and query patterns used by NEXUS backend:
 * user, refreshToken, workspace, workspaceMember, channel, message, reaction,
 * attachment, taskCardRef, activity, team, kanbanCard, kanbanColumn.
 *
 * Patterns: create, findUnique (simple + compound keys), findMany (equality,
 * `in`, nested `some` filters), update, delete, include resolution for common
 * relations, $transaction (passthrough), cursor pagination, nested creates.
 */

type RecordMap = Map<string, Record<string, unknown>>;

interface StoreMap {
  [model: string]: RecordMap;
}

function initStores(): StoreMap {
  const models = [
    "user", "refreshToken", "workspace", "workspaceMember",
    "channel", "message", "reaction", "attachment", "taskCardRef",
    "activity", "team", "teamMember", "teamPermission",
    "kanbanCard", "kanbanColumn",
  ];
  const stores: StoreMap = {};
  for (const m of models) stores[m] = new Map();
  return stores;
}

function genId(): string {
  return `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function now(): Date {
  return new Date();
}

function findByField(store: RecordMap, field: string, value: unknown): Record<string, unknown> | undefined {
  for (const record of store.values()) {
    if (record[field] === value) return record;
  }
  return undefined;
}

function findByCompoundKey(store: RecordMap, fields: string[], values: Record<string, unknown>): Record<string, unknown> | undefined {
  for (const record of store.values()) {
    if (fields.every(f => record[f] === values[f])) return record;
  }
  return undefined;
}

const relationMap: Record<string, Record<string, { store: string; joinOn: string }>> = {
  workspace: { members: { store: "workspaceMember", joinOn: "workspaceId" } },
  team: {
    members: { store: "teamMember", joinOn: "teamId" },
    permissions: { store: "teamPermission", joinOn: "teamId" },
  },
};

function matchWhere(record: Record<string, unknown>, where: Record<string, unknown>, stores: StoreMap, model: string): boolean {
  for (const [key, value] of Object.entries(where)) {
    if (key === "OR") {
      const conditions = value as Record<string, unknown>[];
      if (!conditions.some(c => matchWhere(record, c, stores, model))) return false;
      continue;
    }
    if (key === "AND") {
      const conditions = value as Record<string, unknown>[];
      if (!conditions.every(c => matchWhere(record, c, stores, model))) return false;
      continue;
    }
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const objValue = value as Record<string, unknown>;
      if ("in" in objValue) {
        if (!(objValue.in as unknown[]).includes(record[key])) return false;
        continue;
      }
      // 'some' is for relation filters (e.g., members: { some: { userId } })
      if ("some" in objValue) {
        const relations = relationMap[model];
        const rel = relations?.[key];
        if (!rel) return false; // unmapped relation → fail closed
        const relatedStore = stores[rel.store] as RecordMap | undefined;
        if (!relatedStore) return false; // missing store → fail closed
        const nestedCondition = objValue.some as Record<string, unknown>;
        let found = false;
        for (const related of relatedStore.values()) {
          if (related[rel.joinOn] === record.id) {
            if (matchWhere(related, nestedCondition, stores, rel.store)) {
              found = true;
              break;
            }
          }
        }
        if (!found) return false;
        continue;
      }
    }
    if (record[key] !== value) return false;
  }
  return true;
}

function resolveInclude(
  model: string,
  record: Record<string, unknown> | null | undefined,
  include: Record<string, unknown> | undefined,
  stores: StoreMap,
  findMany: (model: string, where: Record<string, unknown>) => Record<string, unknown>[],
): Record<string, unknown> | null | undefined {
  if (!record || !include) return record;

  const result = { ...record };

  for (const [relation, opts] of Object.entries(include)) {
    if (relation === "_count") {
      result._count = { messages: 0 };
      continue;
    }

    const relOpts = opts as Record<string, unknown> | undefined;

    if (relation === "user") {
      const user = findByField(stores.user, "id", record.userId);
      if (relOpts?.select) {
        const select = relOpts.select as Record<string, boolean>;
        const filtered: Record<string, unknown> = {};
        for (const field of Object.keys(select)) filtered[field] = user?.[field];
        result.user = filtered;
      } else {
        result.user = user ?? null;
      }
    } else if (relation === "workspace") {
      result.workspace = findByField(stores.workspace, "id", record.workspaceId) ?? null;
    } else if (relation === "channel") {
      result.channel = findByField(stores.channel, "id", record.channelId) ?? null;
    } else if (relation === "column") {
      const column = findByField(stores.kanbanColumn, "id", record.columnId) ?? null;
      if (column && relOpts?.include) {
        result.column = resolveInclude("kanbanColumn", column, relOpts.include as Record<string, unknown>, stores, findMany);
      } else {
        result.column = column;
      }
    } else if (relation === "reactions") {
      const all: Record<string, unknown>[] = [];
      for (const r of stores.reaction.values()) {
        if (r.messageId === record.id) {
          all.push(resolveInclude("reaction", r, relOpts, stores, findMany) ?? r);
        }
      }
      result.reactions = all;
    } else if (relation === "kanbanColumns") {
      const columns: Record<string, unknown>[] = [];
      for (const c of stores.kanbanColumn.values()) {
        if (c.channelId === record.id) columns.push(c);
      }
      result.kanbanColumns = columns;
    } else if (relation === "attachment") {
      result.attachment = findByField(stores.attachment, "messageId", record.id) ?? null;
    } else if (relation === "taskCard") {
      result.taskCard = findByField(stores.taskCardRef, "messageId", record.id) ?? null;
    } else if (relation === "members") {
      // For include filters like { members: { some: { userId } } } — used at query level
      result.members = [];
    } else if (relation === "permissions") {
      result.permissions = [];
    }
  }

  return result;
}

function createModelMethods(model: string, store: RecordMap, stores: StoreMap) {
  const findMany = (_model: string, where: Record<string, unknown>): Record<string, unknown>[] => {
    const results: Record<string, unknown>[] = [];
    for (const record of store.values()) {
      if (!where || matchWhere(record, where, stores, model)) results.push(record);
    }
    return results;
  };

  return {
    findUnique: async (args: { where: Record<string, unknown>; include?: Record<string, unknown> }) => {
      const where = args.where;
      const compoundKey = Object.keys(where).find(k => k.includes("_"));

      let record: Record<string, unknown> | undefined;

      if (compoundKey) {
        const fields = compoundKey.split("_");
        const values = where[compoundKey] as Record<string, unknown>;
        record = findByCompoundKey(store, fields, values);
      } else {
        const [field, value] = Object.entries(where)[0];
        record = findByField(store, field, value);
      }

      if (!record) return null;
      return resolveInclude(model, record, args.include, stores, findMany) ?? null;
    },

    findMany: async (args: { where?: Record<string, unknown>; include?: Record<string, unknown>; orderBy?: Record<string, "asc" | "desc">; take?: number; skip?: number; cursor?: Record<string, string> } = {}) => {
      let results = findMany(model, args.where ?? {});

      // Ordering
      if (args.orderBy) {
        const [field, dir] = Object.entries(args.orderBy)[0];
        results.sort((a, b) => {
          const va = a[field] as number | string | Date;
          const vb = b[field] as number | string | Date;
          const cmp = va < vb ? -1 : va > vb ? 1 : 0;
          return dir === "desc" ? -cmp : cmp;
        });
      }

      // Cursor-based pagination (for messages service)
      if (args.cursor && args.skip) {
        const cursorId = args.cursor.id;
        const idx = results.findIndex(r => r.id === cursorId);
        if (idx !== -1) results = results.slice(idx + 1);
      }

      // Limit
      if (args.take !== undefined) results = results.slice(0, args.take);

      // Resolve includes
      if (args.include) {
        results = results.map(r => resolveInclude(model, r, args.include, stores, findMany) ?? r);
      }

      return results;
    },

    create: async (args: { data: Record<string, unknown>; include?: Record<string, unknown> }) => {
      const data = { ...args.data };
      const id = (data.id as string) || genId();
      const createdAt = data.createdAt || now();
      const updatedAt = data.updatedAt || now();

      const record: Record<string, unknown> = { ...data, id, createdAt, updatedAt };

      // Auto-seed a default workspace + channel when a user is created.
      // This ensures the integration test's message CRUD flow has data to work with.
      if (model === "user") {
        const wsId = genId();
        const chId = genId();
        const wsMemberId = genId();

        const workspace: Record<string, unknown> = {
          id: wsId, name: "My Workspace", initials: "MW",
          color: "#7c6af7", createdAt: now(), updatedAt: now(),
        };
        stores.workspace.set(wsId, workspace);

        const member: Record<string, unknown> = {
          id: wsMemberId, workspaceId: wsId, userId: id,
          role: "owner", joinedAt: now(),
        };
        stores.workspaceMember.set(wsMemberId, member);

        const channel: Record<string, unknown> = {
          id: chId, workspaceId: wsId, name: "general",
          icon: "#", type: "text", description: null,
          private: false, createdAt: now(), updatedAt: now(),
        };
        stores.channel.set(chId, channel);
      }

      // Handle nested creates (e.g., workspace.create with members: { create: { ... } })
      if (data.members && typeof data.members === "object" && "create" in (data.members as Record<string, unknown>)) {
        const nested = (data.members as Record<string, unknown>).create as Record<string, unknown>;
        const memberRecord: Record<string, unknown> = {
          ...nested,
          workspaceId: id,
          id: genId(),
          joinedAt: now(),
        };
        stores.workspaceMember.set(memberRecord.id as string, memberRecord);
        delete data.members;
      }

      // Handle nested creates like attachment or taskCard
      if (data.attachment && typeof data.attachment === "object" && "create" in (data.attachment as Record<string, unknown>)) {
        const nested = (data.attachment as Record<string, unknown>).create as Record<string, unknown>;
        const attachmentRecord: Record<string, unknown> = {
          ...nested,
          messageId: id,
          id: genId(),
          createdAt: now(),
        };
        stores.attachment.set(attachmentRecord.id as string, attachmentRecord);
        delete data.attachment;
      }

      store.set(id, record);

      return resolveInclude(model, record, args.include, stores, findMany) ?? record;
    },

    update: async (args: { where: Record<string, unknown>; data: Record<string, unknown>; include?: Record<string, unknown> }) => {
      const where = args.where;
      let record: Record<string, unknown> | undefined;

      const compoundKey = Object.keys(where).find(k => k.includes("_"));
      if (compoundKey) {
        const fields = compoundKey.split("_");
        const values = where[compoundKey] as Record<string, unknown>;
        record = findByCompoundKey(store, fields, values);
      } else {
        const [field, value] = Object.entries(where)[0];
        record = findByField(store, field, value);
      }

      if (!record) return null;

      Object.assign(record, args.data, { updatedAt: now() });
      return resolveInclude(model, record, args.include, stores, findMany) ?? record;
    },

    delete: async (args: { where: Record<string, unknown> }) => {
      const where = args.where;
      let record: Record<string, unknown> | undefined;

      const compoundKey = Object.keys(where).find(k => k.includes("_"));
      if (compoundKey) {
        const fields = compoundKey.split("_");
        const values = where[compoundKey] as Record<string, unknown>;
        record = findByCompoundKey(store, fields, values);
      } else {
        const [field, value] = Object.entries(where)[0];
        record = findByField(store, field, value);
      }

      if (record) {
        store.delete(record.id as string);
        return record;
      }
      return null;
    },

    count: async (args: { where?: Record<string, unknown> } = {}) => {
      let count = 0;
      for (const record of store.values()) {
        if (!args.where || matchWhere(record, args.where, stores, model)) count++;
      }
      return count;
    },
  };
}

export function createInMemoryPrisma(): Record<string, unknown> {
  const stores = initStores();
  const models = Object.keys(stores);

  const prisma: Record<string, unknown> = {
    $connect: async () => {},
    $disconnect: async () => {},
    $transaction: async (fn: (tx: Record<string, unknown>) => unknown) => fn(prisma),
  };

  for (const model of models) {
    prisma[model] = createModelMethods(model, stores[model], stores);
  }

  return prisma;
}
