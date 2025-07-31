'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/mainsidebar';
import MainNavbar from '@/components/mainnavbar';
import OnboardingCheck from '@/components/onboarding-check';
import { redirect } from 'next/navigation';

interface LayoutProps {
	children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
	const { data: session, status } = useSession();

	useEffect(() => {
		const savedState = localStorage.getItem('mainSidebarCollapsed');
		if (savedState !== null) {
			setSidebarCollapsed(JSON.parse(savedState));
		}
	}, []);

	const toggleSidebar = () => {
		const newState = !sidebarCollapsed;
		setSidebarCollapsed(newState);
		localStorage.setItem('mainSidebarCollapsed', JSON.stringify(newState));
	};

	if (!session?.user) {
		redirect('/signin');
	}

	return (
		<OnboardingCheck>
			<div className="flex h-screen">
				<Sidebar
					isCollapsed={sidebarCollapsed}
					toggleSidebar={toggleSidebar}
				/>
				<div className="flex flex-col flex-1">
					<MainNavbar isCollapsed={sidebarCollapsed} />
					<main className={`backdrop-blur-sm transition-all duration-300 ${sidebarCollapsed ? 'sm:ml-[60px] ml-[0px]' : 'sm:ml-[180px] ml-[0px]'} pt-16`}>
						<div className="h-full pb-16 md:pb-0">
							{children}
						</div>
					</main>
				</div>
			</div>
		</OnboardingCheck>
	);
};

export default Layout;