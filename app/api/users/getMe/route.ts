import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        await connectDB();

        const userId = await getUserFromToken();

        if(!userId){
            return NextResponse.json({
                message: "Unauthorized: not logged in"
            }, {status: 401})
        }

        const user = await User.findById(userId).select("name email semester branch");

        if(!user){
            return NextResponse.json({
                message: "user not found"
            }, {status: 404})
        }

        const response = NextResponse.json({
            message: "User fetched",
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