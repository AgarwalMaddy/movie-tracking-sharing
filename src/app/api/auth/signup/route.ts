import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import crypto from "crypto"
import { z } from "zod"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  name: z.string().min(2).max(50),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, username, name } = signupSchema.parse(body)

    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email or username already exists", code: "USER_EXISTS" },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 12)

    await db.user.create({
      data: {
        email,
        username,
        name,
        accounts: {
          create: {
            type: "credentials",
            provider: "credentials",
            providerAccountId: email,
            password: hashedPassword,
          },
        },
      },
    })

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    await sendVerificationEmail(email, token)

    return NextResponse.json({
      success: true,
      message: "Account created. Check your email to verify.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", code: "VALIDATION_ERROR" },
        { status: 400 }
      )
    }

    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Failed to create account", code: "SERVER_ERROR" },
      { status: 500 }
    )
  }
}
