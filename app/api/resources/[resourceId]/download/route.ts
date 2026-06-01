import { connectDB } from "@/lib/db";
import { Resource } from "@/models/Resource";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      resourceId: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { resourceId } =
      await params;

    const resource =
      await Resource.findById(
        resourceId
      );

    if (!resource) {
      return NextResponse.json(
        {
          message:
            "Resource not found",
        },
        { status: 404 }
      );
    }

    /* FETCH PDF */

    const response =
      await fetch(resource.pdfUrl);

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            "Failed to fetch PDF",
        },
        { status: 500 }
      );
    }

    /* CONVERT TO BLOB */

    const blob =
      await response.blob();

    /* RETURN FILE */

    return new Response(blob, {
      headers: {
        "Content-Type":
          "application/pdf",

        "Content-Disposition":
          `attachment; filename="${resource.title}.pdf"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        message: err.message,
      },
      { status: 500 }
    );
  }
}