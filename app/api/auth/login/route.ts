import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { loginRateLimit } from "@/lib/redis";

//login user
export async function POST(request: Request) {
    try {


        const body = await request.json();
        const { email, password, rememberMe } = body;

        if (!email || !password) {
            return NextResponse.json({
                message: "Email and password are required",
            }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase();

        if (!normalizedEmail.endsWith("@student.sfit.ac.in")) {
            return NextResponse.json({
                message: "Use your college email (@student.sfit.ac.in)",
            }, { status: 400 });
        }

        //get IP
        const ip = request.headers
            .get("x-forwarded-for")
            ?.split(",")[0]
            .trim() ?? "unknown";

        // Rate limiting
        const ipLimit = await loginRateLimit.limit(
            `smm:login:${ip}`
        );

        const emailLimit = await loginRateLimit.limit(
            `smm:login-email:${normalizedEmail}`
        );

        if (!ipLimit.success || !emailLimit.success) {
            return NextResponse.json(
                {
                    message: "Too many login attempts. Please try again later.",
                },
                { status: 429 }
            );
        }

        await connectDB();

        /* Check if user exists */
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return NextResponse.json({
                message: "User does not exist",
            }, { status: 400 });
        }

        if (!user.isVerified) {
            return NextResponse.json({
                message: "Login error! Please verify your email through admin (swayam) before logging in"
            }, { status: 403 });
        }

        /* Verify password */
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return NextResponse.json({
                message: "Wrong password",
            }, { status: 400 });
        }

        /* Create JWT token */
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET!,
            { expiresIn: rememberMe ? "7d" : "1d" }
        );

        /* Response */
        const response = NextResponse.json({
            message: "User logged in successfully",
            token,
            user: {
                name: user.name,
                email: user.email,
                semester: user.semester,
                branch: user.branch,
            },
        }, { status: 200 });

        /* Set cookie */
        response.cookies.set("token", token, {
            httpOnly: true,
            secure:
                process.env.NODE_ENV ===
                "production",
            sameSite:
                process.env.NODE_ENV ===
                    "production"
                    ? "none"
                    : "lax",
            maxAge: rememberMe
                ? 7 * 24 * 60 * 60
                : 24 * 60 * 60,
            path: "/",
        });

        return response;

    } catch (err: any) {
        return NextResponse.json({
            message: err.message,
        }, { status: 500 });
    }
};