-- Add indexes to audit_logs for query performance
-- Suggested by CodeRabbit review

create index if not exists idx_audit_logs_event_type on public.audit_logs(event_type);
create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);
create index if not exists idx_audit_logs_event_user on public.audit_logs(event_type, user_id);
