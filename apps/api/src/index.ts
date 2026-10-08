import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { env } from "./env.js"
import { optionalAuth } from "./http.js"
import { router } from "./routes.js"
import { seedCollections } from "./domain.js"

const app = express()
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(optionalAuth)
app.get("/health", (_req, res) => res.json({ ok: true }))
app.use("/api", router)

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : "Server error"
  if (env.isDev) console.error(err)
  res.status(500).json({ error: message, code: "SERVER" })
})

app.listen(env.PORT, () => {
  console.log(`API http://localhost:${env.PORT}`)
  seedCollections().catch((e) => console.warn("seed skipped", e instanceof Error ? e.message : e))
})
