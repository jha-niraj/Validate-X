'use server'

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { redirect } from "next/navigation";

const onboardingSchema = z.object({
	userRole: z.enum(["SUBMITTER", "VALIDATOR", "BOTH"]),
	categories: z.array(z.string()).min(1, "Please select at least one category"),
	customCategory: z.string().optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export async function completeOnboarding(data: OnboardingInput) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return { success: false, error: "Not authenticated" };
		}

		const validatedData = onboardingSchema.parse(data);

		// Add custom category to the categories array if provided
		let categories = validatedData.categories;
		if (validatedData.customCategory && validatedData.customCategory.trim()) {
			categories = [...categories, validatedData.customCategory.trim()];
		}

		// Update user with onboarding data
		const user = await prisma.user.update({
			where: { id: session.user.id },
			data: {
				userRole: validatedData.userRole,
				onboardingCompleted: true,
				updatedAt: new Date(),
			}
		});

		// Create category selections for the user
		if (categories.length > 0) {
			await prisma.categorySelection.createMany({
				data: categories.map(categoryId => ({
					userId: session.user.id,
					categoryId
				})),
				skipDuplicates: true
			});
		}

		return { success: true };
	} catch (error) {
		console.error("Error completing onboarding:", error);

		if (error instanceof z.ZodError) {
			return { success: false, error: error.issues[0].message };
		}

		return { success: false, error: "Failed to complete onboarding" };
	}
}

export async function checkOnboardingStatus() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return { needsOnboarding: true };
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				onboardingCompleted: true,
				userRole: true,
			}
		});

		if (!user || !user.onboardingCompleted) {
			return { needsOnboarding: true };
		}

		return {
			needsOnboarding: false,
			userRole: user.userRole
		};
	} catch (error) {
		console.error("Error checking onboarding status:", error);
		return { needsOnboarding: true };
	}
}

export async function redirectAfterOnboarding(userRole: string) {
	switch (userRole) {
		case 'VALIDATOR':
			redirect('/validatehub');
		case 'SUBMITTER':
			redirect('/dashboard?createPost=true');
		case 'BOTH':
			redirect('/dashboard');
		default:
			redirect('/dashboard');
	}
}
