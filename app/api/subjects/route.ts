import { connectDB } from "@/lib/db";
import { Resource } from "@/models/Resource";
import { NextResponse } from "next/server";

//subjects for drop down while uploading
export async function GET(
  request: Request
) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const branch =
      searchParams.get("branch");

    const semester =
      searchParams.get("semester");

    if (!branch || !semester) {
      return NextResponse.json(
        {
          message:
            "Branch and semester required",
        },
        { status: 400 }
      );
    }

    const subjects =
      await Resource.aggregate([
        {
          $match: {
            branch,
            semester,
          },
        },

        {
          $group: {
            _id: "$subjectKey",

            subject: {
              $first: "$subject",
            },

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },

        {
          $limit: 20,
        },

        {
          $project: {
            _id: 0,
            subject: 1,
          },
        },
      ]);

    return NextResponse.json(
      subjects,
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