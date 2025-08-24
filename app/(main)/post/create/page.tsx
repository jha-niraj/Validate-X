"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
	Image, FileText, BarChart3, ExternalLink, Settings,
	Play, Palette, FileIcon, MessageSquare, ThumbsUp, 
	Globe, Smartphone, Share2, Upload, HelpCircle, Lightbulb
} from "lucide-react"
import { motion } from "framer-motion"

const validationTypes = [
	{
		id: "media",
		title: "Media Validation",
		description: "Get feedback on images, videos, and visual content",
		icon: Image,
		color: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
		borderColor: "border-purple-200 dark:border-purple-800",
		examples: ["YouTube Thumbnails", "Design Mockups", "Video Reviews"],
		subtypes: [
			{
				id: "thumbnail_selection",
				title: "Thumbnail/Image Selection",
				description: "Upload 2-5 images and let validators vote or rank the best one",
				icon: Image,
				examples: ["YouTube thumbnails", "Social media covers", "Product photos"],
				rewardRange: "₹0.5 - ₹5"
			},
			{
				id: "design_feedback",
				title: "Design Mockup Feedback",
				description: "Get detailed feedback on UI/UX designs and visual mockups",
				icon: Palette,
				examples: ["Website designs", "App interfaces", "Logo concepts"],
				rewardRange: "₹0.5 - ₹10"
			},
			{
				id: "video_review",
				title: "Video Snippet Review",
				description: "Get engagement feedback on short video clips or trailers",
				icon: Play,
				examples: ["Promo videos", "Explainer clips", "Product demos"],
				rewardRange: "₹0.5 - ₹8"
			}
		]
	},
	{
		id: "document",
		title: "Document Validation",
		description: "Review PDFs, reports, and text-based content",
		icon: FileText,
		color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
		borderColor: "border-blue-200 dark:border-blue-800",
		examples: ["Business Plans", "Research Papers", "Content Scripts"],
		subtypes: [
			{
				id: "project_review",
				title: "Project/Pitch Document Review",
				description: "Get comprehensive feedback on business plans, reports, and presentations",
				icon: FileIcon,
				examples: ["Business plans", "Capstone projects", "Pitch decks"],
				rewardRange: "₹0.5 - ₹15"
			},
			{
				id: "content_feedback",
				title: "Content Script Feedback",
				description: "Review and improve written content, scripts, and drafts",
				icon: FileText,
				examples: ["Blog posts", "Video scripts", "Marketing copy"],
				rewardRange: "₹0.5 - ₹8"
			},
			{
				id: "policy_validation",
				title: "Policy/Report Validation",
				description: "Validate policies, research reports, and institutional documents",
				icon: MessageSquare,
				examples: ["NGO policies", "Research reports", "Guidelines"],
				rewardRange: "₹0.5 - ₹12"
			}
		]
	},
	{
		id: "poll",
		title: "Poll/Survey Validation",
		description: "Quick polls and surveys for market research",
		icon: BarChart3,
		color: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
		borderColor: "border-green-200 dark:border-green-800",
		examples: ["Market Research", "Feature Voting", "Opinion Polls"],
		subtypes: [
			{
				id: "binary_poll",
				title: "Yes/No Binary Poll",
				description: "Simple yes/no questions for quick decision making",
				icon: ThumbsUp,
				examples: ["Is this idea viable?", "Should we launch this?", "Do you like this concept?"],
				rewardRange: "₹0.5 - ₹3"
			},
			{
				id: "multiple_choice",
				title: "Multiple Choice Survey",
				description: "Multiple options for detailed market research and feedback",
				icon: BarChart3,
				examples: ["Best pricing model", "Preferred features", "Target audience"],
				rewardRange: "₹0.5 - ₹5"
			},
			{
				id: "ranking_poll",
				title: "Ranking Poll",
				description: "Rank items in order of preference or priority",
				icon: BarChart3,
				examples: ["Feature priorities", "Design preferences", "Content ranking"],
				rewardRange: "₹0.5 - ₹5"
			}
		]
	},
	{
		id: "link",
		title: "Link/URL Validation",
		description: "Test websites, apps, and digital experiences",
		icon: ExternalLink,
		color: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
		borderColor: "border-orange-200 dark:border-orange-800",
		examples: ["Website Testing", "App Prototypes", "Social Media"],
		subtypes: [
			{
				id: "website_usability",
				title: "Website Usability Feedback",
				description: "Get user experience feedback on websites and landing pages",
				icon: Globe,
				examples: ["Landing pages", "E-commerce sites", "Portfolio websites"],
				rewardRange: "₹0.5 - ₹10"
			},
			{
				id: "app_prototype",
				title: "App Prototype Test",
				description: "Test app prototypes and interactive designs for usability",
				icon: Smartphone,
				examples: ["Figma prototypes", "App demos", "Interactive wireframes"],
				rewardRange: "₹0.5 - ₹12"
			},
			{
				id: "social_media_post",
				title: "Social Media Post Validation",
				description: "Get feedback on social media content and engagement potential",
				icon: Share2,
				examples: ["Twitter threads", "Instagram posts", "LinkedIn content"],
				rewardRange: "₹0.5 - ₹5"
			}
		]
	},
	{
		id: "custom",
		title: "Custom Validation",
		description: "Flexible validation for unique requirements",
		icon: Settings,
		color: "bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400",
		borderColor: "border-gray-200 dark:border-gray-800",
		examples: ["Mixed Content", "Special Cases", "Open Questions"],
		subtypes: [
			{
				id: "generic_upload",
				title: "Generic Upload/Feedback",
				description: "Upload any file type with custom instructions for validation",
				icon: Upload,
				examples: ["Audio files", "Code snippets", "Custom formats"],
				rewardRange: "₹0.5 - ₹15"
			},
			{
				id: "hybrid_format",
				title: "Hybrid/Multi-Format",
				description: "Combine multiple content types in one validation",
				icon: Settings,
				examples: ["PDF + Poll", "Image + Survey", "Video + Questions"],
				rewardRange: "₹1 - ₹20"
			},
			{
				id: "open_query",
				title: "Open-Ended Query",
				description: "Ask open questions without files for expert opinions",
				icon: HelpCircle,
				examples: ["Business model validation", "Strategy feedback", "Market analysis"],
				rewardRange: "₹0.5 - ₹10"
			}
		]
	}
]

