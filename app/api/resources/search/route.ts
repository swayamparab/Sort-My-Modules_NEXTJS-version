import { connectDB } from "@/lib/db";
import { Resource } from "@/models/Resource";
import { NextResponse } from "next/server";

//get resources based on subject/title name
export async function GET(request: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        const q = searchParams.get("q");

        if (!q) {
            return NextResponse.json(
                {
                    message:
                        "Search query is required",
                },
                { status: 400 }
            );
        }

        const resources = await Resource.find({
            $or: [
                {
                    title: {
                        $regex: q,
                        $options: "i",
                    },
                },

                {
                    subject: {
                        $regex: q,
                        $options: "i",
                    },
                },
            ],
        })
            .sort({
                votes: -1,
                views: -1,
            })
            .populate(
                "uploadedBy",
                "name"
            );

        const response = NextResponse.json(
            {
                resources,
            },
            { status: 200 }
        );

        return response;

    } catch (err: any) {
        return NextResponse.json(
            {
                message: err.message,
            },
            { status: 500 }
        );
    }
}