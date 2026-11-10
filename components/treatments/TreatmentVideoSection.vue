<template>
  <section v-if="activeVideo" class="page-section page-section--soft">
    <div class="container">
      <h2 class="section-title">סרטונים מהקליניקה</h2>

      <div class="treatment-video-frame">
        <iframe
          :src="activeVideo.embedUrl"
          :title="`סרטון: ${activeVideo.title}`"
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        />
      </div>

      <div
        v-if="validVideos.length > 1"
        class="treatment-video-thumbnails"
        role="group"
        aria-label="בחירת סרטון"
      >
        <button
          v-for="(video, index) in validVideos"
          :key="video.videoId"
          type="button"
          class="treatment-video-thumb"
          :class="{ 'treatment-video-thumb--active': index === selectedIndex }"
          :aria-pressed="index === selectedIndex"
          :aria-label="`בחירת סרטון: ${video.title}`"
          @click="selectedIndex = index"
        >
          <img
            :src="video.thumbnailUrl"
            alt=""
            loading="lazy"
          />
        </button>
      </div>
      <p v-if="activeVideo" class="treatment-video-caption">
        {{ activeVideo.title }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { toYouTubeVideo } from '../../composables/useClinicVideos'
import { useTreatmentVideos } from '../../composables/useTreatmentVideos'

const props = defineProps<{
  categorySlug?: string
  serviceSlug?: string
}>()

const { videos } = useTreatmentVideos({
  categorySlug: props.categorySlug,
  serviceSlug: props.serviceSlug,
})

const selectedIndex = ref(0)

const validVideos = computed(() =>
  (videos.value ?? []).flatMap((video) => {
    const parsedVideo = toYouTubeVideo(video.url)
    return parsedVideo ? [{ ...parsedVideo, title: video.title }] : []
  }),
)

const activeVideo = computed(
  () => validVideos.value[selectedIndex.value] ?? validVideos.value[0] ?? null,
)
</script>

<style scoped>
.treatment-video-frame {
  position: relative;
  width: min(960px, 100%);
  margin: 0 auto;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.14);
  background-color: #000;
}

.treatment-video-frame::before {
  content: '';
  display: block;
  padding-top: 56.25%;
}

.treatment-video-frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.treatment-video-thumbnails {
  margin: 1rem auto 0;
  width: min(960px, 100%);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.65rem;
}

.treatment-video-caption {
  width: min(960px, 100%);
  margin: 0.75rem auto 0;
  color: var(--color-text);
  font-weight: 700;
}

.treatment-video-thumb {
  min-height: 44px;
  border: 2px solid transparent;
  border-radius: 10px;
  overflow: hidden;
  background: #111;
  cursor: pointer;
  padding: 0;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;
}

.treatment-video-thumb:hover {
  transform: translateY(-2px);
}

.treatment-video-thumb--active {
  border-color: #5a7c7a;
}

.treatment-video-thumb img {
  width: 100%;
  height: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
}

@media (prefers-reduced-motion: reduce) {
  .treatment-video-thumb {
    transition: none;
  }

  .treatment-video-thumb:hover {
    transform: none;
  }
}
</style>