export default function PostTypeSelectionPage() {
	const router = useRouter()
	const [selectedType, setSelectedType] = useState<string | null>(null)
	const [selectedSubtype, setSelectedSubtype] = useState<string | null>(null)

	const handleCreatePost = () => {
		if (!selectedType || !selectedSubtype) {
			return
		}
		
		router.push(`/post/create/${selectedType}?subtype=${selectedSubtype}`)
	}

	const selectedTypeData = validationTypes.find(type => type.id === selectedType)

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
			<div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="flex items-center gap-3 mb-8">
						<Lightbulb className="h-8 w-8 text-blue-600" />
						<div>
							<h1 className="text-3xl font-bold">Create Validation Post</h1>
							<p className="text-muted-foreground">
								Choose the type of validation you need for your content
							</p>
						</div>
					</div>

					{!selectedType ? (
						<>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
								{validationTypes.map((type, index) => (
									<motion.div
										key={type.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 }}
									>
										<Card 
											className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${type.borderColor} border-2`}
											onClick={() => setSelectedType(type.id)}
										>
											<CardHeader>
												<div className={`p-3 rounded-lg ${type.color} w-fit mb-3`}>
													<type.icon className="h-6 w-6" />
												</div>
												<CardTitle className="flex items-center gap-2">
													{type.title}
												</CardTitle>
												<CardDescription>
													{type.description}
												</CardDescription>
											</CardHeader>
											<CardContent>
												<div className="space-y-2">
													{type.examples.map((example, idx) => (
														<Badge key={idx} variant="secondary" className="mr-2">
															{example}
														</Badge>
													))}
												</div>
											</CardContent>
										</Card>
									</motion.div>
								))}
							</div>
						</>
					) : (
						<>
							<div className="mb-6">
								<Button
									variant="outline"
									onClick={() => {
										setSelectedType(null)
										setSelectedSubtype(null)
									}}
									className="mb-4"
								>
									← Back to Type Selection
								</Button>
								
								<div className="flex items-center gap-3 mb-4">
									<div className={`p-3 rounded-lg ${selectedTypeData?.color} w-fit`}>
										{selectedTypeData && <selectedTypeData.icon className="h-6 w-6" />}
									</div>
									<div>
										<h2 className="text-2xl font-bold">{selectedTypeData?.title}</h2>
										<p className="text-muted-foreground">{selectedTypeData?.description}</p>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
								{selectedTypeData?.subtypes.map((subtype, index) => (
									<motion.div
										key={subtype.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 }}
									>
										<Card 
											className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
												selectedSubtype === subtype.id 
													? `${selectedTypeData.borderColor} border-2 bg-blue-50 dark:bg-blue-950/20` 
													: 'border hover:border-gray-300'
											}`}
											onClick={() => setSelectedSubtype(subtype.id)}
										>
											<CardHeader>
												<div className={`p-2 rounded-lg ${selectedTypeData.color} w-fit mb-2`}>
													<subtype.icon className="h-5 w-5" />
												</div>
												<CardTitle className="text-lg">{subtype.title}</CardTitle>
												<CardDescription className="text-sm">
													{subtype.description}
												</CardDescription>
											</CardHeader>
											<CardContent>
												<div className="space-y-3">
													<div>
														<p className="text-sm font-medium text-muted-foreground mb-1">Examples:</p>
														<div className="space-y-1">
															{subtype.examples.map((example, idx) => (
																<Badge key={idx} variant="outline" className="mr-1 text-xs">
																	{example}
																</Badge>
															))}
														</div>
													</div>
													<div className="pt-2 border-t">
														<p className="text-sm font-medium text-green-600">
															Reward Range: {subtype.rewardRange}
														</p>
													</div>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								))}
							</div>

							{selectedSubtype && (
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									className="flex justify-center"
								>
									<Button 
										onClick={handleCreatePost}
										size="lg"
										className="px-8"
									>
										Continue with {selectedTypeData?.subtypes.find(s => s.id === selectedSubtype)?.title}
									</Button>
								</motion.div>
							)}
						</>
					)}
				</motion.div>
			</div>
		</div>
	)
}