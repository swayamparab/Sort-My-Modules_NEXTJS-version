import { connectDB } from "@/lib/db";
import { Resource } from "@/models/Resource";
import { User } from "@/models/User";
import { Vote } from "@/models/Vote";

export async function getLatestResources(userId: string) {

    await connectDB();

    const user = await User.findById(userId)
        .select(
            "branch semester bookmarks"
        );

    if (!user) {
        throw new Error("User not found")
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
        }).lean();

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
    const resourcesWithMeta = resources.map((resource) => ({
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

        isVoted: votedResourceIds.has(resource._id.toString()),
        isBookmarked: bookmarkedResourceIds.has(
            resource._id.toString()
        ),
    }));

    return (
        resourcesWithMeta
    );
}