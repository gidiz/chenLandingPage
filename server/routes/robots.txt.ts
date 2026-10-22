export default defineEventHandler((event) => {
  setHeader(event, "Content-Type", "text/plain; charset=utf-8")

  const config = useRuntimeConfig()
  // VERCEL_ENV is set automatically by Vercel, so preview deploys stay blocked without extra config.
  const isProduction =
    process.env.VERCEL_ENV === "production" ||
    config.public.appEnvironment === "production"

  if (!isProduction) {
    return ["User-agent: *", "Disallow: /"].join("\n")
  }

  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    "Sitemap: https://drchenpardo.co.il/sitemap.xml",
  ].join("\n")
})
