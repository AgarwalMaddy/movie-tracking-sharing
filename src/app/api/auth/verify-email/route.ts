import { redirect } from "next/navigation"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token) {
    redirect("/login?error=Invalid verification link")
  }

  const verificationToken = await db.verificationToken.findUnique({
    where: { token },
  })

  if (!verificationToken) {
    redirect("/login?error=Invalid or expired verification link")
  }

  if (verificationToken.expires < new Date()) {
    await db.verificationToken.delete({ where: { token } })
    redirect("/login?error=Verification link expired")
  }

  await db.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  })

  await db.verificationToken.delete({ where: { token } })

  redirect("/login?message=Email verified! You can now sign in.")
}
