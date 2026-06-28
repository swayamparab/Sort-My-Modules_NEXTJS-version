import { connectDB } from "@/lib/db";
import { Resource } from "@/models/Resource";
import { User } from "@/models/User";
import { Vote } from "@/models/Vote";

export async function getSubjectResources(userId: string, subjectName: string) {
    await connectDB();

    const user = await User.findById(
            userId
        ).select(
            "branch semester bookmarks"
        );

    if (!user) {

        throw new Error("User not found")
    }

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
            }).lean();

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

    const finalResources = resources.map((resource) => ({
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

    isBookmarked: bookmarkedIds.has(
        resource._id.toString()
    ),
}));

    return finalResources;

}