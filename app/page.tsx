"use client";

import * as React from "react";
import { Github, Shield, Zap, Code2, Star, ExternalLink, Mail } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";

export default function App() {
	const [isHovered, setIsHovered] = React.useState(false);
	const [email, setEmail] = React.useState("");

	return (
		<main className="h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/50 relative overflow-hidden">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.05),transparent_50%)] pointer-events-none"></div>
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none"></div>
			<div className="relative h-full flex items-center justify-center p-4">
				<div className="max-w-5xl w-full h-full max-h-[95vh] flex flex-col">
					<div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden flex-1 flex flex-col">
						<div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-10 text-center relative overflow-hidden">
							<div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-emerald-600/20"></div>
							<div className="relative z-10">
								<div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl mb-4 shadow-lg">
									<Shield className="w-8 h-8 text-white" />
								</div>
								<h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
									ValidateX
								</h1>
								<p className="text-lg text-teal-50 font-medium">by Niraj Jha</p>
							</div>
						</div>
						<div className="px-8 py-8 flex-1 flex flex-col">
							<div className="text-center mb-8">
								<h2 className="text-xl font-semibold text-gray-800 mb-3">
									Powerful Form Validation Made Simple
								</h2>
								<p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
									ValidateX is a comprehensive form validation platform that helps developers create robust,
									user-friendly forms with powerful validation rules and beautiful error handling.
								</p>
							</div>

							{/* Email Waitlist Section */}
							<div className="text-center mb-8">
								<div className="max-w-sm mx-auto space-y-4">
									<div className="flex items-center justify-center gap-2 mb-4">
										<Mail className="w-5 h-5 text-teal-600" />
										<span className="text-gray-700 font-medium">Join the Early Access</span>
									</div>
									<Input
										placeholder="Enter your email for early access"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										aria-label="Email input"
										className="text-center bg-white/70 border-gray-300 focus:border-teal-500 focus:ring-teal-500"
									/>
									<Dialog>
										<DialogTrigger asChild>
											<Button
												className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
												disabled={!email.trim()}
											>
												Join the Waitlist
											</Button>
										</DialogTrigger>
										<DialogContent className="sm:max-w-md">
											<DialogHeader>
												<DialogTitle className="text-center text-2xl font-bold text-gray-900">
													🎉 Welcome to ValidateX!
												</DialogTitle>
												<DialogDescription className="text-center text-gray-600 mt-4 space-y-2">
													<p>Thank you for joining our waitlist!</p>
													<p>We&aops;ll keep you updated with the latest news and notify you when ValidateX launches.</p>
													<div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mt-4">
														<p className="text-teal-800 text-sm font-medium">
															💡 Get ready for powerful form validation tools that will revolutionize your development workflow!
														</p>
													</div>
												</DialogDescription>
											</DialogHeader>
										</DialogContent>
									</Dialog>
								</div>
							</div>

							<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 flex-1">
								<div className="group bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-5 border border-teal-100/50 hover:border-teal-200 hover:shadow-md transition-all duration-300">
									<div className="text-center">
										<div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow mx-auto mb-3">
											<Zap className="w-5 h-5 text-white" />
										</div>
										<h3 className="text-gray-800 font-semibold text-sm mb-2">Smart Validation</h3>
										<p className="text-gray-600 text-xs leading-relaxed">
											Intelligent validation rules with real-time feedback.
										</p>
									</div>
								</div>
								<div className="group bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100/50 hover:border-emerald-200 hover:shadow-md transition-all duration-300">
									<div className="text-center">
										<div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow mx-auto mb-3">
											<Code2 className="w-5 h-5 text-white" />
										</div>
										<h3 className="text-gray-800 font-semibold text-sm mb-2">Easy Integration</h3>
										<p className="text-gray-600 text-xs leading-relaxed">
											Seamless integration with any React framework.
										</p>
									</div>
								</div>
								<div className="group bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-5 border border-teal-100/50 hover:border-teal-200 hover:shadow-md transition-all duration-300">
									<div className="text-center">
										<div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow mx-auto mb-3">
											<Shield className="w-5 h-5 text-white" />
										</div>
										<h3 className="text-gray-800 font-semibold text-sm mb-2">Customizable</h3>
										<p className="text-gray-600 text-xs leading-relaxed">
											Flexible themes and validation messages.
										</p>
									</div>
								</div>
								<div className="group bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100/50 hover:border-emerald-200 hover:shadow-md transition-all duration-300">
									<div className="text-center">
										<div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow mx-auto mb-3">
											<Star className="w-5 h-5 text-white" />
										</div>
										<h3 className="text-gray-800 font-semibold text-sm mb-2">TypeScript First</h3>
										<p className="text-gray-600 text-xs leading-relaxed">
											Built with TypeScript for better developer experience.
										</p>
									</div>
								</div>
							</div>

							<div className="text-center">
								<Link
									href="https://github.com/jha-niraj/validatex"
									target="_blank"
									rel="noopener noreferrer"
									className="group inline-flex items-center gap-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
									onMouseEnter={() => setIsHovered(true)}
									onMouseLeave={() => setIsHovered(false)}
								>
									<Github className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'rotate-12' : ''}`} />
									<span>View on GitHub</span>
									<ExternalLink className="w-4 h-4 opacity-80" />
								</Link>
								<div className="flex items-center justify-center gap-2 text-gray-500 mt-4">
									<Star className="w-4 h-4 text-amber-400 fill-current" />
									<span className="text-sm font-medium">Help other developers discover ValidateX</span>
								</div>
							</div>
						</div>
						<div className="bg-gray-50/80 px-8 py-4 border-t border-gray-200/50">
							<div className="flex items-center justify-center gap-6 text-gray-500 text-sm font-medium">
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-teal-500 rounded-full"></div>
									<span>Open Source</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
									<span>TypeScript</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
									<span>Form Validation</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
