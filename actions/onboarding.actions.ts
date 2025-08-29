'use server'

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { redirect } from "next/navigation";

const onboardingSchema = z.object({
	role: z.enum(["SUBMITTER", "USER"]),
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
		const { role, categories: inputCategories, customCategory } = validatedData;

		// Ensure default categories exist in database
		const existingCategories = await seedDefaultCategories();

		// Map category names/IDs to database IDs
		const categoryIds: string[] = [];
		
		for (const categoryNameOrId of inputCategories) {
			// Check if it's already a valid CUID (database ID)
			const existingCategory = existingCategories.find(cat => 
				cat.id === categoryNameOrId || cat.name.toLowerCase() === categoryNameOrId.toLowerCase()
			);
			
			if (existingCategory) {
				categoryIds.push(existingCategory.id);
			} else {
				// If it's a fallback category name, try to find by name mapping
				const fallbackMapping: Record<string, string> = {
					'tech': 'Technology',
					'business': 'Business', 
					'assignments': 'Assignments',
					'social-impact': 'Social Impact',
					'creative': 'Creative'
				};
				
				const mappedName = fallbackMapping[categoryNameOrId] || categoryNameOrId;
				const mappedCategory = existingCategories.find(cat => 
					cat.name.toLowerCase() === mappedName.toLowerCase()
				);
				
				if (mappedCategory) {
					categoryIds.push(mappedCategory.id);
				}
			}
		}

		// Create custom category if provided and doesn't exist
		if (customCategory && customCategory.trim()) {
			const existingCustom = existingCategories.find(cat => 
				cat.name.toLowerCase() === customCategory.trim().toLowerCase()
			);
			
			if (!existingCustom) {
				const newCategory = await prisma.category.create({
					data: {
						name: customCategory.trim(),
						description: `Custom category: ${customCategory.trim()}`,
						icon: "⭐", // Default icon for custom categories
						isActive: true
					}
				});
				categoryIds.push(newCategory.id);
			} else {
				categoryIds.push(existingCustom.id);
			}
		}

		// Update user with onboarding data
		const user = await prisma.user.update({
			where: { id: session.user.id },
			data: {
				role: validatedData.role,
				onboardingCompleted: true,
				updatedAt: new Date(),
			}
		});

		// Create category selections for the user
		if (categoryIds.length > 0) {
			await prisma.categorySelection.createMany({
				data: categoryIds.map(categoryId => ({
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
				role: true,
			}
		});

		if (!user || !user.onboardingCompleted) {
			return { needsOnboarding: true };
		}

		return {
			needsOnboarding: false,
			role: user.role
		};
	} catch (error) {
		console.error("Error checking onboarding status:", error);
		return { needsOnboarding: true };
	}
}

export async function redirectAfterOnboarding(role: string) {
	switch (role) {
		case 'USER':
			redirect('/validatehub');
			break;
		case 'SUBMITTER':
			redirect('/dashboard?createPost=true');
			break;
		default:
			redirect('/dashboard');
			break;
	}
}

// Seed default categories if they don't exist
export async function seedDefaultCategories() {
	const DEFAULT_CATEGORIES = [
		{ name: "Technology", icon: "💻", description: "Software, Hardware, AI, Web Development" },
		{ name: "Business", icon: "🏢", description: "Startups, Business Models, Marketing" },
		{ name: "Assignments", icon: "📚", description: "Academic Projects, Research, Studies" },
		{ name: "Social Impact", icon: "❤️", description: "Non-profit, Community, Sustainability" },
		{ name: "Creative", icon: "🎨", description: "Design, Art, Content, Media" },
	]

	try {
		const existingCategories = await prisma.category.findMany()
		
		if (existingCategories.length === 0) {
			await prisma.category.createMany({
				data: DEFAULT_CATEGORIES.map(category => ({
					name: category.name,
					description: category.description,
					icon: category.icon,
					isActive: true
				})),
				skipDuplicates: true
			})
			console.log("Default categories seeded")
		}
		
		return await prisma.category.findMany({
			where: { isActive: true },
			orderBy: { name: 'asc' }
		})
	} catch (error) {
		console.error("Error seeding categories:", error);
		throw error;
	}
}