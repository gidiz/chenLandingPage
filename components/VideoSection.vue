<template>
  <section id="video" class="video-section">
    <div class="container">
      <h2 class="section-title">סרטון מהקליניקה</h2>
      <p class="video-description">
        הצצה קצרה לטיפולים, לגישה המקצועית ולתוצאות טבעיות.
      </p>

      <NuxtLink to="/videos" class="video-catalog-link">לכל הסרטונים</NuxtLink>

      <div class="video-frame" v-if="activeVideo?.embedUrl">
        <iframe
          :src="activeVideo.embedUrl"
          title="סרטון YouTube של ד&quot;ר חן פרדו"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>

      <div v-if="validVideos.length > 1" class="video-thumbnails" role="list">
        <button
          v-for="(video, index) in validVideos"
          :key="video.videoId"
          type="button"
          class="video-thumb"
          :class="{ 'video-thumb--active': index === selectedIndex }"
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
import { computed, ref } from "vue";
import { toYouTubeVideo, type ParsedYouTubeVideo } from "../composables/useClinicVideos";

const props = defineProps({
  youtubeUrls: {
    type: Array as () => string[],
    default: () => [],
  },
  youtubeUrl: {
    type: String,
    default: "",
  },
});

const selectedIndex = ref(0);

const allLinks = computed(() => {
  const linksFromArray = props.youtubeUrls.filter((link) => typeof link === "string");
  const singleLink = typeof props.youtubeUrl === "string" && props.youtubeUrl.trim() ? [props.youtubeUrl] : [];
  return [...linksFromArray, ...singleLink];
});

const validVideos = computed(() =>
  allLinks.value
    .map((link) => toYouTubeVideo(link))
    .filter((video): video is ParsedYouTubeVideo => video !== null),
);

const hasInvalidVideos = computed(() => allLinks.value.length > validVideos.value.length);

const activeVideo = computed(() => validVideos.value[selectedIndex.value] ?? validVideos.value[0] ?? null);
</script>

<style scoped>
.video-section {
  background: linear-gradient(180deg, #f7f5f2 0%, #efe9e1 100%);
  padding: 3.5rem 1.5rem;
  direction: rtl;
  text-align: center;
}

.video-description {
  margin: 0 auto 1.5rem;
  max-width: 680px;
  color: #4a4a4a;
  line-height: 1.8;
}

.video-catalog-link {
  display: inline-block;
  margin-bottom: 1.25rem;
  color: #5a7c7a;
  text-decoration: none;
  font-weight: 600;
}

.video-catalog-link:hover {
  color: #3d5c5a;
}

.video-frame {
  position: relative;
  width: min(960px, 100%);
  margin: 0 auto;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.14);
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

.video-thumb:hover {
  transform: translateY(-2px);
}

.video-thumb--active {
  border-color: #5a7c7a;
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
  color: #4a4a4a;
}

.video-error {
  margin: 1rem auto 0;
  max-width: 680px;
  color: #722e2e;
  background: #ffe0e0;
  border: 1px solid #ddaaaa;
  border-radius: 12px;
  padding: 0.75rem 1rem;
}
</style>