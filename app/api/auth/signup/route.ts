import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signupRateLimit } from "@/lib/redis";

//signup new user
export async function POST(request: Request) {
  try {

    const body = await request.json();

    const {
      name,
      email,
      password,
      semester,
      branch,
    } = body;

    // Basic validation
    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        {
          message: "Name must be at least 3 characters",
        },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    if (!semester || !branch) {
      return NextResponse.json(
        {
          message: "Semester and branch are required",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          message: "Password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      !normalizedEmail.endsWith(
        "@student.sfit.ac.in"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Only @student.sfit.ac.in emails allowed",
        },
        { status: 400 }
      );
    }

    //get IP
    const ip = request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      .trim() ?? "unknown";

    // Rate limiting
    const ipLimit = await signupRateLimit.limit(
      `smm:signup:${ip}`
    );

    const emailLimit = await signupRateLimit.limit(
      `smm:signup-email:${normalizedEmail}`
    );

    if (!ipLimit.success || !emailLimit.success) {
      return NextResponse.json(
        {
          message: "Too many signup attempts. Please try again later.",
        },
        { status: 429 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "Email already exists",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      semester,
      branch,
      isVerified: false,
    });

    const response = NextResponse.json(
      {
        message:
          "Please verify account through admin (swayam) to complete Signup",
      },
      { status: 201 }
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