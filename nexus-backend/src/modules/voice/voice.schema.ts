import { z } from "zod";

export const joinVoiceSchema = z.object({
  channelId: z.string(),
});

export const updateParticipantSchema = z.object({
  muted: z.boolean().optional(),
  cameraOn: z.boolean().optional(),
  sharing: z.boolean().optional(),
});

export const livekitWebhookSchema = z.object({
  event: z.enum([
    "room_started",
    "room_finished",
    "participant_joined",
    "participant_left",
    "track_published",
    "track_unpublished",
    "active_speaker_changed",
  ]),
  room: z.object({ name: z.string(), sid: z.string() }),
  participant: z
    .object({ identity: z.string(), name: z.string().optional(), metadata: z.string().optional() })
    .optional(),
});

export type JoinVoiceInput = z.infer<typeof joinVoiceSchema>;
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;
export type LiveKitWebhookEvent = z.infer<typeof livekitWebhookSchema>;
