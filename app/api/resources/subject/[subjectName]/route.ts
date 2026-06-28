import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { Resource } from "@/models/Resource";
import { User } from "@/models/User";
import { Vote } from "@/models/Vote";
import { NextResponse } from "next/server";

// get resources of subjects related to user's branch and semester only
//replaced with getSubjectResources service
export async function GET(
    request: Request,
    {
        params,
    }: {
        params: Promise<{
            subjectName: string;
        }>;
    }
) {

    try {

        await connectDB();

        const userId =
            await getUserFromToken();

        if (!userId) {

            return NextResponse.json(
                {
                    message:
                        "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const user =
            await User.findById(
                userId
            ).select(
                "branch semester bookmarks"
            );

        if (!user) {

            return NextResponse.json(
                {
                    message:
                        "User not found",
                },
                {
                    status: 404,
                }
            );
        }

        const { subjectName } =
            await params;

        const decodedSubject =
            decodeURIComponent(
                subjectName
            );

        const subjectKey =
            decodedSubject
                .toLowerCase()
                .replace(/\s+/g, "");

        /* FETCH RESOURCES */

        const resources =
            await Resource.find({
                subjectKey,

                branch:
                    user.branch,

                semester:
                    user.semester,
            })
                .populate(
                    "uploadedBy",
                    "name"
                )
                .sort({
                    votes: -1,
                    views: -1,
                });

        /* USER VOTES */

        const userVotes =
            await Vote.find({
                user: userId,
            });

        const votedResourceIds =
            new Set(
                userVotes.map((v) =>
                    v.resource.toString()
                )
            );

        /* USER BOOKMARKS */

        const bookmarkedIds =
            new Set(
                user.bookmarks.map(
                    (id: any) =>
                        id.toString()
                )
            );

        /* ATTACH FLAGS */

        const finalResources =
            resources.map(
                (resource) => ({

                    ...resource.toObject(),

                    isVoted:
                        votedResourceIds.has(
                            resource._id.toString()
                        ),

                    isBookmarked:
                        bookmarkedIds.has(
                            resource._id.toString()
                        ),
                })
            );

        return NextResponse.json(
            {
                message:
                    "Resources by subject fetched",

                resources:
                    finalResources,
            },
            {
                status: 200,
            }
        );

    } catch (err: any) {

        return NextResponse.json(
            {
                message:
                    err.message,
            },
            {
                status: 500,
            }
        );
    }
}