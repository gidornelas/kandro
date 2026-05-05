import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  initials: z.string().optional(),
  color: z.string().optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2).optional(),
  initials: z.string().optional(),
  color: z.string().optional(),
});

export const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["member", "admin"]).default("member"),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["member", "admin", "owner"]),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
