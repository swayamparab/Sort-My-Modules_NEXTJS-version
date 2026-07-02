import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { imagekit } from "@/lib/imagekit";
import { Resource } from "@/models/Resource";
import { NextResponse } from "next/server";
import {redis} from "@/lib/redis"

//upload new resource
export async function POST(request: Request) {
    try {
        await connectDB();

        const userId = await getUserFromToken();

        if (!userId) {
            return NextResponse.json(
                {
                    message: "Unauthorized: Login first",
                },
                { status: 401 }
            );
        }

        const formData = await request.formData();

        const title = formData.get("title") as string;
        const subject = formData.get("subject") as string;
        const description = formData.get("description") as string;
        const faculty = formData.get("faculty") as string;
        const branch = formData.get("branch") as string;
        const semester = formData.get("semester") as string;
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                {
                    message: "PDF is required",
                },
                { status: 400 }
            );
        }

        const allowedBranches = [
            "CMPN",
            "IT",
            "ECS",
            "AIML",
            "EXTC",
            "MECH",
        ];

        const allowedSemesters = [
            1, 2, 3, 4, 5, 6, 7, 8,
        ];

        if (!allowedBranches.includes(branch)) {
            return NextResponse.json(
                {
                    message: "Invalid branch",
                },
                { status: 400 }
            );
        }

        if (!allowedSemesters.includes(Number(semester))) {
            return NextResponse.json(
                {
                    message: "Invalid semester",
                },
                { status: 400 }
            );
        }

        const cleanTitle = title.trim();

        const cleanSubject = subject.trim();

        if (!cleanSubject) {
            return NextResponse.json(
                {
                    message:
                        "Subject is required",
                },
                { status: 400 }
            );
        }

        const subjectKey = cleanSubject.toLowerCase().replace(/\s+/g, "");

        /* DUPLICATE CHECK */
        const existing =
            await Resource.findOne({
                title: cleanTitle,
                subjectKey,
                semester,
                branch,
                uploadedBy: userId,
            });

        if (existing) {
            return NextResponse.json(
                {
                    message: "You already uploaded this resource",
                },
                { status: 400 }
            );
        }

        /* FILE BUFFER */
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        /* IMAGEKIT UPLOAD */
        const uploaded = await imagekit.upload({
            file: buffer,
            fileName: file.name,
            folder:
                "/sort-my-modules/resources",
        });

        /* SAVE RESOURCE */
        const resource = await Resource.create({
            title: cleanTitle,
            subject: cleanSubject,
            subjectKey,
            description,
            faculty,
            branch,
            semester,
            pdfUrl: uploaded.url,
            fileId: uploaded.fileId,
            uploadedBy: userId,
        });

        await redis.del(`home:${userId}`)
        console.log("cache deleted")

        const response = NextResponse.json(
            {
                message: "Resource uploaded successfully!",
                resource,
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