-- Clear all sample/test chat data to fix preloaded chat issue
DELETE FROM public.n8n_chat_history;
DELETE FROM public.chat_sessions;