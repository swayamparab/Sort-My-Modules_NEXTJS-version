import { connectDB } from "@/lib/db";
import { Resource } from "@/models/Resource";
import { User } from "@/models/User";
import { Vote } from "@/models/Vote";

export async function getTopResources(userId: string) {
    await connectDB();

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
        userVotes.map((vote) => vote.resource.toString())
    );

    const bookmarkedResourceIds = new Set(
        user.bookmarks.map((id: any) => id.toString())
    );

    return resources.map((resource) => ({
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
}