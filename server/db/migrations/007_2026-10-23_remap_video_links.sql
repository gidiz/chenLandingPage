-- Re-map clinic videos to the 2026-10 treatment catalog taxonomy.
-- Migration 005 seeded video_categories/video_services from the old slugs
-- (injectables / botox-expression-lines / rf-microneedling), which no longer exist.

delete from video_categories;
delete from video_services;

insert into video_categories (video_id, category_id)
select cv.id, tc.id
from (
  values
    ('hzniQVbtebk', 'botox'),
    ('HrGKrquijww', 'botox'),
    ('HrGKrquijww', 'hyaluronic-acid'),
    ('HrGKrquijww', 'skin-quality'),
    ('HrGKrquijww', 'technology'),
    ('RcBWFggZImU', 'technology'),
    ('RcBWFggZImU', 'skin-quality'),
    ('bdBkI67T8Ls', 'botox'),
    ('9QRoTdgsgy4', 'hyaluronic-acid'),
    ('9QRoTdgsgy4', 'skin-quality'),
    ('9QRoTdgsgy4', 'technology'),
    ('l1q9oZDAw1g', 'technology'),
    ('l1q9oZDAw1g', 'skin-quality'),
    ('xHWnp6y_Nq8', 'skin-quality'),
    ('9bmsZu5aSbI', 'botox'),
    ('Utw0XzGJ_48', 'botox'),
    ('Utw0XzGJ_48', 'hyaluronic-acid'),
    ('Xlym6Kxaqmg', 'hyaluronic-acid'),
    ('xizmXliVwGk', 'botox'),
    ('EedmwwMicDw', 'botox'),
    ('q4XWfUvlioE', 'skin-quality')
) as m (youtube_id, category_slug)
join clinic_videos cv on cv.url like '%' || m.youtube_id
join treatment_categories tc on tc.slug = m.category_slug
on conflict do nothing;

insert into video_services (video_id, service_id)
select cv.id, ts.id
from (
  values
    ('hzniQVbtebk', 'botox-upper-face'),
    ('HrGKrquijww', 'full-face-sculpting'),
    ('HrGKrquijww', 'hybrid-radiesse'),
    ('HrGKrquijww', 'morpheus8'),
    ('HrGKrquijww', 'ipl-pigmentation'),
    ('RcBWFggZImU', 'ipl-pigmentation'),
    ('9QRoTdgsgy4', 'full-face-sculpting'),
    ('9QRoTdgsgy4', 'morpheus8'),
    ('l1q9oZDAw1g', 'morpheus8'),
    ('l1q9oZDAw1g', 'ipl-pigmentation'),
    ('Utw0XzGJ_48', 'botox-full-face'),
    ('Utw0XzGJ_48', 'full-face-sculpting'),
    ('xizmXliVwGk', 'botox-upper-face'),
    ('EedmwwMicDw', 'botox-upper-face'),
    ('q4XWfUvlioE', 'medical-peel')
) as m (youtube_id, service_slug)
join clinic_videos cv on cv.url like '%' || m.youtube_id
join treatment_services ts on ts.slug = m.service_slug
on conflict do nothing;
