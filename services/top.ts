import { connectDB } from "@/lib/db";
import { redis } from "@/lib/redis";
import { Resource } from "@/models/Resource";
import { User } from "@/models/User";
import { Vote } from "@/models/Vote";

type TopResource = {
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

export async function getTopResources(
    userId: string
): Promise<TopResource[]> {
    await connectDB();

    const cacheKey = `top:${userId}`;

    const cachedTop =
        await redis.get<TopResource[]>(cacheKey);

    if (cachedTop) {
        return cachedTop;
    }

    const user = await User.findById(userId).select(
        "branch semester bookmarks"
    );

    if (!user) {
        throw new Error("User not found");
    }

    const resources = await Resource.find({
        branch: user.branch,
        semester: user.semester,
    })
        .populate("uploadedBy", "name")
        .sort({
            votes: -1,
            title: 1,
        })
        .lean();

    const userVotes = await Vote.find({
        user: userId,
    });

    const votedResourceIds = new Set(
        userVotes.map((vote) =>
            vote.resource.toString()
        )
    );

    const bookmarkedResourceIds = new Set(
        user.bookmarks.map((id: any) =>
            id.toString()
        )
    );

    const result: TopResource[] = resources.map(
        (resource) => ({
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

            isVoted: votedResourceIds.has(
                resource._id.toString()
            ),

            isBookmarked:
                bookmarkedResourceIds.has(
                    resource._id.toString()
                ),
        })
    );

    await redis.set(cacheKey, result, {
        ex: 300,
    });

    return result;
}