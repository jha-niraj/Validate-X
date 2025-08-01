'use server'

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import cloudinary from "@/lib/cloudinary";
import bcrypt from "bcryptjs";

const updateProfileSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters").optional(),
	bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
	location: z.string().max(100, "Location must be less than 100 characters").optional(),
	website: z.string().url("Invalid website URL").optional().or(z.literal("")),
	skills: z.array(z.string()).max(10, "Maximum 10 skills allowed").optional(),
	interests: z.array(z.string()).max(10, "Maximum 10 interests allowed").optional(),
	walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address").optional().or(z.literal("")),
});

const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Current password is required"),
	newPassword: z.string().min(6, "New password must be at least 6 characters"),
	confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => (
	data.newPassword === data.confirmPassword
), {
	message: "Passwords don't match",
	path: ["confirmPassword"],
});

// Delete Account Schema
const deleteAccountSchema = z.object({
	password: z.string().min(1, "Password is required to delete account"),
	confirmText: z.string().refine((val) => val === "DELETE", {
		message: "You must type 'DELETE' to confirm"
	})
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

interface CloudinaryUploadResult {
	secure_url: string;
	public_id: string;
}

async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	return new Promise<CloudinaryUploadResult>((resolve, reject) => {
		cloudinary.uploader.upload_stream(
			{
				folder: 'validatex/profile-images',
				resource_type: 'auto',
				transformation: [
					{ width: 400, height: 400, crop: 'fill', gravity: 'face' }
				]
			},
			(error: any, result: any) => {
				if (error) reject(error);
				else resolve(result as CloudinaryUploadResult);
			}
		).end(buffer);
	});
}

export async function getProfile() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return { success: false, error: "Not authenticated" };
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				bio: true,
				location: true,
				website: true,
				skills: true,
				interests: true,
				role: true,
				totalValidations: true,
				totalIdeasSubmitted: true,
				reputationScore: true,
				walletAddress: true,
				createdAt: true,
				updatedAt: true,
			}
		});

		if (!user) {
			return { success: false, error: "User not found" };
		}

		// Parse JSON fields
		const userWithParsedFields = {
			...user,
			skills: user.skills ? JSON.parse(user.skills) : [],
			interests: user.interests ? JSON.parse(user.interests) : [],
		};

		return { success: true, user: userWithParsedFields };
	} catch (error) {
		console.error("Error fetching profile:", error);
		return { success: false, error: "Failed to fetch profile" };
	}
}

export async function updateProfile(data: UpdateProfileInput) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return { success: false, error: "Not authenticated" };
		}

		const validatedData = updateProfileSchema.parse(data);

		// Prepare update data
		const updateData: any = {};

		if (validatedData.name) updateData.name = validatedData.name;
		if (validatedData.bio !== undefined) updateData.bio = validatedData.bio || null;
		if (validatedData.location !== undefined) updateData.location = validatedData.location || null;
		if (validatedData.website !== undefined) updateData.website = validatedData.website || null;
		if (validatedData.walletAddress !== undefined) updateData.walletAddress = validatedData.walletAddress || null;
		if (validatedData.skills) updateData.skills = JSON.stringify(validatedData.skills);
		if (validatedData.interests) updateData.interests = JSON.stringify(validatedData.interests);

		updateData.updatedAt = new Date();

		const updatedUser = await prisma.user.update({
			where: { id: session.user.id },
			data: updateData,
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				bio: true,
				location: true,
				website: true,
				skills: true,
				interests: true,
				walletAddress: true,
				updatedAt: true,
			}
		});

		// Parse JSON fields for response
		const userWithParsedFields = {
			...updatedUser,
			skills: updatedUser.skills ? JSON.parse(updatedUser.skills) : [],
			interests: updatedUser.interests ? JSON.parse(updatedUser.interests) : [],
		};

		return { success: true, user: userWithParsedFields };
	} catch (error) {
		console.error("Error updating profile:", error);

		if (error instanceof z.ZodError) {
			return { success: false, error: error.issues[0].message };
		}

		return { success: false, error: "Failed to update profile" };
	}
}

