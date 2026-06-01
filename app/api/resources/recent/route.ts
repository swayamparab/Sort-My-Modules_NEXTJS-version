import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { Resource } from "@/models/Resource";
import { User } from "@/models/User";
import { Vote } from "@/models/Vote";
import { NextResponse } from "next/server";

//latest uploaded resources related to user
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

        /* RECENT RESOURCES */
        const resources = await Resource.find({
            branch: user.branch,
            semester: user.semester,
        })
            .populate(
                "uploadedBy",
                "name"
            )
            .sort({
                createdAt: -1,
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
        const resourcesWithMeta =
            resources.map((resource) => ({
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

        const response = NextResponse.json(
            {
                message: "Recent resources fetched",

                resources: resourcesWithMeta,
            },
            { status: 200 }
        );

        return response;
        
    } catch (err: any) {
        return NextResponse.json(
            {
                message: err.message,
            },
            { status: 500 }
        );
    }
}