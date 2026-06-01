import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

//update user info
export async function PATCH(request: Request) {
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

        const body = await request.json();
        const {semester, branch} = body;

        if(!semester || !branch){
            return NextResponse.json({
                message: "Semester and Branch are required"
            }, {status: 400})
        }

        const user = await User.findByIdAndUpdate(userId,
            {semester, branch},
            {new: true}
        ).select("name email semester branch")

        const response = NextResponse.json({
            message: "user updated successfully",
            user
        }, {status: 200})

        return response;
    }
    catch(err: any){
        return NextResponse.json({
            message: err.message
        }, {status: 500})
    }
}