export async function uploadProfileImage(formData: FormData) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return { success: false, error: "Not authenticated" };
		}

		const file = formData.get('image') as File;

		if (!file) {
			return { success: false, error: "No file provided" };
		}

		// Validate file size (5MB max)
		if (file.size > 5 * 1024 * 1024) {
			return { success: false, error: "File size must be less than 5MB" };
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			return { success: false, error: "File must be an image" };
		}

		// Upload to Cloudinary
		const result = await uploadToCloudinary(file);

		// Update user image in database
		const updatedUser = await prisma.user.update({
			where: { id: session.user.id },
			data: {
				image: result.secure_url,
				updatedAt: new Date()
			},
			select: { image: true }
		});

		return {
			success: true,
			imageUrl: updatedUser.image,
			message: "Profile image updated successfully"
		};
	} catch (error) {
		console.error("Error uploading profile image:", error);
		return { success: false, error: "Failed to upload image" };
	}
}

export async function changePassword(data: ChangePasswordInput) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return { success: false, error: "Not authenticated" };
		}

		const validatedData = changePasswordSchema.parse(data);

		// Get current user
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { password: true }
		});

		if (!user || !user.password) {
			return { success: false, error: "User not found or no password set" };
		}

		// Verify current password
		const isCurrentPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password);

		if (!isCurrentPasswordValid) {
			return { success: false, error: "Current password is incorrect" };
		}

		// Check if new password is same as current password
		const isSamePassword = await bcrypt.compare(validatedData.newPassword, user.password);

		if (isSamePassword) {
			return { success: false, error: "New password cannot be the same as your current password" };
		}

		// Hash new password
		const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 12);

		// Update password
		await prisma.user.update({
			where: { id: session.user.id },
			data: {
				password: hashedNewPassword,
				updatedAt: new Date()
			}
		});

		return { success: true, message: "Password changed successfully" };
	} catch (error) {
		console.error("Error changing password:", error);

		if (error instanceof z.ZodError) {
			return { success: false, error: error.issues[0].message };
		}

		return { success: false, error: "Failed to change password" };
	}
}

export async function getUserStats() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return { success: false, error: "Not authenticated" };
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				totalValidations: true,
				totalIdeasSubmitted: true,
				reputationScore: true,
				createdAt: true,
			}
		});

		if (!user) {
			return { success: false, error: "User not found" };
		}

		const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});

		return {
			success: true,
			stats: {
				...user,
				memberSince
			}
		};
	} catch (error) {
		console.error("Error fetching user stats:", error);
		return { success: false, error: "Failed to fetch user stats" };
	}
}

// Delete Account function
export async function deleteAccount(data: DeleteAccountInput) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return { success: false, error: "Not authenticated" };
		}

		const validatedData = deleteAccountSchema.parse(data);

		// Get current user
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { password: true, email: true }
		});

		if (!user || !user.password) {
			return { success: false, error: "User not found or no password set" };
		}

		// Verify password
		const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

		if (!isPasswordValid) {
			return { success: false, error: "Password is incorrect" };
		}

		// Start transaction to delete all user-related data
		await prisma.$transaction(async (tx) => {
			// Delete user's category selections
			await tx.categorySelection.deleteMany({
				where: { userId: session.user.id }
			});

			// Delete user's validations
			await tx.validation.deleteMany({
				where: { validatorId: session.user.id }
			});

			// Delete user's posts
			await tx.post.deleteMany({
				where: { authorId: session.user.id }
			});

			// Delete user's transactions
			await tx.transaction.deleteMany({
				where: { userId: session.user.id }
			});

			// Finally delete the user
			await tx.user.delete({
				where: { id: session.user.id }
			});
		});

		return { success: true, message: "Account deleted successfully" };
	} catch (error) {
		console.error("Error deleting account:", error);

		if (error instanceof z.ZodError) {
			return { success: false, error: error.issues[0].message };
		}

		return { success: false, error: "Failed to delete account" };
	}
}
