"use client";

import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

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

export default function SearchPage() {

    const searchParams =
        useSearchParams();

    const initialQuery =
        searchParams.get("q") || "";

    const [query, setQuery] =
        useState(initialQuery);

    const [results, setResults] =
        useState<Resource[]>([]);

    const [loading, setLoading] =
        useState(false);

    /* ===============================
       Live Search with Debounce
    ================================= */

    useEffect(() => {

        const delayDebounce =
            setTimeout(() => {

                if (!query.trim()) {

                    setResults([]);

                    return;

                }

                const fetchResults =
                    async () => {

                        try {

                            setLoading(true);

                            const res =
                                await api.get(
                                    `/resources/search?q=${query}`
                                );

                            setResults(
                                res.data.resources ||
                                res.data
                            );

                        } catch (err) {

                            console.log(
                                "Search failed"
                            );

                        } finally {

                            setLoading(false);

                        }
                    };

                fetchResults();

            }, 400);

        return () =>
            clearTimeout(delayDebounce);

    }, [query]);

    return (
        <>

            <h1
                style={{
                    marginBottom: "1rem"
                }}
            >
                Search Resources
            </h1>

            {/* SEARCH BAR */}

            <div
                style={{
                    margin:
                        "0 auto 2rem",
                }}
            >

                <input
                    className="input"
                    type="text"
                    placeholder="Search notes, subjects..."
                    value={query}
                    onChange={(e) =>
                        setQuery(
                            e.target.value
                        )
                    }
                />

            </div>

            {/* RESULTS */}

            {loading && (
                <p>Searching...</p>
            )}

            {!loading &&
                query &&
                results.length === 0 && (
                    <p>
                        No resources found.
                    </p>
                )}

            {results.map((resource) => (

                <ResourceCard
                    key={resource._id}
                    resource={resource}
                />

            ))}

        </>
    );
}