import { env } from "@/lib/env"

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`

  if (!env.RESEND_API_KEY) {
    console.log("Email verification URL (no Resend configured):", verifyUrl)
    return { success: true }
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "noreply@yourdomain.com",
      to: email,
      subject: "Verify your email",
      html: `
        <h1>Verify your email</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${verifyUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to send verification email")
  }

  return { success: true }
}
