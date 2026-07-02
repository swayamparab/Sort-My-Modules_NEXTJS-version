import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { redis } from "@/lib/redis";
import { Resource } from "@/models/Resource";
import { Vote } from "@/models/Vote";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params, }: { params: Promise<{ resourceId: string; }>; }) {
    try {
        await connectDB();

        const userId = await getUserFromToken();

        if (!userId) {
            return NextResponse.json(
                {
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const { resourceId } = await params;

        const existingVote = await Vote.findOne({
            user: userId,
            resource: resourceId,
        });

        let isVoted;

        if (existingVote) {
            await existingVote.deleteOne();

            await Resource.findByIdAndUpdate(
                resourceId,
                {
                    $inc: { votes: -1 },
                }
            );

            isVoted = false;
        } else {
            await Vote.create({
                user: userId,
                resource: resourceId,
            });

            await Resource.findByIdAndUpdate(
                resourceId,
                {
                    $inc: { votes: 1 },
                }
            );

            isVoted = true;
        }

        const updatedResource = await Resource.findById(
            resourceId
        ).select("votes");

        await Promise.all([
            redis.del(`home:${userId}`),
            redis.del(`latest:${userId}`),
        ]);

        return NextResponse.json(
            {
                message: isVoted
                    ? "Vote added"
                    : "Vote removed",

                isVoted,

                votes:
                    updatedResource?.votes ||
                    0,
            },
            { status: 200 }
        );
    } catch (err: any) {
        return NextResponse.json(
            {
                message: err.message,
            },
            { status: 500 }
        );
    }
}