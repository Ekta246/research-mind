"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // TEMPORARY: Skip actual password reset for development
    // Just show success message and add a button to redirect to dashboard
    setTimeout(() => {
      setIsSubmitted(true)
      setIsLoading(false)
    }, 1500)
    
    // Actual implementation would use Supabase to send a reset email
    /*
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) {
        console.error("Password reset error:", error)
      } else {
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error("Password reset error:", error)
    } finally {
      setIsLoading(false)
    }
    */
  }

  const handleGoToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <Link
        href="/signin"
        className="absolute top-8 left-8 flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to sign in
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset your password</CardTitle>
          <CardDescription className="text-center">
            {isSubmitted
              ? "Check your email for a reset link"
              : "Enter your email address and we'll send you a link to reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                If you don't see it in your inbox, please check your spam folder.
              </p>
              <Button className="w-full mt-4" onClick={handleGoToDashboard}>
                Go to dashboard (dev bypass)
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending reset link..." : "Send reset link"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            <Link href="/signin" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 