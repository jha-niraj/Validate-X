"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar, Compass, History, LogOut, Plus, Star } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

interface Route {
    path: string;
    name: string;
    icon: React.ReactNode;
    status: string;
}

const routes: Route[] = [
    { path: "explore", name: "Explore", icon: <Compass />, status: "active" },
    { path: "calendar", name: "Calendar", icon: <Calendar />, status: "coming" },
    { path: "saved", name: "Saved", icon: <Star />, status: "coming" },
    { path: "history", name: "History", icon: <History />, status: "coming" },
    { path: "create", name: "Create Event", icon: <Plus />, status: "coming" },
];

export function Navbar() {
    const [sheetOpen, setSheetOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { theme } = useTheme()
    const router = useRouter()
    const { data: session, status } = useSession();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleNavigation = (path: string, status: string) => {
        if (status === "coming") {
            toast("Feature is currently under development, please explore the events page.");
        } else {
            router.push(`/${path}`);
        }
        setSheetOpen(false);
    };

    const sidebarContent = (
        <div className="flex flex-col h-full">
            <div className="flex h-[100px] w-full items-center justify-center p-[20px]">
                <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                    <div className="relative h-[50px] w-[160px]">
                        <Image
                            src={theme === "dark" ? "/logo/whitelogo.svg" : "/logo/logo.png"}
                            alt="EventEye Logo"
                            fill
                            className="object-contain dark:text-white"
                            priority
                        />
                    </div>
                </Link>
            </div>
            <div className="mb-4 h-px bg-gray-200 dark:bg-gray-700" />
            <div className="flex flex-col flex-grow px-4 py-2 space-y-6">
                {
                    routes.map((route, index) => (
                        <button
                            key={index}
                            onClick={() => handleNavigation(route.path, route.status)}
                            className="flex w-full items-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 
                        transition-all hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800 cursor-pointer group"
                        >
                            <div className="h-5 w-5 stroke-2 mr-3 transition-transform group-hover:-translate-x-0.5">
                                {route.icon}
                            </div>
                            <span>{route.name}</span>
                        </button>
                    ))
                }
            </div>
            <div className="px-4 mt-auto">
                <button
                    onClick={() => signOut()}
                    className="flex w-full items-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 
                    transition-all hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer group"
                >
                    <LogOut className="h-5 w-5 stroke-2 mr-3 transition-transform group-hover:-translate-x-0.5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <nav className={`fixed top-0 w-full z-50 text-white transition-all duration-300 ${scrolled ? "bg-black/30 backdrop-blur-md" : "bg-transparent"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center space-x-2">
                        <Image
                            src={theme === "dark" ? "/logo/logo.png" : "/logo/whitelogo.svg"}
                            alt="Icon"
                            width={32}
                            height={32}
                        />
                        <h1 className="text-xl font-semibold">EventEye</h1>
                    </Link>

                    <div className="hidden md:flex items-center space-x-10">
                        {
                            ["explore", "features", "testimonials", "pricing", "faqs"].map((item) => (
                                <Link key={item} href={item === "explore" ? `/${item}` : `#${item}`} className="text-md font-semibold hover:bg-gray-500 rounded-xl p-3 transition-all duration-300">
                                    {item.charAt(0).toUpperCase() + item.slice(1)}
                                </Link>
                            ))
                        }
                    </div>

                    <div className="flex items-center justify-center space-x-4">
                        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                            <SheetContent side="right" className="w-[300px] p-0">
                                {
                                    status === "authenticated" ? (
                                        sidebarContent
                                    ) : (
                                        <div className="flex h-full justify-center items-center">
                                            <Button
                                                variant="outline"
                                                onClick={() => router.push("/signin")}
                                                className="w-3/4 flex rounded-lg px-4 py-4 text-md bg-white hover:text-black hover:bg-white text-black hover:shadow-[0px_6px_0px_0px_rgba(0,0,0,1)] shadow-none transition-all duration-200"
                                            >
                                                SignIn
                                            </Button>
                                        </div>
                                    )
                                }
                            </SheetContent>
                        </Sheet>
                        {
                            status === "authenticated" ? (
                                <button className="rounded-full">
                                    {
                                        session?.user?.image ? (
                                            <Image
                                                className="h-10 w-10 rounded-full"
                                                src={session.user.image}
                                                alt={`Profile picture of ${session.user.name || 'user'}`}
                                                width={40}
                                                height={40}
                                                onClick={() => setSheetOpen(true)}
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-500 text-sm">
                                                    {session?.user?.name?.[0] || 'U'}
                                                </span>
                                            </div>
                                        )
                                    }
                                </button>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => router.push("/signin")}
                                    className="w-full flex rounded-lg px-4 py-4 text-md bg-white hover:text-black hover:bg-white text-black hover:shadow-[0px_6px_0px_0px_rgba(0,0,0,1)] shadow-none transition-all duration-200"
                                >
                                    SignIn
                                </Button>
                            )
                        }
                    </div>
                </div>
            </div>
        </nav>
    )
}