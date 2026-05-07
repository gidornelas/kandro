/*
  Warnings:

  - You are about to drop the column `level` on the `team_permissions` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "idx_card_thread_messages_text_trgm";

-- DropIndex
DROP INDEX "idx_dm_messages_text_trgm";

-- DropIndex
DROP INDEX "idx_file_nodes_name_trgm";

-- DropIndex
DROP INDEX "idx_kanban_cards_description_trgm";

-- DropIndex
DROP INDEX "idx_kanban_cards_title_trgm";

-- DropIndex
DROP INDEX "idx_messages_text_trgm";

-- AlterTable
ALTER TABLE "team_permissions" DROP COLUMN "level",
ADD COLUMN     "actions" TEXT[] DEFAULT ARRAY[]::TEXT[];
