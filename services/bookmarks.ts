import { connectDB } from "@/lib/db";
import { Resource } from "@/models/Resource";
import { User } from "@/models/User";

export async function getBookmarkedResources(userId: string) {
    await connectDB();

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found")
    }

    const bookmarks = await Resource.find({
        _id: {
            $in: user.bookmarks,
        },
    }).populate(
        "uploadedBy",
        "name"
    );

    return {
        bookmarks
    }
}