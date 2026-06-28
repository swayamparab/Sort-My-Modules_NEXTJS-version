import { connectDB } from "@/lib/db";
import { Resource } from "@/models/Resource";
import { User } from "@/models/User";
import { Vote } from "@/models/Vote";

type HomeResource = {
    _id: string;
    title: string;
    subject: string;
    subjectKey: string;
    description: string;
    faculty: string;
    semester: string;
    branch: string;
    pdfUrl: string;
    fileId: string;
    uploadedBy: {
        _id: string;
        name: string;
    } | null;
    views: number;
    votes: number;
    createdAt: Date;
    updatedAt: Date;
    isVoted: boolean;
    isBookmarked: boolean;
};

type SubjectGroup = {
    subject: string;
    count: number;
    topResources: HomeResource[];
};

export async function getHomePage(userId: string) {
    await connectDB();

    const user = await User.findById(userId)
        .select(
            "branch semester bookmarks"
        );

    if (!user) {
        throw new Error("User not found");
    }

    /* BOOKMARK IDS */
    const bookmarkedIds =
        new Set(
            user.bookmarks.map(
                (id: any) =>
                    id.toString()
            )
        );

    /* USER VOTES */

    const userVotes =
        await Vote.find({
            user: userId,
        });

    const votedIds = new Set(
        userVotes.map((v) =>
            v.resource.toString()
        )
    );

    /* FETCH RESOURCES */
    const resources = await Resource.find({
        branch: user.branch,
        semester: user.semester,
    }).populate(
        "uploadedBy",
        "name"
    ).lean();

    /* GROUP RESOURCES */
    const grouped: Record<string, SubjectGroup> = {};

    for (let resource of resources) {
        const key =
            resource.subjectKey;

        if (!grouped[key]) {
            grouped[key] = {
                subject:
                    resource.subject,

                count: 0,

                topResources: [],
            };
        }

        grouped[key].count++;

        grouped[key].topResources.push({
            ...resource,
            _id: resource._id.toString(),
            uploadedBy:
                resource.uploadedBy &&
                    typeof resource.uploadedBy === "object" &&
                    "_id" in resource.uploadedBy
                    ? {
                        ...resource.uploadedBy,
                        _id: resource.uploadedBy._id.toString(),
                    }
                    : resource.uploadedBy,

            isVoted: votedIds.has(resource._id.toString()),
            isBookmarked: bookmarkedIds.has(resource._id.toString()),
        });
    }

    /* SORT INSIDE SECTIONS */

    for (let key in grouped) {
        grouped[
            key
        ].topResources.sort(
            (a: any, b: any) =>
                new Date(
                    b.createdAt
                ).getTime() -
                new Date(
                    a.createdAt
                ).getTime()
        );

        /* KEEP ONLY LATEST 3 */

        grouped[key].topResources =
            grouped[
                key
            ].topResources.slice(0, 3);
    }

    /* SORT SECTIONS */

    const result =
        Object.values(grouped).sort(
            (a: any, b: any) =>
                b.count - a.count
        );

    return (
        result
    );
}