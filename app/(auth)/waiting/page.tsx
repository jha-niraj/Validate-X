import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MailCheck } from "lucide-react"

export default function WaitingPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-primary/10 p-3">
                            <MailCheck className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight mt-4">Check your email</CardTitle>
                    <CardDescription>We&apos;ve sent a verification link to your email address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Please check your email and click on the verification link to continue. If you don&apos;t see the email,
                        check your spam folder.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button className="w-full" variant="outline">
                        Resend verification email
                    </Button>
                    <div className="text-center text-sm">
                        <Link href="/auth/signin" className="font-medium text-primary hover:underline">
                            Back to sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}