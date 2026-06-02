"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

import api from "@/lib/axios";

import { useEffect, useRef, useState } from "react";

import logo from "@/assets/logo.png";

import toast from "react-hot-toast";

export default function Navbar() {
    const { user, setUser } = useAuth();
    const { darkMode, setDarkMode } = useTheme();

    const router = useRouter();
    const pathname = usePathname();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // Close drawer on route change
    useEffect(() => {
        setDrawerOpen(false);
        setDropdownOpen(false);
    }, [pathname]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");

            setUser(null);

            toast.success("Logged out");

            router.push("/login");
        } catch (err) {
            toast.error("Logout failed");
        }
    };

    return (
        <>
            {/* Overlay */}
            {drawerOpen && (
                <div
                    className="overlay"
                    onClick={() => setDrawerOpen(false)}
                />
            )}

            {/* Drawer */}
            <div className={`drawer ${drawerOpen ? "open" : ""}`}>
                <Link href="/">Home</Link>
                <Link href="/bookmarks">Bookmarks</Link>
                <Link href="/top-resources">Top Resources</Link>
                <Link href="/latest-resources">Latest Resources</Link>
                <Link href="/search">Search a Resource</Link>
                <Link href="/upload">Upload a Resource</Link>
            </div>

            <div className="navbar">
                <div className="navbar-inner">
                    {!user ? (
                        <>
                            <Image
                                src={logo}
                                alt=""
                                style={{
                                    width: "150px",
                                    height: "auto",
                                }}
                            />

                            <button
                                className="btn btn-outline"
                                onClick={() => setDarkMode(!darkMode)}
                            >
                                {darkMode ? "☀️ Light" : "🌙 Dark"}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Hamburger */}
                            <div
                                className="hamburger"
                                onClick={() => setDrawerOpen(true)}
                            >
                                ☰
                            </div>

                            {/* Center Logo */}
                            <Image
                                src={logo}
                                alt="Logo"
                                width={150}
                                height={50}
                                priority
                                style={{ cursor: "pointer" }}
                                onClick={() => router.push("/")}
                            />

                            {/* Account Section */}
                            <div
                                style={{ position: "relative" }}
                                ref={dropdownRef}
                            >
                                <div
                                    className="account-icon"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    👤
                                </div>

                                {dropdownOpen && (
                                    <div className="dropdown">
                                        <button
                                            className="btn btn-outline"
                                            onClick={() => router.push("/dashboard")}
                                        >
                                            Dashboard
                                        </button>

                                        <button
                                            className="btn btn-outline"
                                            onClick={() => setDarkMode(!darkMode)}
                                        >
                                            {darkMode ? "Light Mode" : "Dark Mode"}
                                        </button>

                                        <button
                                            className="btn btn-outline"
                                            onClick={handleLogout}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}