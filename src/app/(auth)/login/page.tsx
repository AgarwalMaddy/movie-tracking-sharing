import Link from "next/link"
import { SignInForm } from "@/features/auth/components/sign-in-form"

export default function LoginPage() {
  return (
    <div className="space-y-4">
      <SignInForm />
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
