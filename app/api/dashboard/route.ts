import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { Resource } from "@/models/Resource";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

//fetch user dashboard
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
                "name email branch semester bookmarks"
            );

        if (!user) {
            return NextResponse.json(
                {
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        /* MY UPLOADS */
        const myUploads = await Resource.find({
            uploadedBy: userId,
        }).sort({
            createdAt: -1,
        });

        const totalUploads = myUploads.length;

        const totalViews = myUploads.reduce(
            (
                acc: number,
                item: any
            ) => acc + item.views,
            0
        );

        const totalVotes = myUploads.reduce(
            (
                acc: number,
                item: any
            ) => acc + item.votes,
            0
        );

        /* BOOKMARKED RESOURCES */
        const bookmarkedResources = await Resource.find({
            _id: {
                $in: user.bookmarks,
            },
        });

        return NextResponse.json(
            {
                user: {
                    name: user.name,
                    email: user.email,
                    branch: user.branch,
                    semester:
                        user.semester,
                },

                stats: {
                    totalUploads,
                    totalViews,
                    totalVotes,

                    totalBookmarks:
                        user.bookmarks
                            .length,
                },

                myUploads,

                bookmarks:
                    bookmarkedResources,
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