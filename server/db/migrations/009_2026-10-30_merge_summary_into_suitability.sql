-- Merge treatment_services.summary into suitability as two HTML paragraphs, then drop the column.
-- Note: migration 006 still writes to summary, so it must be re-run only before this migration.

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'treatment_services'
      and column_name = 'summary'
  ) then
    update treatment_services
    set suitability = '<p>' || trim(summary) || '</p><p>' || trim(suitability) || '</p>'
    where trim(coalesce(summary, '')) <> ''
      and suitability not like '<p>%';
  end if;
end
$$;

delete from treatment_content_chunks
where source_table = 'treatment_services'
  and section_key = 'summary';

alter table treatment_services drop column if exists summary;
