import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { imagekit } from "@/lib/imagekit";
import { redis } from "@/lib/redis";
import { Resource } from "@/models/Resource";
import { User } from "@/models/User";
import { Vote } from "@/models/Vote";
import { NextResponse } from "next/server";

//delete resource by resource id
export async function DELETE(request: Request, { params }: { params: Promise<{ resourceId: string }> }) {
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
        const resource = await Resource.findById(resourceId);

        if (!resource) {
            return NextResponse.json(
                {
                    message: "Resource not found",
                },
                { status: 404 }
            );
        }

        /* OWNERSHIP CHECK */
        if (resource.uploadedBy.toString() !== userId) {
            return NextResponse.json(
                {
                    message: "You are not allowed to delete this resource",
                },
                { status: 403 }
            );
        }

        /* DELETE FROM IMAGEKIT */
        if (resource.fileId) {
            await imagekit.deleteFile(
                resource.fileId
            );
        }

        /* USERS WHO BOOKMARKED THIS RESOURCE */
        const usersWithBookmark = await User.find(
            {
                bookmarks: resourceId,
            },
            "_id"
        );

        /* REMOVE BOOKMARKS */
        await User.updateMany(
            {
                bookmarks: resourceId,
            },
            {
                $pull: {
                    bookmarks: resourceId,
                },
            }
        );

        /* DELETE VOTES */
        await Vote.deleteMany({
            resource: resourceId,
        });

        /* DELETE RESOURCE */
        await resource.deleteOne();

        /* INVALIDATE HOME , LATEST AND BOOKMARK CACHES */
        await Promise.all([
            redis.del(`home:${userId}`),
            redis.del(`latest:${userId}`),
            redis.del(`top:${userId}`),

            ...usersWithBookmark.map((user) =>
                redis.del(`bookmarks:${user._id}`)
            ),
        ]);


        const response = NextResponse.json(
            {
                message: "Resource deleted successfully",
            },
            { status: 200 }
        );

        return response;

    }
    catch (err: any) {
        return NextResponse.json({
            message: err.message
        }, { status: 500 })
    }
}

//get single resource by id
export async function GET(request: Request, { params, }: { params: Promise<{ resourceId: string; }>; }) {
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

        const user = await User.findById(userId)
            .select("bookmarks");

        if (!user) {
            return NextResponse.json(
                {
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        /* CHECK VOTE */
        const existingVote = await Vote.findOne({
            user: userId,
            resource: resourceId,
        });

        /* FETCH RESOURCE */
        const resource = await Resource.findById(
            resourceId
        ).populate(
            "uploadedBy",
            "name"
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

        /* CHECK BOOKMARK */
        const isBookmarked = user.bookmarks.some(
            (id: any) =>
                id.toString() ===
                resourceId
        );

        return NextResponse.json(
            {
                ...resource.toObject(),

                isVoted:
                    !!existingVote,

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