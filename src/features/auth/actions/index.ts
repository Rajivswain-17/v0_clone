"use server"

import {auth, currentUser} from "@clerk/nextjs/server";
import {prisma} from "@/lib/db";

export async function onBoardUser() {
    const {userId} = await auth();

    if(!userId) return;

    const clerkuser = await currentUser();

    if(!clerkuser) return;

    const email = clerkuser.primaryEmailAddress?.emailAddress ??
    clerkuser.emailAddresses[0]?.emailAddress ??
    null;


    const name = 
    clerkuser.fullName ?? ([clerkuser.firstName, clerkuser.lastName].filter(Boolean).join(" ") || null);
    
    await prisma.user.upsert({
        where: { clerkId: userId },
       
        create: {
            clerkId: userId,
            email,
            firstName: clerkuser.firstName ?? undefined,
            lastName: clerkuser.lastName,
            name,
            imageUrl: clerkuser.imageUrl,
        },
        update: {
            email,
            firstName: clerkuser.firstName,
            lastName: clerkuser.lastName,
            name,
            imageUrl: clerkuser.imageUrl,
        }
    });
}


export const getCurrentUser = async () => {
    try {
        const user = await currentUser();

        if(!user){
        return null;
        }
    
    const dbuser = await prisma.user.findUnique({
        where: {
            clerkId: user.id,
        },
        select: {
            id: true,
            email: true,
            name: true,
            imageUrl: true,
            clerkId: true,
        },
    });

    return dbuser;
} catch (error) {
    console.error("Error fetching current user:", error);
    return null;
}
};
