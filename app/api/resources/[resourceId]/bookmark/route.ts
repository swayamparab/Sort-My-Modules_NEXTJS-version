import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { redis } from "@/lib/redis";
import { Resource } from "@/models/Resource";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params, }: { params: Promise<{ resourceId: string; }>; }) {
    try {
        await connectDB();

        const userId = await getUserFromToken();

        if (!userId) {
            return NextResponse.json(
                {
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const { resourceId } = await params;

        const resource = await Resource.findById(
            resourceId
        );

        if (!resource) {
            return NextResponse.json(
                {
                    message:
                        "Resource not found",
                },
                { status: 404 }
            );
        }

        const user = await User.findById(userId);

        const alreadyBookmarked = user.bookmarks.some(
            (id: any) =>
                id.toString() ===
                resourceId
        );

        let isBookmarked;

        if (alreadyBookmarked) {
            user.bookmarks.pull(
                resourceId
            );

            isBookmarked = false;
        } else {
            user.bookmarks.push(
                resourceId
            );

            isBookmarked = true;
        }

        await user.save();

        await Promise.all([
            redis.del(`home:${userId}`),
            redis.del(`bookmarks:${userId}`),
        ]);

        return NextResponse.json(
            {
                message: isBookmarked
                    ? "Bookmarked successfully"
                    : "Bookmark removed",

                isBookmarked,
            },
            { status: 200 }
        );
    } catch (err: any) {
        return NextResponse.json(
            {
                message: err.message,
            },
            { status: 500 }
        );
    }
}