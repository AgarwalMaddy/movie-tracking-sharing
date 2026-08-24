import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import { env } from "@/lib/env"

const providers: NextAuthConfig["providers"] = []

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  )
}

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (user) {
        token.id = user.id
      }

      if (account?.provider === "google") {
        token.emailVerified = true
      }

      return token
    },
    session: async ({ session, token }) => {
      if (token.id) {
        session.user.id = token.id as string
      }

      return session
    },
  },
} satisfies NextAuthConfig
