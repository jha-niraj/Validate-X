"use client"

import Link from "next/link";
import { Button } from "./ui/button";

const Footer = () => {
    const footerLinks = {
        Product: [
            { name: "Features", href: "#features" },
            { name: "Pricing", href: "#pricing" },
            { name: "How it Works", href: "#how-it-works" },
            { name: "Community", href: "#community" }
        ],
        Company: [
            { name: "About Us", href: "/about" },
            { name: "Blog", href: "/blog" },
            { name: "Careers", href: "/careers" },
            { name: "Contact", href: "/contact" }
        ],
        Support: [
            { name: "Help Center", href: "/help" },
            { name: "Documentation", href: "/docs" },
            { name: "API Reference", href: "/api" },
            { name: "Status", href: "/status" }
        ],
        Legal: [
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Terms of Service", href: "/terms" },
            { name: "Cookie Policy", href: "/cookies" },
            { name: "GDPR", href: "/gdpr" }
        ]
    };

    return (
        <footer className="bg-neutral-900 text-white py-16">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">V</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight">ValidateX</span>
                        </Link>
                        <p className="text-neutral-400 mb-6 max-w-sm">
                            Empowering innovators worldwide with blockchain-powered idea validation and community feedback.
                        </p>
                        <div className="flex gap-4">
                            <Button size="sm" variant="ghost" className="p-2 hover:bg-neutral-800">
                                <span className="sr-only">Twitter</span>
                                🐦
                            </Button>
                            <Button size="sm" variant="ghost" className="p-2 hover:bg-neutral-800">
                                <span className="sr-only">LinkedIn</span>
                                💼
                            </Button>
                            <Button size="sm" variant="ghost" className="p-2 hover:bg-neutral-800">
                                <span className="sr-only">GitHub</span>
                                💻
                            </Button>
                        </div>
                    </div>
                    {
                        Object.entries(footerLinks).map(([category, links]) => (
                            <div key={category}>
                                <h3 className="font-semibold mb-4">{category}</h3>
                                <ul className="space-y-2">
                                    {
                                        links.map((link) => (
                                            <li key={link.name}>
                                                <Link
                                                    href={link.href}
                                                    className="text-neutral-400 hover:text-white transition-colors"
                                                >
                                                    {link.name}
                                                </Link>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        ))
                    }
                </div>
                <hr className="border-neutral-800 mb-8" />
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-neutral-400 text-sm">
                        © 2024 ValidateX. All rights reserved.
                    </p>
                    <p className="text-neutral-400 text-sm">
                        Made with ❤️ for innovators worldwide
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;