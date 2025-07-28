"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function DashboardPage() {
    const { data: session } = useSession()

    if (!session) {
        redirect("/signin")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50">
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to ValidateX Dashboard</h1>
                    <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-2">Hello, {session.user?.name}!</h2>
                        <p className="text-teal-100">Email: {session.user?.email}</p>
                        <p className="text-teal-100">Role: {session.user?.role}</p>
                    </div>
                    
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Submit Ideas</h3>
                            <p className="text-gray-600">Upload your ideas for validation by the community.</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Validate Ideas</h3>
                            <p className="text-gray-600">Review and provide feedback on submitted ideas.</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Track Progress</h3>
                            <p className="text-gray-600">Monitor your submissions and earnings.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
