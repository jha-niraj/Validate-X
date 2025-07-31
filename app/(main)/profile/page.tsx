import { getProfile, getUserStats } from "@/actions/profile.action"
import { SettingsForm } from "./_components/settingsform"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Settings, Calendar, MapPin, Globe, Wallet, Trophy, MessageSquare, Lightbulb, Shield, Mail } from "lucide-react"
import { ProfileForm } from "./_components/profileform"
import { auth } from "@/auth"

export default async function ProfilePage() {
    const session = await auth()

    if (!session?.user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
                    <p className="text-gray-600 mt-2">Please sign in to continue</p>
                </div>
            </div>
        )
    }

    // Get profile data and stats
    const [profileData, statsData] = await Promise.all([
        getProfile(),
        getUserStats()
    ])

    if (!profileData.success || !profileData.user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Error loading profile</h1>
                    <p className="text-gray-600 mt-2">Please try again later</p>
                </div>
            </div>
        )
    }

    const { user } = profileData
    const stats = statsData.success ? statsData.stats : null

    return (
        <div className="min-h-screen bg-gradient-to-bl dark:from-black dark:via-gray-900 dark:to-black">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Profile Sidebar */}
                    <div className="lg:w-1/3">
                        <Card className="sticky top-8">
                            <CardHeader className="text-center">
                                <div className="relative mx-auto">
                                    <Avatar className="h-32 w-32 mx-auto border-4 border-white shadow-lg">
                                        <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name || "User"} />
                                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl font-bold">
                                            {user.name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <CardTitle className="text-2xl font-bold mt-4">{user.name}</CardTitle>
                                <CardDescription className="text-lg">{user.email}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-center">
                                    <Badge variant="outline" className="flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        {user.role === 'ADMIN' ? 'Admin' : 'User'}
                                    </Badge>
                                </div>

                                <Separator />

                                {/* Basic Info */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span>{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>Member since {stats?.memberSince || new Date(user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {user.location && (
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span>{user.location}</span>
                                        </div>
                                    )}
                                    {user.website && (
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Globe className="h-4 w-4" />
                                            <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                {user.website}
                                            </a>
                                        </div>
                                    )}
                                    {user.walletAddress && (
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Wallet className="h-4 w-4" />
                                            <span className="font-mono text-xs">{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</span>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Skills */}
                                {user.skills && user.skills.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-sm">Skills</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {user.skills.map((skill: string, index: number) => (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Interests */}
                                {user.interests && user.interests.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-sm">Interests</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {user.interests.map((interest: string, index: number) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {interest}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <Separator />

                                {/* Stats */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                        <Trophy className="h-4 w-4" />
                                        Statistics
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {user.totalValidations || 0}
                                            </p>
                                            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                Validations
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-green-600">
                                                {user.totalIdeasSubmitted || 0}
                                            </p>
                                            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                                <Lightbulb className="h-3 w-3" />
                                                Ideas
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-2xl font-bold text-purple-600">
                                                {user.reputationScore || 0}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Reputation Score</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-2/3">
                        <Tabs defaultValue="profile" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="profile" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Profile
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="profile" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Profile Information</CardTitle>
                                        <CardDescription>
                                            Update your profile information, bio, and preferences
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ProfileForm user={user} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            
                            <TabsContent value="settings" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Account Settings</CardTitle>
                                        <CardDescription>
                                            Manage your account preferences and security settings
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <SettingsForm user={user} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}