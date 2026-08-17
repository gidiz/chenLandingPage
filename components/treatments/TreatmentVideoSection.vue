<template>
  <section v-if="activeVideo" class="page-section page-section--soft">
    <div class="container">
      <h2 class="section-title">סרטונים מהקליניקה</h2>

      <div class="treatment-video-frame">
        <iframe
          :src="activeVideo.embedUrl"
          :title="`סרטון YouTube – ${activeVideo.videoId}`"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        />
      </div>

      <div v-if="validVideos.length > 1" class="treatment-video-thumbnails" role="list">
        <button
          v-for="(video, index) in validVideos"
          :key="video.videoId"
          type="button"
          class="treatment-video-thumb"
          :class="{ 'treatment-video-thumb--active': index === selectedIndex }"
          :aria-label="`בחירת סרטון ${index + 1}`"
          @click="selectedIndex = index"
        >
          <img
            :src="video.thumbnailUrl"
            :alt="`תמונה ממוזערת של סרטון ${index + 1}`"
            loading="lazy"
          />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { toYouTubeVideo, type ParsedYouTubeVideo } from '../../composables/useClinicVideos'
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
  (videos.value ?? [])
    .map((v) => toYouTubeVideo(v.url))
    .filter((v): v is ParsedYouTubeVideo => v !== null),
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

.treatment-video-thumb {
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
</style>
