"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Star, Users, Shield, Zap, Globe, ArrowRight, CheckCircle, MessageSquare, Coins, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const FeaturesSection = () => {
    const features = [
        {
            icon: MessageSquare,
            title: "Submit & Validate Ideas",
            description: "Share your innovations and get valuable feedback from our diverse community of validators worldwide."
        },
        {
            icon: Coins,
            title: "Blockchain Rewards",
            description: "Earn crypto rewards for validating ideas. Transparent payments via Polygon blockchain technology."
        },
        {
            icon: Globe,
            title: "Global Community",
            description: "Connect with students, startups, NGOs, and creators from around the world for diverse perspectives."
        },
        {
            icon: Shield,
            title: "Secure Platform",
            description: "Built with enterprise-grade security and blockchain technology to protect your intellectual property."
        },
        {
            icon: TrendingUp,
            title: "Analytics Dashboard",
            description: "Track your idea's performance with detailed analytics and community engagement metrics."
        },
        {
            icon: Zap,
            title: "Instant Feedback",
            description: "Get real-time feedback from qualified validators to iterate and improve your ideas quickly."
        }
    ];

    return (
        <section id="features" className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 dark:text-white"
                    >
                        Why Choose ValidateX?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto"
                    >
                        Discover the powerful features that make ValidateX the perfect platform for idea validation
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                        >
                            <Card className="h-full bg-white/50 dark:bg-black/20 backdrop-blur-lg border-neutral-200/50 dark:border-neutral-800/50 hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl mb-4 flex items-center justify-center">
                                        <feature.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle className="text-xl font-semibold text-neutral-900 dark:text-white">
                                        {feature.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-neutral-600 dark:text-neutral-400">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const HowItWorksSection = () => {
    const steps = [
        {
            step: "01",
            title: "Submit Your Idea",
            description: "Share your innovative concept with our global community of validators. Provide detailed descriptions, mockups, or prototypes."
        },
        {
            step: "02",
            title: "Community Validation",
            description: "Qualified validators from diverse backgrounds review and provide detailed feedback on your idea's potential and viability."
        },
        {
            step: "03",
            title: "Earn Rewards",
            description: "Validators earn crypto rewards for their valuable feedback, while idea submitters gain insights to improve their concepts."
        },
        {
            step: "04",
            title: "Iterate & Improve",
            description: "Use the feedback to refine your idea, then resubmit for another round of validation until you're ready to launch."
        }
    ];

    return (
        <section id="how-it-works" className="py-24">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 dark:text-white"
                    >
                        How It Works
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto"
                    >
                        Simple steps to validate your ideas and earn rewards
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: index * 0.2 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-white font-bold text-xl">{step.step}</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
                                {step.title}
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const PricingSection = () => {
    const plans = [
        {
            name: "Pay-Per-Validation",
            price: "5% Fee",
            description: "Pay only when you validate ideas",
            features: [
                "No monthly subscription",
                "5% fee on validation amount",
                "Pay with crypto (Solana, Polygon, etc.)",
                "Community-based validation",
                "Basic feedback reports",
                "Flexible payment options"
            ],
            cta: "Start Validating",
            popular: true,
            note: "Fee is taken from your validation deposit, rest distributed to validators"
        },
        {
            name: "Premium Validation",
            price: "$49",
            description: "Get expert validation from curated validators",
            features: [
                "Everything in Pay-Per-Validation",
                "Curated expert validators",
                "Detailed market analysis",
                "Real user feedback simulation",
                "Priority validation queue",
                "Advanced analytics dashboard",
                "Direct validator communication"
            ],
            cta: "Get Premium",
            popular: false,
            note: "Monthly subscription for access to expert validator pool"
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "For organizations and large teams",
            features: [
                "Everything in Premium",
                "Custom validation criteria",
                "API access",
                "Dedicated account manager",
                "Custom integrations",
                "White-label solution",
                "SLA guarantees"
            ],
            cta: "Contact Sales",
            popular: false,
            note: "Custom pricing based on validation volume and requirements"
        }
    ];

    return (
        <section id="pricing" className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 dark:text-white"
                    >
                        Transparent Pricing
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto"
                    >
                        Choose between pay-as-you-go validation or premium expert feedback. No hidden fees, fully transparent blockchain payments.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: index * 0.2 }}
                        >
                            <Card className={cn(
                                "h-full bg-white dark:bg-neutral-900 relative",
                                plan.popular && "border-teal-500 shadow-xl scale-105"
                            )}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <CardHeader className="text-center pb-4">
                                    <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {plan.name}
                                    </CardTitle>
                                    <div className="mt-4">
                                        <span className="text-4xl font-bold text-neutral-900 dark:text-white">
                                            {plan.price}
                                        </span>
                                        {plan.price !== "Custom" && plan.price !== "5% Fee" && (
                                            <span className="text-neutral-600 dark:text-neutral-400">/month</span>
                                        )}
                                    </div>
                                    <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                                        {plan.description}
                                    </p>
                                    {plan.note && (
                                        <p className="text-xs text-teal-600 dark:text-teal-400 mt-2 bg-teal-50 dark:bg-teal-900/20 p-2 rounded-lg">
                                            {plan.note}
                                        </p>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-start gap-3">
                                                <CheckCircle className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-neutral-600 dark:text-neutral-400 text-sm">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        asChild
                                        className={cn(
                                            "w-full",
                                            plan.popular
                                                ? "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
                                                : "variant-outline"
                                        )}
                                    >
                                        <Link href="/signup">
                                            {plan.cta}
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Additional Info Section */}
                <div className="mt-16 text-center">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 max-w-4xl mx-auto border border-neutral-200 dark:border-neutral-800">
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                            How Our Pricing Works
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                            <div>
                                <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">💰 Pay-Per-Validation</h4>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                                    Set your validation deposit amount. We take 5%, the rest is distributed equally among validators who provide feedback.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">🎯 Premium Access</h4>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                                    Subscribe to access our curated pool of expert validators including market researchers, entrepreneurs, and industry specialists.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">⛓️ Blockchain Transparency</h4>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                                    All payments are handled through smart contracts on Polygon/Solana for complete transparency and automatic distribution.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">🚀 No Hidden Fees</h4>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                                    What you see is what you pay. No setup fees, no hidden charges. Only pay when you validate or for premium access.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const CommunitySection = () => {
    const stats = [
        { icon: Users, value: "50K+", label: "Active Validators" },
        { icon: Star, value: "4.9/5", label: "Average Rating" },
        { icon: Globe, value: "120+", label: "Countries" },
        { icon: Zap, value: "24/7", label: "Community Support" }
    ];

    return (
        <section id="community" className="py-24">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 dark:text-white"
                    >
                        Join Our Community
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto"
                    >
                        Connect with innovators, entrepreneurs, and creators from around the world
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <stat.icon className="h-8 w-8 text-white" />
                            </div>
                            <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                                {stat.value}
                            </div>
                            <div className="text-neutral-600 dark:text-neutral-400">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-3xl p-8 md:p-12 text-center text-white"
                >
                    <h3 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Validate Your Next Big Idea?
                    </h3>
                    <p className="text-xl mb-8 opacity-90">
                        Join thousands of innovators who trust ValidateX to turn their ideas into reality
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            asChild
                            size="lg"
                            variant="secondary"
                            className="px-8 py-6 text-lg font-semibold rounded-2xl bg-white text-neutral-900 hover:bg-neutral-100"
                        >
                            <Link href="/signup">
                                Start For Free
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="px-8 py-6 text-lg font-semibold rounded-2xl border-white/20 text-white hover:bg-white/10"
                        >
                            <Link href="#features">
                                Learn More
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

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
                    {/* Logo and Description */}
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

                    {/* Footer Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h3 className="font-semibold mb-4">{category}</h3>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-neutral-400 hover:text-white transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
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

export function MainLanding() {
    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <FeaturesSection />
            <HowItWorksSection />
            <PricingSection />
            <CommunitySection />
            <Footer />
        </div>
    );
}