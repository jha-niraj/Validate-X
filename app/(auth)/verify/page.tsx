import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function VerifyPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-green-100 p-3">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight mt-4">Email verified</CardTitle>
                    <CardDescription>Your email has been successfully verified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Thank you for verifying your email address. Your account is now active and you can sign in to access your
                        account.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" asChild>
                        <Link href="/auth/signin">Continue to sign in</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

