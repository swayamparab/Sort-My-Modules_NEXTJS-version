"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import api from "@/lib/axios";

import ResourceCard from "@/components/ResourceCard";

type Resource = {
    _id: string;
    title: string;
    subject: string;
    branch: string;
    semester: string;
    faculty: string;
    votes: number;
    isVoted: boolean;
    isBookmarked: boolean;
};

export default function SubjectPage() {

    const params = useParams();

    const subjectName =
        params.subjectName as string;

    const [resources, setResources] =
        useState<Resource[]>([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        const fetchResources =
            async () => {

                try {

                    const res = await api.get(
                        `/resources/subject/${encodeURIComponent(subjectName)}`
                    );

                    setResources(
                        res.data.resources
                    );

                } catch (err) {

                    console.log(err);

                } finally {

                    setLoading(false);

                }
            };

        fetchResources();

    }, [subjectName]);

    return (
        <>

            <h1
                style={{
                    marginBottom: "2rem"
                }}
            >
                {decodeURIComponent(subjectName)} Resources
            </h1>

            {loading && (
                <p>Loading...</p>
            )}

            {!loading &&
                resources.length === 0 && (
                    <p>
                        No resources available
                    </p>
                )}

            {resources.map((resource) => (

                <ResourceCard
                    key={resource._id}
                    resource={resource}
                />

            ))}

        </>
    );
}