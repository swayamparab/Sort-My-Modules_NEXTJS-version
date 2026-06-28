import { connectDB } from "@/lib/db";
import { Resource } from "@/models/Resource";
import { User } from "@/models/User";

export async function getDashboardData(userId: string) {
    await connectDB();

    const user = await User.findById(userId)
        .select(
            "name email branch semester bookmarks"
        );

    if (!user) {
        throw new Error("User not found")
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

    return {
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
    }
}