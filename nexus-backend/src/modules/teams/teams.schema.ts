import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
});

export const setPermissionSchema = z.object({
  resourceId: z.string(),
  resourceType: z.enum(["channel", "board", "folder", "doc"]),
  level: z.enum(["none", "view", "edit"]),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type SetPermissionInput = z.infer<typeof setPermissionSchema>;
