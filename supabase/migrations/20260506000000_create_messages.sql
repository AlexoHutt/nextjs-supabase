CREATE TABLE public.messages (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email  text        NOT NULL,
  body        text        NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 2000),
  inserted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX messages_inserted_at_idx ON public.messages (inserted_at ASC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can read messages"
  ON public.messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "users can insert own messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
