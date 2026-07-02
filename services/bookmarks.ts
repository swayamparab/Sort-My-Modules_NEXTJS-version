import { connectDB } from "@/lib/db";
import { redis } from "@/lib/redis";
import { Resource } from "@/models/Resource";
import { User } from "@/models/User";

export async function getBookmarkedResources(userId: string) {
    await connectDB();

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found")
    }

    const cacheKey = `bookmarks:${userId}`;
    const cachedBookmarks = await redis.get(cacheKey);

    if(cachedBookmarks){
        return cachedBookmarks;
    }

    const bookmarks = await Resource.find({
        _id: {
            $in: user.bookmarks,
        },
    }).populate(
        "uploadedBy",
        "name"
    ).lean();

    const result = {
        bookmarks: bookmarks.map((bookmark) => ({
            ...bookmark,
            _id: bookmark._id.toString(),
            uploadedBy: bookmark.uploadedBy
                ? {
                    ...bookmark.uploadedBy,
                    _id: bookmark.uploadedBy._id.toString(),
                }
                : bookmark.uploadedBy,
        })),
    }

    await redis.set(cacheKey, result, {ex: 300});

    return result;
}