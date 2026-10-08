import type { Request, Response, NextFunction } from "express"
import { db } from "./db.js"

export const COOKIE = "mts_session"

export type AuthedRequest = Request & { userId?: string }

function readToken(req: AuthedRequest) {
  const cookie = req.cookies?.[COOKIE] as string | undefined
  const header = req.headers.authorization
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : undefined
  return cookie || bearer
}

export async function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = readToken(req)
  if (!token) return next()
  const session = await db.session.findUnique({ where: { sessionToken: token } })
  if (session && session.expires > new Date()) req.userId = session.userId
  next()
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  await optionalAuth(req, res, () => undefined)
  if (!req.userId) {
    res.status(401).json({ error: "Sign in required", code: "AUTH_REQUIRED" })
    return
  }
  next()
}

export function fail(res: Response, status: number, error: string, code: string) {
  res.status(status).json({ error, code })
}
