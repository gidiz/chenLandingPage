import { createConsola } from "consola"

const appEnv = process.env.NUXT_PUBLIC_APP_ENVIRONMENT || process.env.NODE_ENV || "production"
const isVerbose = appEnv === "development" || appEnv === "local"

export const logger = createConsola({
  level: isVerbose ? 4 : 3,
  tag: "chen-api",
})
