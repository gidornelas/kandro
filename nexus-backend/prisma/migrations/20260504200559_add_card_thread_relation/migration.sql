-- AddForeignKey
ALTER TABLE "card_thread_messages" ADD CONSTRAINT "card_thread_messages_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "kanban_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
