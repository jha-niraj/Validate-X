"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { Menu, Star, Users, Shield, Zap, Globe, ArrowRight, CheckCircle, MessageSquare, Coins, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

function FloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 24 }, (_, i) => ({
        id: i,
        d: `M-${280 - i * 3 * position} -${139 + i * 4}C-${
            280 - i * 3 * position
        } -${139 + i * 4} -${212 - i * 3 * position} ${156 - i * 4} ${
            102 - i * 3 * position
        } ${243 - i * 4}C${416 - i * 3 * position} ${330 - i * 4} ${
            484 - i * 3 * position
        } ${575 - i * 4} ${484 - i * 3 * position} ${575 - i * 4}`,
        color: `rgba(15,23,42,${0.05 + i * 0.02})`,
        width: 0.3 + i * 0.02,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full text-slate-950 dark:text-white"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.05 + path.id * 0.02}
                        initial={{ pathLength: 0.2, opacity: 0.3 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.2, 0.4, 0.2],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 25 + Math.random() * 15,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

const NavBar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const menuItems = [
        { name: 'Features', href: '#features' },
        { name: 'How it Works', href: '#how-it-works' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Community', href: '#community' },
    ];

    return (
        <nav className={cn(
            "fixed top-0 left-0 w-full z-50 transition-all duration-300",
            isScrolled ? "bg-white/80 dark:bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-200/20 dark:border-neutral-800/20" : ""
        )}>
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">V</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-neutral-900 dark:text-white">ValidateX</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        <Button variant="ghost" asChild>
                            <Link href="/signin">Sign In</Link>
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700">
                            <Link href="/signup">Get Started</Link>
                        </Button>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-80">
                                <div className="flex flex-col gap-6 mt-8">
                                    {menuItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="text-lg text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                    <hr className="border-neutral-200 dark:border-neutral-800" />
                                    <div className="flex flex-col gap-3">
                                        <Button variant="ghost" asChild>
                                            <Link href="/signin">Sign In</Link>
                                        </Button>
                                        <Button asChild className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700">
                                            <Link href="/signup">Get Started</Link>
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const HeroSection = () => {
    const words = "ValidateX".split(" ");
    
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center pt-16">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="max-w-6xl mx-auto"
                >
                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
                        {words.map((word, wordIndex) => (
                            <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                                {word.split("").map((letter, letterIndex) => (
                                    <motion.span
                                        key={`${wordIndex}-${letterIndex}`}
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            delay: wordIndex * 0.1 + letterIndex * 0.03,
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
                                ))}
                            </span>
                        ))}
                    </h1>

                    <motion.p
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="text-xl md:text-2xl mb-12 text-neutral-600 dark:text-neutral-400 max-w-4xl mx-auto"
                    >
                        Empower Your Ideas with Blockchain-Powered Community Validation
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.8 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
                    >
                        <Button
                            asChild
                            size="lg"
                            className="px-8 py-6 text-lg font-semibold rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                        >
                            <Link href="/signup">
                                Start Validating
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="px-8 py-6 text-lg font-semibold rounded-2xl border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                            <Link href="/signin">
                                Sign In
                            </Link>
                        </Button>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2, duration: 0.8 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
                    >
                        <div className="text-center">
                            <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">10K+</div>
                            <div className="text-neutral-600 dark:text-neutral-400">Ideas Validated</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">50K+</div>
                            <div className="text-neutral-600 dark:text-neutral-400">Community Members</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">$100K+</div>
                            <div className="text-neutral-600 dark:text-neutral-400">Rewards Distributed</div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

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
            <div className="container mx-auto px-4 md:px-6">
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
            <div className="container mx-auto px-4 md:px-6">
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
            name: "Starter",
            price: "Free",
            description: "Perfect for individuals getting started",
            features: [
                "Submit 3 ideas per month",
                "Basic feedback reports",
                "Community access",
                "Email support"
            ],
            cta: "Get Started",
            popular: false
        },
        {
            name: "Pro",
            price: "$29",
            description: "Ideal for entrepreneurs and small teams",
            features: [
                "Unlimited idea submissions",
                "Detailed analytics",
                "Priority validation",
                "Expert feedback",
                "24/7 support"
            ],
            cta: "Start Pro Trial",
            popular: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "For organizations and large teams",
            features: [
                "Everything in Pro",
                "Custom validation criteria",
                "API access",
                "Dedicated account manager",
                "Custom integrations"
            ],
            cta: "Contact Sales",
            popular: false
        }
    ];

    return (
        <section id="pricing" className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 dark:text-white"
                    >
                        Simple Pricing
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto"
                    >
                        Choose the plan that&apos;s right for you and start validating your ideas today
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: index * 0.2 }}
                        >
                            <Card className={cn(
                                "h-full bg-white dark:bg-neutral-900 relative",
                                plan.popular && "border-teal-500 shadow-lg scale-105"
                            )}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <CardHeader className="text-center">
                                    <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {plan.name}
                                    </CardTitle>
                                    <div className="mt-4">
                                        <span className="text-4xl font-bold text-neutral-900 dark:text-white">
                                            {plan.price}
                                        </span>
                                        {plan.price !== "Free" && plan.price !== "Custom" && (
                                            <span className="text-neutral-600 dark:text-neutral-400">/month</span>
                                        )}
                                    </div>
                                    <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                                        {plan.description}
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-center gap-3">
                                                <CheckCircle className="h-5 w-5 text-teal-500 flex-shrink-0" />
                                                <span className="text-neutral-600 dark:text-neutral-400">
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
            <div className="container mx-auto px-4 md:px-6">
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
            <div className="container mx-auto px-4 md:px-6">
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
            <NavBar />
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <PricingSection />
            <CommunitySection />
            <Footer />
        </div>
    );
}
