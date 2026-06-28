import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { Resource } from "@/models/Resource";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

//replaced by service getBookmarkedResources
export async function GET() {
    try {
        await connectDB();

        const userId = await getUserFromToken();

        console.log(
            "USER ID:",
            userId
        );

        if (!userId) {
            return NextResponse.json(
                {
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const user = await User.findById(userId);

        console.log(
            "USER FOUND:",
            user
        );

        if (!user) {
            return NextResponse.json(
                {
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        const bookmarks = await Resource.find({
            _id: {
                $in: user.bookmarks,
            },
        }).populate(
            "uploadedBy",
            "name"
        );

        console.log(
            "BOOKMARKS:",
            bookmarks
        );

        return NextResponse.json(
            {
                bookmarks,
            },
            { status: 200 }
        );
    } catch (err: any) {
        console.error(
            "FULL ERROR:",
            err
        );

        return NextResponse.json(
            {
                message: err.message,
            },
            { status: 500 }
        );
    }
}