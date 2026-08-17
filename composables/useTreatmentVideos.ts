import type { ClinicVideoRow } from './useClinicVideos'

type VideosByTreatmentResponse = {
  source: 'db' | 'static'
  videos: ClinicVideoRow[]
}

export const useTreatmentVideos = (opts: {
  categorySlug?: string
  serviceSlug?: string
}) => {
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
        .catch(() => []),
    {
      default: () => [] as ClinicVideoRow[],
      // Always re-fetch on navigation — prevents stale cache when DB data changes
      getCachedData: () => undefined,
    },
  )

  return { videos }
}
