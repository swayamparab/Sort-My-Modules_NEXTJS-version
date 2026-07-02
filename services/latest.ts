import { connectDB } from "@/lib/db";
import { redis } from "@/lib/redis";
import { Resource } from "@/models/Resource";
import { User } from "@/models/User";
import { Vote } from "@/models/Vote";

type LatestResource = {
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

export async function getLatestResources(
    userId: string
): Promise<LatestResource[]> {

    await connectDB();

    const cacheKey = `latest:${userId}`;

    const cachedLatest =
        await redis.get<LatestResource[]>(cacheKey);

    if (cachedLatest) {
        return cachedLatest;
    }

    const user = await User.findById(userId)
        .select("branch semester bookmarks");

    if (!user) {
        throw new Error("User not found");
    }

    /* RECENT RESOURCES */
    const resources = await Resource.find({
        branch: user.branch,
        semester: user.semester,
    })
        .populate("uploadedBy", "name")
        .sort({
            createdAt: -1,
        })
        .lean();

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
    const resourcesWithMeta: LatestResource[] =
        resources.map((resource) => ({
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
        }));

    await redis.set(cacheKey, resourcesWithMeta, {
        ex: 300,
    });

    return resourcesWithMeta;
}