import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { Resource } from "@/models/Resource";
import { User } from "@/models/User";
import { Vote } from "@/models/Vote";
import { NextResponse } from "next/server";

export async function GET() {
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

        const user = await User.findById(userId)
            .select(
                "branch semester bookmarks"
            );

        if (!user) {
            return NextResponse.json(
                {
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        /* GET PERSONALIZED RESOURCES */
        const resources = await Resource.find({
            branch: user.branch,
            semester: user.semester,
        })
            .populate(
                "uploadedBy",
                "name"
            )
            .sort({
                votes: -1,
                title: 1,
            });

        /* USER VOTES */
        const userVotes = await Vote.find({
            user: userId,
        });

        const votedResourceIds = new Set(
            userVotes.map((vote) =>
                vote.resource.toString()
            )
        );

        /* USER BOOKMARKS */
        const bookmarkedResourceIds = new Set(
            user.bookmarks.map((id: any) =>
                id.toString()
            )
        );

        /* ATTACH FLAGS */
        const resourcesWithFlags = resources.map((resource) => ({
            ...resource.toObject(),

            isVoted:
                votedResourceIds.has(
                    resource._id.toString()
                ),

            isBookmarked:
                bookmarkedResourceIds.has(
                    resource._id.toString()
                ),
        }));

        return NextResponse.json(
            {
                message:
                    "Personalized feed fetched",

                resources:
                    resourcesWithFlags,
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