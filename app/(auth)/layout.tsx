import Footer from '@/components/footer'
import { Header } from '@/components/navbar'
import React from 'react'

interface AuthLayoutProps {
    children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen">
            <Header />
            {children}
            <Footer />
        </div>
    )
}
