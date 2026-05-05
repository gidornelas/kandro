import { z } from "zod";

export const createFolderSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().optional(),
});

export const addFileTeamSchema = z.object({
  teamIds: z.array(z.string()).min(1),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
