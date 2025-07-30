"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const waitingListSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

export async function addToWaitingList(email: string) {
	try {
		// Validate the email
		const validatedData = waitingListSchema.parse({ email });

		// Check if email already exists
		const existingEntry = await prisma.waitingList.findUnique({
			where: { email: validatedData.email },
		});

		if (existingEntry) {
			return {
				success: false,
				error: "This email is already on our waiting list!",
			};
		}

		// Add to waiting list
		const waitingListEntry = await prisma.waitingList.create({
			data: {
				email: validatedData.email,
			},
		});

		return {
			success: true,
			message: "Successfully added to waiting list!",
			data: waitingListEntry,
		};
	} catch (error) {
		console.error("Error adding to waiting list:", error);

		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: error.issues[0].message,
			};
		}

		return {
			success: false,
			error: "Something went wrong. Please try again.",
		};
	}
}

export async function getWaitingListCount() {
	try {
		const count = await prisma.waitingList.count();
		return { success: true, count };
	} catch (error) {
		console.error("Error getting waiting list count:", error);
		return { success: false, count: 0 };
	}
}
