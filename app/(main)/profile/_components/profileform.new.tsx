"use client"

import { useState, useRef } from "react"
import { updateProfile, uploadProfileImage } from "@/actions/profile.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Upload, X, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProfileFormProps {
    user: {
        id: string
        name: string | null
        email: string | null
        bio: string | null
        location: string | null
        website: string | null
        skills: string[]
        interests: string[]
        walletAddress: string | null
        image: string | null
        role: string
    }
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [imageUploading, setImageUploading] = useState(false)
    const imageInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        walletAddress: user.walletAddress || "",
        skills: user.skills || [],
        interests: user.interests || [],
        image: user.image || ""
    })

    const [newSkill, setNewSkill] = useState("")
    const [newInterest, setNewInterest] = useState("")

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setImageUploading(true)

        try {
            const uploadFormData = new FormData()
            uploadFormData.append('image', file)

            const result = await uploadProfileImage(uploadFormData)

            if (result.success) {
                const newImageUrl = result.imageUrl || ""
                setFormData(prev => ({
                    ...prev,
                    image: newImageUrl
                }))
                toast.success("Profile image uploaded successfully!")
            } else {
                toast.error(result.error || "Failed to upload image")
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast.error("Failed to upload image")
        } finally {
            setImageUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await updateProfile({
                name: formData.name,
                bio: formData.bio || undefined,
                location: formData.location || undefined,
                website: formData.website || undefined,
                walletAddress: formData.walletAddress || undefined,
                skills: formData.skills,
                interests: formData.interests,
            })

            if (result.success) {
                toast.success("Profile updated successfully!")
            } else {
                toast.error(result.error || "Failed to update profile")
            }
        } catch {
            toast.error("An error occurred while updating profile")
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleRemoveImage = () => {
        setFormData(prev => ({
            ...prev,
            image: ""
        }))
    }

    const addSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim()) && formData.skills.length < 10) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }))
            setNewSkill("")
        }
    }

    const removeSkill = (skillToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }))
    }

    const addInterest = () => {
        if (newInterest.trim() && !formData.interests.includes(newInterest.trim()) && formData.interests.length < 10) {
            setFormData(prev => ({
                ...prev,
                interests: [...prev.interests, newInterest.trim()]
            }))
            setNewInterest("")
        }
    }

    const removeInterest = (interestToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.filter(interest => interest !== interestToRemove)
        }))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image Upload */}
            <Card className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-white dark:border-neutral-800 shadow-lg">
                            <AvatarImage src={formData.image || undefined} alt="Profile" />
                            <AvatarFallback className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xl font-bold">
                                {formData.name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <Label htmlFor="profileImage" className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                Profile Image
                            </Label>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                                Upload a profile picture (Max 5MB)
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => imageInputRef.current?.click()}
                                    disabled={imageUploading}
                                    className="border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                                >
                                    {imageUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Image
                                        </>
                                    )}
                                </Button>
                                {formData.image && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRemoveImage}
                                        className="border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Remove
                                    </Button>
                                )}
                            </div>
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Basic Information */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        Full Name *
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="border-neutral-300 dark:border-neutral-700 focus:border-teal-500 dark:focus:border-teal-400"
                        placeholder="Enter your full name"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        Location
                    </Label>
                    <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="border-neutral-300 dark:border-neutral-700 focus:border-teal-500 dark:focus:border-teal-400"
                        placeholder="City, Country"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        Website
                    </Label>
                    <Input
                        id="website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleChange}
                        className="border-neutral-300 dark:border-neutral-700 focus:border-teal-500 dark:focus:border-teal-400"
                        placeholder="https://yourwebsite.com"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="walletAddress" className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        Wallet Address (Polygon)
                    </Label>
                    <Input
                        id="walletAddress"
                        name="walletAddress"
                        value={formData.walletAddress}
                        onChange={handleChange}
                        className="border-neutral-300 dark:border-neutral-700 focus:border-teal-500 dark:focus:border-teal-400 font-mono text-sm"
                        placeholder="0x..."
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Bio
                </Label>
                <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="border-neutral-300 dark:border-neutral-700 focus:border-teal-500 dark:focus:border-teal-400 min-h-[100px]"
                    placeholder="Tell us about yourself, your interests, and what drives you to validate ideas..."
                    maxLength={500}
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 text-right">
                    {formData.bio.length}/500 characters
                </p>
            </div>

            {/* Skills Section */}
            <div className="space-y-3">
                <Label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Skills (Max 10)
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {formData.skills.map((skill, index) => (
                        <Badge 
                            key={index} 
                            variant="secondary"
                            className="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 cursor-pointer hover:bg-teal-100 dark:hover:bg-teal-900/30"
                            onClick={() => removeSkill(skill)}
                        >
                            {skill}
                            <X className="ml-1 h-3 w-3" />
                        </Badge>
                    ))}
                </div>
                {formData.skills.length < 10 && (
                    <div className="flex gap-2">
                        <Input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Add a skill..."
                            className="border-neutral-300 dark:border-neutral-700 focus:border-teal-500 dark:focus:border-teal-400"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addSkill()
                                }
                            }}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addSkill}
                            disabled={!newSkill.trim()}
                            className="border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Interests Section */}
            <div className="space-y-3">
                <Label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Interests (Max 10)
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {formData.interests.map((interest, index) => (
                        <Badge 
                            key={index} 
                            variant="outline"
                            className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            onClick={() => removeInterest(interest)}
                        >
                            {interest}
                            <X className="ml-1 h-3 w-3" />
                        </Badge>
                    ))}
                </div>
                {formData.interests.length < 10 && (
                    <div className="flex gap-2">
                        <Input
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            placeholder="Add an interest..."
                            className="border-neutral-300 dark:border-neutral-700 focus:border-teal-500 dark:focus:border-teal-400"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addInterest()
                                }
                            }}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addInterest}
                            disabled={!newInterest.trim()}
                            className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    disabled={isLoading || !formData.name.trim()}
                    className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        "Update Profile"
                    )}
                </Button>
            </div>
        </form>
    )
}
