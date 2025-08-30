"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FloatingPaths } from "@/components/background-paths"
import { Header } from "@/components/navbar"
import SmoothScroll from "@/components/smoothscroll"
import { WordRotate } from "@/components/ui/word-rotate"
import { MainLanding } from "@/components/mainlanding"
import Link from "next/link"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function MainLandingPage() {
	const title = "Validate"
	const subtitle = "Get Your Ideas Validated by Global Experts or Earn Crypto by Validating Others' Innovations"
	const words = title.split(" ")

	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId)
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' })
		}
	}

	return (
		<div className="relative w-full bg-white dark:bg-neutral-950">
			{/* Hero Section */}
			<div className="relative min-h-screen w-full flex items-center justify-center overflow-auto py-24 md:py-28">
				<div className="absolute inset-0">
					<FloatingPaths position={1} />
					<FloatingPaths position={-1} />
				</div>
				<section className="relative z-10 container mx-auto px-4 md:px-6 text-center">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 2 }}
						className="max-w-6xl mx-auto"
					>
						<div className="flex flex-col gap-4 items-center justify-center mb-8">
							<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter">
								{
									words.map((word, wordIndex) => (
										<span
											key={wordIndex}
											className="inline-block mr-4 last:mr-0"
										>
											{
												word.split("").map((letter, letterIndex) => (
													<motion.span
														key={`${wordIndex}-${letterIndex}`}
														initial={{ y: 100, opacity: 0 }}
														animate={{ y: 0, opacity: 1 }}
														transition={{
															delay:
																wordIndex * 0.1 +
																letterIndex * 0.03,
															type: "spring",
															stiffness: 150,
															damping: 25,
														}}
														className="inline-block text-transparent bg-clip-text 
															bg-gradient-to-r from-neutral-900 to-neutral-700/80 
															dark:from-white dark:to-white/80"
													>
														{letter}
													</motion.span>
												))
											}
										</span>
									))
								}
							</h1>
							<WordRotate
								className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-black dark:text-white
									inline-block text-transparent bg-clip-text 
									bg-gradient-to-r from-neutral-900 to-neutral-700/80 
									dark:from-white dark:to-white/80"
								words={["Ideas", "Projects", "Thoughts", "Anything", "Everything"]}
							/>
						</div>
						<motion.p
							initial={{ opacity: 0, y: 50 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 1, duration: 0.8 }}
							className="text-xl md:text-2xl mb-12 text-neutral-600 dark:text-neutral-400 max-w-4xl mx-auto"
						>
							{subtitle}
						</motion.p>

						{/* Role Selection Buttons */}
						<motion.div
							initial={{ opacity: 0, y: 50 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 1.5, duration: 0.8 }}
							className="flex flex-col items-center gap-8"
						>
							<div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
								<Button
									onClick={() => scrollToSection('submitter-section')}
									className="group px-12 py-6 text-xl font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
								>
									<span className="mr-3">💡</span>
									I&apos;m a Submitter
									<span className="ml-3 transition-transform group-hover:translate-x-1">→</span>
								</Button>
								<Button
									onClick={() => scrollToSection('validator-section')}
									className="group px-12 py-6 text-xl font-semibold rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
								>
									<span className="mr-3">💰</span>
									I&apos;m a Validator
									<span className="ml-3 transition-transform group-hover:translate-x-1">→</span>
								</Button>
							</div>
							
							{/* Down Arrow */}
							<motion.div
								animate={{ y: [0, 10, 0] }}
								transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
								className="flex flex-col items-center gap-2 text-neutral-500 dark:text-neutral-400"
							>
								<span className="text-sm font-medium">Choose your role below</span>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
								</svg>
							</motion.div>
						</motion.div>

						{/* General CTA Buttons */}
						<motion.div
							initial={{ opacity: 0, y: 50 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 2, duration: 0.8 }}
							className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-16"
						>
							<div
								className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 
								dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg 
								overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
							>
								<Button
									asChild
									variant="ghost"
									className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
									bg-white/95 hover:bg-white/100 dark:bg-black/95 dark:hover:bg-black/100 
									text-black dark:text-white transition-all duration-300 
									group-hover:-translate-y-0.5 border border-black/10 dark:border-white/10
									hover:shadow-md dark:hover:shadow-neutral-800/50"
								>
									<Link href="/signup">
										<span className="opacity-90 group-hover:opacity-100 transition-opacity">
											Join ValidateX
										</span>
										<span
											className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
											transition-all duration-300"
										>
											→
										</span>
									</Link>
								</Button>
							</div>
							<Button
								asChild
								variant="outline"
								className="px-8 py-6 text-lg font-semibold rounded-2xl border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
							>
								<Link href="/signin">
									Sign In
								</Link>
							</Button>
						</motion.div>
					</motion.div>
				</section>
			</div>

			{/* Submitter Section */}
			<section id="submitter-section" className="py-24 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50">
				<div className="container mx-auto px-4 md:px-6 max-w-7xl">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<div className="inline-flex items-center gap-3 bg-blue-100 dark:bg-blue-900/30 px-6 py-3 rounded-full mb-6">
							<span className="text-3xl">💡</span>
							<span className="text-blue-800 dark:text-blue-200 font-semibold text-lg">For Innovators & Creators</span>
						</div>
						<h2 className="text-4xl md:text-5xl font-bold mb-6 text-blue-900 dark:text-blue-100">
							Submit Your Ideas for Expert Validation
						</h2>
						<p className="text-xl text-blue-700 dark:text-blue-300 max-w-3xl mx-auto mb-12">
							Turn your innovative concepts into validated opportunities with feedback from global experts. 
							Pay with traditional methods or crypto - your choice for getting quality insights.
						</p>
					</motion.div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
						>
							<h3 className="text-2xl font-bold mb-6 text-blue-900 dark:text-blue-100">What You Can Do:</h3>
							<ul className="space-y-4">
								<li className="flex items-start gap-4">
									<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
										<span className="text-white text-sm">✓</span>
									</div>
									<div>
										<h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Submit Any Type of Idea</h4>
										<p className="text-blue-700 dark:text-blue-300">Business concepts, product innovations, startup ideas, creative projects, or research proposals</p>
									</div>
								</li>
								<li className="flex items-start gap-4">
									<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
										<span className="text-white text-sm">✓</span>
									</div>
									<div>
										<h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Get Expert Feedback</h4>
										<p className="text-blue-700 dark:text-blue-300">Receive detailed analysis from qualified validators with relevant industry experience</p>
									</div>
								</li>
								<li className="flex items-start gap-4">
									<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
										<span className="text-white text-sm">✓</span>
									</div>
									<div>
										<h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Track Performance</h4>
										<p className="text-blue-700 dark:text-blue-300">Monitor engagement metrics, feedback quality, and idea validation scores</p>
									</div>
								</li>
								<li className="flex items-start gap-4">
									<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
										<span className="text-white text-sm">✓</span>
									</div>
									<div>
										<h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Flexible Payment Options</h4>
										<p className="text-blue-700 dark:text-blue-300">Pay small fees with traditional payment methods or cryptocurrency - choose what works best for you</p>
									</div>
								</li>
							</ul>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 50 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
							className="bg-white dark:bg-blue-950/30 rounded-3xl p-8 shadow-xl border border-blue-200 dark:border-blue-800"
						>
							<h3 className="text-2xl font-bold mb-6 text-blue-900 dark:text-blue-100 text-center">How It Works for Submitters:</h3>
							<div className="space-y-6">
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
										<span className="text-white font-bold">1</span>
									</div>
									<div>
										<h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Create Your Submission</h4>
										<p className="text-blue-700 dark:text-blue-300 text-sm">Describe your idea, upload documents, set validation criteria, and choose your budget</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
										<span className="text-white font-bold">2</span>
									</div>
									<div>
										<h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Get Matched with Validators</h4>
										<p className="text-blue-700 dark:text-blue-300 text-sm">Our algorithm matches your idea with qualified validators based on expertise and experience</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
										<span className="text-white font-bold">3</span>
									</div>
									<div>
										<h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Receive Detailed Feedback</h4>
										<p className="text-blue-700 dark:text-blue-300 text-sm">Get comprehensive validation reports with actionable insights and recommendations</p>
									</div>
								</div>
							</div>
							<Button asChild className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl text-lg">
								<Link href="/signup?role=submitter">Start Submitting Ideas</Link>
							</Button>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Validator Section */}
			<section id="validator-section" className="py-24 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50">
				<div className="container mx-auto px-4 md:px-6 max-w-7xl">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<div className="inline-flex items-center gap-3 bg-emerald-100 dark:bg-emerald-900/30 px-6 py-3 rounded-full mb-6">
							<span className="text-3xl">💰</span>
							<span className="text-emerald-800 dark:text-emerald-200 font-semibold text-lg">For Experts & Validators</span>
						</div>
						<h2 className="text-4xl md:text-5xl font-bold mb-6 text-emerald-900 dark:text-emerald-100">
							Earn Crypto by Validating Ideas
						</h2>
						<p className="text-xl text-emerald-700 dark:text-emerald-300 max-w-3xl mx-auto mb-12">
							Join our community of expert validators and earn rewards by providing valuable feedback to innovators. 
							Get paid in traditional currency or cryptocurrency - your choice for maximum flexibility.
						</p>
					</motion.div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
							className="bg-white dark:bg-emerald-950/30 rounded-3xl p-8 shadow-xl border border-emerald-200 dark:border-emerald-800"
						>
							<h3 className="text-2xl font-bold mb-6 text-emerald-900 dark:text-emerald-100 text-center">How It Works for Validators:</h3>
							<div className="space-y-6">
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
										<span className="text-white font-bold">1</span>
									</div>
									<div>
										<h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Build Your Profile</h4>
										<p className="text-emerald-700 dark:text-emerald-300 text-sm">Set up your expertise areas, experience level, and validation preferences - completely free</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
										<span className="text-white font-bold">2</span>
									</div>
									<div>
										<h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Browse Available Ideas</h4>
										<p className="text-emerald-700 dark:text-emerald-300 text-sm">Choose from ideas that match your expertise and interests from our curated marketplace</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
										<span className="text-white font-bold">3</span>
									</div>
									<div>
										<h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Provide Feedback & Get Paid</h4>
										<p className="text-emerald-700 dark:text-emerald-300 text-sm">Submit quality validation reports and receive payments via traditional methods or Polygon blockchain</p>
									</div>
								</div>
							</div>
							<Button asChild className="w-full mt-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-4 rounded-xl text-lg">
								<Link href="/signup?role=validator">Start Earning Rewards</Link>
							</Button>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 50 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
						>
							<h3 className="text-2xl font-bold mb-6 text-emerald-900 dark:text-emerald-100">What You Can Earn:</h3>
							<ul className="space-y-4">
								<li className="flex items-start gap-4">
									<div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
										<span className="text-white text-sm">✓</span>
									</div>
									<div>
										<h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-1">Zero Investment Required</h4>
										<p className="text-emerald-700 dark:text-emerald-300">Join completely free - no upfront costs, deposits, or hidden fees to start validating</p>
									</div>
								</li>
								<li className="flex items-start gap-4">
									<div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
										<span className="text-white text-sm">✓</span>
									</div>
									<div>
										<h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-1">Flexible Payment Options</h4>
										<p className="text-emerald-700 dark:text-emerald-300">Choose to receive payments via traditional methods or automatic MATIC crypto payments on Polygon blockchain</p>
									</div>
								</li>
								<li className="flex items-start gap-4">
									<div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
										<span className="text-white text-sm">✓</span>
									</div>
									<div>
										<h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-1">Build Your Reputation</h4>
										<p className="text-emerald-700 dark:text-emerald-300">Higher-rated validators get access to premium validations with increased earning potential</p>
									</div>
								</li>
								<li className="flex items-start gap-4">
									<div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
										<span className="text-white text-sm">✓</span>
									</div>
									<div>
										<h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-1">Flexible Schedule</h4>
										<p className="text-emerald-700 dark:text-emerald-300">Work on your own time, choose validations that interest you, and set your availability</p>
									</div>
								</li>
							</ul>
						</motion.div>
					</div>
				</div>
			</section>
		</div>
	)
}

export default function Home() {
	return (
		<SmoothScroll>
			<Header />
			<MainLandingPage />
			<MainLanding />
		</SmoothScroll>
	)
}