"use client";

import { useEffect, useState } from "react";

import api from "@/lib/axios";

import ResourceCard from "@/components/ResourceCard";

type Resource = {
    _id: string;
    title: string;
    subject: string;
    branch: string;
    semester: number;
    faculty: string;
    votes: number;
    isVoted: boolean;
    isBookmarked: boolean;
};

export default function BookmarksPage() {

    const [bookmarks, setBookmarks] =
        useState<Resource[]>([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        const getBookmarks = async () => {

            try {

                const res = await api.get(
                    "/resources/bookmarks"
                );

                setBookmarks(
                    res.data.bookmarks
                );

            } catch (err) {

                console.log(err);

            } finally {

                setLoading(false);

            }
        };

        getBookmarks();

    }, []);

    return (
        <>

            <h2
                style={{
                    marginBottom: "1.5rem"
                }}
            >
                My Bookmarks
            </h2>

            {loading && (
                <p>Loading...</p>
            )}

            {!loading &&
                bookmarks.length === 0 && (
                    <p>
                        You haven't bookmarked anything yet.
                    </p>
                )}

            {bookmarks.map((resource, index) => (

                <ResourceCard
                    key={resource._id}
                    resource={{
                        ...resource,
                        isBookmarked: true
                    }}
                />

            ))}

        </>
    );
}