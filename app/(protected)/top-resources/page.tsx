"use client";

import { useEffect, useState } from "react";

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

export default function PersonalizedPage() {

    const [resources, setResources] =
        useState<Resource[]>([]);

    const [loading, setLoading] =
        useState(true);

    const fetchResources = async () => {

        try {

            const res = await api.get(
                "/resources/top-resources"
            );

            setResources(
                res.data.resources
            );

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        fetchResources();

    }, []);

    if (loading) {

        return (
            <p>
                Loading resources...
            </p>
        );
    }

    return (
        <>

            <h2
                style={{
                    marginBottom: "1rem"
                }}
            >
                Top Resources For You
            </h2>

            {resources.map((resource) => (

                <ResourceCard
                    key={resource._id}
                    resource={resource}
                />

            ))}

        </>
    );
}