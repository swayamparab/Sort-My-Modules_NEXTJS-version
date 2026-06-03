"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
    const { user, loading } = useAuth();

    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace("/home");
            } else {
                router.replace("/login");
            }
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="w-14 h-14 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return null;
}