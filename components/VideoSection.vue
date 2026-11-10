<template>
  <section id="video" class="video-section" v-reveal>
    <div class="container">
      <h2 class="section-title">סרטון מהקליניקה</h2>
      <p class="video-description">
        הצצה קצרה לטיפולים, לגישה המקצועית ולתוצאות טבעיות.
      </p>

      <NuxtLink to="/videos" class="video-catalog-link">לכל הסרטונים</NuxtLink>

      <div class="video-frame" v-if="activeVideo?.embedUrl">
        <iframe
          :src="activeVideo.embedUrl"
          :title="`סרטון: ${getVideoCopy(activeVideo.videoId).title}`"
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>

      <div
        v-if="validVideos.length > 1"
        class="video-thumbnails"
        role="group"
        aria-label="בחירת סרטון"
      >
        <button
          v-for="(video, index) in validVideos"
          :key="video.videoId"
          type="button"
          class="video-thumb"
          :class="{ 'video-thumb--active': index === selectedIndex }"
          :aria-pressed="index === selectedIndex"
          :aria-label="getVideoCopy(video.videoId).buttonLabel"
          @click="selectedIndex = index"
        >
          <img
            :src="video.thumbnailUrl"
            :alt="getVideoCopy(video.videoId).alt"
            loading="lazy"
          />
        </button>
      </div>

      <p v-if="activeVideo" class="video-caption">
        {{ getVideoCopy(activeVideo.videoId).title }}
      </p>

      <p v-if="hasInvalidVideos" class="video-note">
        חלק מהקישורים שסופקו לא היו תקינים ולכן לא מוצגים בגלריה.
      </p>

      <p v-if="!activeVideo" class="video-error">
        קישורי הווידאו אינם תקינים. יש להזין קישור YouTube תקף.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import {
  toYouTubeVideo,
  type ParsedYouTubeVideo,
} from "../composables/useClinicVideos"

type HomepageVideoCopy = {
  title: string
  alt: string
  buttonLabel: string
}

const homepageVideoCopy: Record<string, HomepageVideoCopy> = {
  UTAWXOtyfa0: {
    title: "הקשר בין הרופאה למטופלת",
    alt: "תמונה ממוזערת של הסרטון על הקשר בין הרופאה למטופלת",
    buttonLabel: "בחירת הסרטון על הקשר בין הרופאה למטופלת",
  },
  RcBWFggZImU: {
    title: "היכרות עם טיפול בלומקה",
    alt: "תמונה ממוזערת של הסרטון המציג טיפול בלומקה",
    buttonLabel: "בחירת הסרטון על טיפול בלומקה",
  },
  U5uEPOUf16A: {
    title: "טיפול בהזעת יתר בבית השחי",
    alt: "תמונה ממוזערת של הסרטון על טיפול בהזעת יתר בבית השחי",
    buttonLabel: "בחירת הסרטון על טיפול בהזעת יתר בבית השחי",
  },
}

const getVideoCopy = (videoId: string): HomepageVideoCopy =>
  homepageVideoCopy[videoId] ?? {
    title: "סרטון מהקליניקה",
    alt: "תמונה ממוזערת של סרטון מהקליניקה",
    buttonLabel: "בחירת סרטון מהקליניקה",
  }

const props = withDefaults(
  defineProps<{
    youtubeUrls?: string[]
    youtubeUrl?: string
  }>(),
  {
    youtubeUrls: () => [],
    youtubeUrl: "",
  },
)

const selectedIndex = ref(0)

const allLinks = computed(() => {
  const linksFromArray = props.youtubeUrls.filter(
    (link) => typeof link === "string",
  )
  const singleLink =
    typeof props.youtubeUrl === "string" && props.youtubeUrl.trim()
      ? [props.youtubeUrl]
      : []
  return [...linksFromArray, ...singleLink]
})

const validVideos = computed(() =>
  allLinks.value
    .map((link) => toYouTubeVideo(link))
    .filter((video): video is ParsedYouTubeVideo => video !== null),
)

const hasInvalidVideos = computed(
  () => allLinks.value.length > validVideos.value.length,
)

const activeVideo = computed(
  () =>
    validVideos.value[selectedIndex.value] ??
    validVideos.value[0] ??
    null,
)
</script>

<style scoped>
.video-section {
  background: var(--gradient-soft-vertical);
  padding: var(--space-section-sm) 1.5rem;
  direction: rtl;
  text-align: center;
}

.video-description {
  margin: 0 auto 1.5rem;
  max-width: 680px;
  color: var(--color-text);
  line-height: 1.8;
}

.video-catalog-link {
  display: inline-block;
  margin-bottom: 1.25rem;
  color: var(--color-primary-deep);
  text-decoration: none;
  font-weight: 600;
}

.video-catalog-link:hover {
  color: var(--color-primary-dark);
}

.video-frame {
  position: relative;
  width: min(960px, 100%);
  margin: 0 auto;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  background-color: #000;
}

.video-frame::before {
  content: "";
  display: block;
  padding-top: 56.25%;
}

.video-frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.video-thumbnails {
  margin: 1rem auto 0;
  width: min(960px, 100%);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.65rem;
}

.video-thumb {
  min-height: 44px;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: #111;
  cursor: pointer;
  padding: 0;
  transition:
    transform var(--duration-base) var(--ease-out),
    border-color var(--duration-base) var(--ease-out);
}

.video-thumb:hover {
  transform: translateY(-2px);
}

.video-thumb--active {
  border-color: var(--color-primary);
}

.video-thumb img {
  width: 100%;
  height: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
}

.video-note {
  margin: 1rem auto 0;
  max-width: 680px;
  color: var(--color-text);
}

.video-caption {
  margin: 0.75rem auto 0;
  max-width: 960px;
  color: var(--color-text);
  font-weight: 700;
}

.video-error {
  margin: 1rem auto 0;
  max-width: 680px;
  color: var(--color-error-text);
  background: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
}

@media (prefers-reduced-motion: reduce) {
  .video-thumb {
    transition: none;
  }

  .video-thumb:hover {
    transform: none;
  }
}
</style>