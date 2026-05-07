ALTER PUBLICATION supabase_realtime DROP TABLE public.messages;

CREATE OR REPLACE FUNCTION public.broadcast_message_changes()
RETURNS trigger
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'messages',
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER broadcast_messages_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.broadcast_message_changes();

CREATE POLICY "authenticated users can receive message broadcasts"
ON realtime.messages
FOR SELECT TO authenticated
USING (true);
