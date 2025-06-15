"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Globe } from "lucide-react"

interface AuthLayoutProps {
    children: ReactNode
    title: string
    subtitle: string
    floating?: ReactNode[]
}

export function AuthLayout({ children, title, subtitle, floating }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-white to-teal-50/30 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-br-full"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-teal-500/10 to-emerald-500/10 rounded-tl-full"></div>
            {floating && floating.map((item) => item)}
            <div className="mb-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Globe className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-700 bg-clip-text text-transparent">
                        HimalSpeak
                    </span>
                </Link>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-teal-100 p-8">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                        <p className="text-gray-600 mt-2">{subtitle}</p>
                    </div>
                    {children}
                </div>
            </motion.div>
        </div>
    )
}