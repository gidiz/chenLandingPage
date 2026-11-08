<template>
  <div>
    <PageHero
      eyebrow="מרכז וידאו"
      title="כל הסרטונים"
      subtitle="סרטוני הסבר קצרים של ד&quot;ר חן פרדו על טיפולים, תהליך הייעוץ ושאלות שחוזרות בקליניקה. אפשר לסנן לפי תחום טיפול או לחפש נושא."
    />

    <section class="page-section page-section--soft videos-page" v-reveal>
      <div class="container videos-layout">
        <article class="page-card videos-player-card">
          <h2 class="section-title">נגן וידאו</h2>
          <div class="videos-player" v-if="activeVideo">
            <iframe
              :src="activeVideo.embedUrl"
              :title="activeVideo.title"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>
          <p v-else class="videos-empty">לא נמצאו סרטונים לפי הסינון שבחרת.</p>
        </article>

        <article class="page-card videos-filter-card">
          <h3>סינון סרטונים</h3>
          <label for="videos-search" class="videos-filter-label">חיפוש נושא</label>
          <input
            id="videos-search"
            v-model="query"
            type="search"
            class="videos-filter-input"
            placeholder="לדוגמה: בוטוקס, הזעת יתר"
          />
          <label for="videos-category" class="videos-filter-label">תחום טיפול</label>
          <select id="videos-category" v-model="selectedCategory" class="videos-filter-input">
            <option value="all">הכל</option>
            <option v-for="category in categoryOptions.filter((item) => item !== 'all')" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
          <p class="videos-count">{{ filteredVideos.length }} מתוך {{ videos.length }} סרטונים</p>
        </article>
      </div>
    </section>

    <section class="page-section videos-grid-section" v-reveal>
      <div class="container">
        <div class="videos-grid" role="list">
          <button
            v-for="video in filteredVideos"
            :key="video.videoId"
            type="button"
            class="video-card"
            :class="{ 'video-card--active': video.videoId === activeVideo?.videoId }"
            @click="selectedVideoId = video.videoId"
          >
            <img :src="video.thumbnailUrl" :alt="video.title" loading="lazy" />
            <div class="video-card__body">
              <strong>{{ video.title }}</strong>
              <p>{{ video.shortDesc }}</p>
            </div>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { clinicVideoTable, toYouTubeVideo, type ClinicVideoRow } from "../composables/useClinicVideos";

type VideoItem = {
  title: string
  desc: string
  shortDesc: string
  categoriesBySlug: string[]
  categoriesInHebrow: string[]
  videoId: string
  embedUrl: string
  thumbnailUrl: string
};

const { data: videoCatalog } = await useFetch("/api/videos", {
  default: () => ({
    source: "static" as const,
    videos: clinicVideoTable,
  }),
});

const sourceVideos = computed<ClinicVideoRow[]>(() => videoCatalog.value?.videos || clinicVideoTable);

const videos = computed(() => sourceVideos.value
  .map((row) => {
    const parsed = toYouTubeVideo(row.url);
    if (!parsed) {
      return null;
    }

    return {
      title: row.title,
      desc: row.desc,
      shortDesc: row.shortDesc,
      categoriesBySlug: row.categoriesBySlug,
      categoriesInHebrow: row.categoriesInHebrow,
      ...parsed,
    } satisfies VideoItem;
  })
  .filter((video): video is VideoItem => video !== null));

const query = ref("");
const selectedCategory = ref("all");
const selectedVideoId = ref("");

const categoryOptions = computed(() => {
  const set = new Set<string>();
  for (const video of videos.value) {
    for (const category of video.categoriesInHebrow) {
      set.add(category);
    }
  }

  return ["all", ...Array.from(set)];
});

const filteredVideos = computed(() => {
  const value = query.value.trim().toLowerCase();
  return videos.value.filter((video) => {
    const matchesQuery =
      !value || [video.title, video.shortDesc, video.desc].some((field) => field.toLowerCase().includes(value));

    const matchesCategory =
      selectedCategory.value === "all" || video.categoriesInHebrow.includes(selectedCategory.value);

    return matchesQuery && matchesCategory;
  });
});

watch(filteredVideos, (list) => {
  if (!list.length) {
    selectedVideoId.value = "";
    return;
  }

  const stillVisible = list.some((video) => video.videoId === selectedVideoId.value);
  if (!stillVisible) {
    selectedVideoId.value = list[0].videoId;
  }
}, { immediate: true });

const activeVideo = computed(() => {
  if (!filteredVideos.value.length) {
    return null;
  }

  return (
    filteredVideos.value.find((video) => video.videoId === selectedVideoId.value) ||
    filteredVideos.value[0]
  );
});

const seoDescription =
  "סרטוני הסבר של ד\"ר חן פרדו על טיפולים אסתטיים, הזעת יתר ותהליך הייעוץ בקליניקה בכפר סבא."

useSeoMeta({
  title: 'סרטוני הסבר על טיפולים | ד"ר חן פרדו',
  description: seoDescription,
  ogTitle: 'סרטוני הסבר על טיפולים | ד"ר חן פרדו',
  ogDescription: seoDescription,
  ogImage: "https://drchenpardo.co.il/og-image.jpg",
  ogUrl: "https://drchenpardo.co.il/videos",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: 'סרטוני הסבר על טיפולים | ד"ר חן פרדו',
  twitterDescription: seoDescription,
})
</script>

<style scoped>
.videos-page {
  direction: rtl;
}

.videos-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
  gap: 1.25rem;
  align-items: start;
}

.videos-player-card {
  text-align: right;
}

.videos-player {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #000;
}

.videos-player::before {
  content: "";
  display: block;
  padding-top: 56.25%;
}

.videos-player iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.videos-empty {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-text-muted);
}

.videos-filter-card {
  text-align: right;
}

.videos-filter-label {
  display: block;
  margin-bottom: 0.35rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.videos-filter-input {
  width: 100%;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  padding: 0.65rem 0.85rem;
  font: inherit;
}

.videos-count {
  margin: 0.8rem 0 0;
  color: var(--color-text-soft);
}

.videos-grid-section {
  direction: rtl;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.video-card {
  display: block;
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface);
  text-align: right;
  cursor: pointer;
  padding: 0;
  transition:
    transform var(--duration-base) var(--ease-out),
    box-shadow var(--duration-base) var(--ease-out),
    border-color var(--duration-base) var(--ease-out);
}

.video-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.video-card--active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(90, 124, 122, 0.16);
}

.video-card img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
}

.video-card__body {
  padding: 0.75rem 0.85rem;
  display: grid;
  gap: 0.35rem;
}

.video-card__body strong {
  color: var(--color-text);
}

.video-card__body p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

@media (max-width: 900px) {
  .videos-layout {
    grid-template-columns: 1fr;
  }
}
</style>