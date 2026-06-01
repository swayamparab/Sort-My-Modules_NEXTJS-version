import { NextResponse } from "next/server";

//logout user
export async function POST(request: Request) {

    try {

        const response = NextResponse.json({
            message: "user logged out successfully"
        }, { status: 200 })

        response.cookies.set("token", "", {
            httpOnly: true,
            expires: new Date(0),
            path: "/"
        });

        return response;
    }
    catch (err: any) {
        return NextResponse.json({
            message: err.message
        }, { status: 500 })
    }
};