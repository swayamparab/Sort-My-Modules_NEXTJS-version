import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { Resource } from "@/models/Resource";
import { User } from "@/models/User";
import { Vote } from "@/models/Vote";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const userId =
      await getUserFromToken();

    if (!userId) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const user =
      await User.findById(userId)
        .select(
          "branch semester bookmarks"
        );

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        { status: 404 }
      );
    }

    /* BOOKMARK IDS */

    const bookmarkedIds =
      new Set(
        user.bookmarks.map(
          (id: any) =>
            id.toString()
        )
      );

    /* USER VOTES */

    const userVotes =
      await Vote.find({
        user: userId,
      });

    const votedIds = new Set(
      userVotes.map((v) =>
        v.resource.toString()
      )
    );

    /* FETCH RESOURCES */

    const resources =
      await Resource.find({
        branch: user.branch,
        semester: user.semester,
      }).populate(
        "uploadedBy",
        "name"
      );

    /* GROUP RESOURCES */

    const grouped: any = {};

    for (let resource of resources) {
      const key =
        resource.subjectKey;

      if (!grouped[key]) {
        grouped[key] = {
          subject:
            resource.subject,

          count: 0,

          topResources: [],
        };
      }

      grouped[key].count++;

      grouped[key].topResources.push(
        {
          ...resource.toObject(),

          isVoted:
            votedIds.has(
              resource._id.toString()
            ),

          isBookmarked:
            bookmarkedIds.has(
              resource._id.toString()
            ),
        }
      );
    }

    /* SORT INSIDE SECTIONS */

    for (let key in grouped) {
      grouped[
        key
      ].topResources.sort(
        (a: any, b: any) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      );

      /* KEEP ONLY LATEST 3 */

      grouped[key].topResources =
        grouped[
          key
        ].topResources.slice(0, 3);
    }

    /* SORT SECTIONS */

    const result =
      Object.values(grouped).sort(
        (a: any, b: any) =>
          b.count - a.count
      );

    return NextResponse.json(
      result,
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