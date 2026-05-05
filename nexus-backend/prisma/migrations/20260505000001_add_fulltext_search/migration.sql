-- Enable pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Full-text search indexes using pg_trgm (trigram similarity)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_text_trgm ON messages USING gin (text gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_kanban_cards_title_trgm ON kanban_cards USING gin (title gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_kanban_cards_description_trgm ON kanban_cards USING gin (description gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_file_nodes_name_trgm ON file_nodes USING gin (name gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_card_thread_messages_text_trgm ON card_thread_messages USING gin (text gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dm_messages_text_trgm ON dm_messages USING gin (text gin_trgm_ops);

-- tsvector indexes for full-text search (optional, for ranking)
-- These require a tsvector column or expression index
-- For now, rely on pg_trgm for fuzzy matching and ILIKE optimization
