"use server";

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export const onBoardUser = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return {
        error: "Unauthorized",
        success: false,
      };
    }

    const { id, firstName, lastName, imageUrl, emailAddresses } = user;

    const newUser = await db.user.upsert({
      where: {
        clerkId: id,
      },
      create: {
        clerkId: id,
        name: `${firstName} ${lastName}`,
        email: emailAddresses[0].emailAddress,
        image: imageUrl,
      },
      update: {
        name: `${firstName} ${lastName}`,
        email: emailAddresses[0].emailAddress,
        image: imageUrl,
      },
    });

    return {
      success: true,
      user: newUser,
      message: "User onboarded successfully",
    };
  } catch (err) {
    console.error("Error onboarding user:", err);
    return {
      error: "Failed to onboard user",
      success: false,
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return {
        error: "Unauthorized",
        success: false,
      };
    }
    const dbUser = db.user.findUnique({
      where: {
        clerkId: user.id,
      },
    });
    return {
      success: true,
      user: dbUser,
      message: "User fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      error: "Failed to fetch user",
      success: false,
    };
  }
};
