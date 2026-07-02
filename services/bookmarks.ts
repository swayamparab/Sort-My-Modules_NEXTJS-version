import { connectDB } from "@/lib/db";
import { redis } from "@/lib/redis";
import { Resource } from "@/models/Resource";
import { User } from "@/models/User";

type BookmarkedResource = {
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
};

type BookmarksResponse = {
    bookmarks: BookmarkedResource[];
};

export async function getBookmarkedResources(
    userId: string
): Promise<BookmarksResponse> {
    await connectDB();

    const cacheKey = `bookmarks:${userId}`;

    const cachedBookmarks =
        await redis.get<BookmarksResponse>(cacheKey);

    if (cachedBookmarks) {
        console.log(
            `🟢 [Redis] BOOKMARKS Cache HIT | User: ${userId}`
        );

        return cachedBookmarks;
    }

    console.log(
        `🔴 [Redis] BOOKMARKS Cache MISS | User: ${userId}`
    );

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const bookmarks = await Resource.find({
        _id: {
            $in: user.bookmarks,
        },
    })
        .populate("uploadedBy", "name")
        .lean();

    const result: BookmarksResponse = {
        bookmarks: bookmarks.map((bookmark) => ({
            ...bookmark,
            _id: bookmark._id.toString(),
            uploadedBy: bookmark.uploadedBy
                ? {
                      ...bookmark.uploadedBy,
                      _id: bookmark.uploadedBy._id.toString(),
                  }
                : null,
        })),
    };

    await redis.set(cacheKey, result, {
        ex: 300,
    });

    console.log(
        `🔵 [Redis] BOOKMARKS Cache SET | User: ${userId}`
    );

    return result;
}