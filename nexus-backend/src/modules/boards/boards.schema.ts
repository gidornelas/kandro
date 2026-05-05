import { z } from "zod";

// ─── Columns ──────────────────────────────────────────────

export const createColumnSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
  position: z.number().int().optional(),
});

export const updateColumnSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
  position: z.number().int().optional(),
});

// ─── Cards ────────────────────────────────────────────────

export const createCardSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.string().optional(),
  priorityColor: z.string().optional(),
  due: z.string().datetime().optional(),
  labels: z
    .array(z.object({ name: z.string(), color: z.string() }))
    .optional(),
  assignees: z.array(z.string()).optional(),
});

export const updateCardSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.string().optional(),
  priorityColor: z.string().optional(),
  due: z.string().datetime().optional(),
});

export const moveCardSchema = z.object({
  toColumnId: z.string(),
  position: z.number().optional(),
});

// ─── Subtasks ─────────────────────────────────────────────

export const createSubtaskSchema = z.object({
  text: z.string().min(1),
});

export const updateSubtaskSchema = z.object({
  text: z.string().min(1).optional(),
  done: z.boolean().optional(),
});

// ─── Comments ─────────────────────────────────────────────

export const createCommentSchema = z.object({
  text: z.string().min(1),
});

// ─── Labels & Assignees ───────────────────────────────────

export const addLabelSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export const addAssigneeSchema = z.object({
  userId: z.string().cuid(),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type MoveCardInput = z.infer<typeof moveCardSchema>;
export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type AddLabelInput = z.infer<typeof addLabelSchema>;
export type AddAssigneeInput = z.infer<typeof addAssigneeSchema>;
