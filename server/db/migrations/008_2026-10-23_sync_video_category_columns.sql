-- Sync the denormalized clinic_videos category columns with the new taxonomy.
-- Treatment slugs come from video_categories; non-treatment tags (ייעוץ / כללי /
-- הזעת יתר) have no catalog category and are preserved from the existing values.

with meta_labels (slug, label, ord) as (
  values
    ('consultation', 'ייעוץ', 100),
    ('hyperhidrosis', 'הזעת יתר', 101),
    ('general', 'כללי', 102)
),
combined as (
  select vc.video_id, tc.slug, tc.short_title as label, tc.display_order as ord
  from video_categories vc
  join treatment_categories tc on tc.id = vc.category_id
  union all
  select cv.id, m.slug, m.label, m.ord
  from clinic_videos cv
  join meta_labels m on m.slug = any(cv."categoriesBySlug")
),
agg as (
  select
    video_id,
    array_agg(slug order by ord) as slugs,
    array_agg(label order by ord) as labels
  from combined
  group by video_id
)
update clinic_videos cv
set
  "categoriesBySlug" = agg.slugs,
  "categoriesInHebrow" = agg.labels
from agg
where agg.video_id = cv.id;
