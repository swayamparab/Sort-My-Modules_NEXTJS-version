import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      name,
      email,
      password,
      semester,
      branch,
    } = body;

    const normalizedEmail = email.toLowerCase();

    if (!name || name.length < 3) {
      return NextResponse.json(
        {
          message: "Name must be at least 3 characters",
        },
        { status: 400 }
      );
    }

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

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      semester,
      branch,
      isVerified: false,
    });

    const verifyToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

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