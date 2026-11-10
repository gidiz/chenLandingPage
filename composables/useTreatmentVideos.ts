import { createConsola } from 'consola'
import type { Ref } from 'vue'

import { clinicVideoTable, type ClinicVideoRow } from './useClinicVideos'

const videoLogger = createConsola({ defaults: { tag: 'chen-treatment-videos' } })

type VideosByTreatmentResponse = {
  source: 'db' | 'static'
  videos: ClinicVideoRow[]
}

export type TreatmentVideoOptions = {
  categorySlug?: string
  serviceSlug?: string
}

export type TreatmentVideosResult = {
  videos: Ref<ClinicVideoRow[]>
}

const getStaticFallbackVideos = (
  categorySlug?: string,
  serviceSlug?: string,
): ClinicVideoRow[] => {
  if (serviceSlug) {
    return []
  }

  if (categorySlug) {
    return clinicVideoTable.filter((video) =>
      video.categoriesBySlug.includes(categorySlug),
    )
  }

  return clinicVideoTable
}

export const useTreatmentVideos = (
  opts: TreatmentVideoOptions,
): TreatmentVideosResult => {
  const { categorySlug, serviceSlug } = opts

  const params = new URLSearchParams()
  if (serviceSlug) {
    params.set('serviceSlug', serviceSlug)
  }
  if (categorySlug) {
    params.set('categorySlug', categorySlug)
  }

  const { data: videos } = useAsyncData<ClinicVideoRow[]>(
    `treatment-videos:${categorySlug ?? ''}:${serviceSlug ?? ''}`,
    () =>
      $fetch<VideosByTreatmentResponse>(`/api/videos?${params.toString()}`)
        .then((p) => p?.videos ?? [])
        .catch(() => {
          videoLogger.warn('treatment_videos_fallback_static', {
            categorySlug,
            serviceSlug,
          })
          return getStaticFallbackVideos(categorySlug, serviceSlug)
        }),
    {
      default: () => getStaticFallbackVideos(categorySlug, serviceSlug),
      // Always re-fetch on navigation — prevents stale cache when DB data changes
      getCachedData: () => undefined,
    },
  )

  return { videos }
}
