"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const { user, loading } = useAuth();

    const router = useRouter();

    useEffect(() => {

        if (!loading && !user) {

            router.replace("/login");

        }

    }, [user, loading, router]);

    if (loading) {

        return <p>Loading...</p>;

    }

    if (!user) {

        return null;

    }

    return children;
}