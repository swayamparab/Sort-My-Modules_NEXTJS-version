"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import api from "@/lib/axios";

type User = {
    name: string;
    email: string;
    branch: string;
    semester: string;
};

type Stats = {
    totalUploads: number;
    totalViews: number;
    totalVotes: number;
    totalBookmarks: number;
};

type Upload = {
    _id: string;
    title: string;
    subject: string;
    branch: string;
    semester: number;
    votes: number;
};

type DashboardData = {
    user: User;
    stats: Stats;
    myUploads: Upload[];
};

type DashboardClientProps = {
    initialData: DashboardData;
};

export default function DashboardClient({
    initialData
}: DashboardClientProps) {

    const router = useRouter();

    const [data, setData] = useState(initialData);

    const [semester, setSemester] = useState(
        initialData.user.semester
    );

    const [branch, setBranch] = useState(
        initialData.user.branch
    );

    /* ===============================
       Delete Upload
    ================================= */

    const handleDelete = async (resourceId: string) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this resource?"
        );

        if (!confirmDelete) return;

        try {

            await api.delete(`/resources/${resourceId}`);

            setData((prev) => {

                if (!prev) return prev;

                const updatedUploads = prev.myUploads.filter(
                    (item) => item._id !== resourceId
                );

                return {
                    ...prev,

                    myUploads: updatedUploads,

                    stats: {
                        ...prev.stats,

                        totalUploads:
                            prev.stats.totalUploads - 1
                    }
                };
            });

            toast.success("Resource deleted");

        } catch (err) {

            toast.error("Delete failed");

        }
    };

    /* ===============================
       Update User
    ================================= */

    const updateUserInfo = async () => {

        try {

            const res = await api.patch(
                "/users/update",
                {
                    semester,
                    branch
                }
            );

            setData((prev) => {

                if (!prev) return prev;

                return {
                    ...prev,
                    user: res.data.user
                };
            });

            toast.success("User info updated!");

        } catch (err) {

            toast.error("Update Failed!");

        }
    };

    const disabled =
        data &&
        semester === data.user.semester &&
        branch === data.user.branch;

    /* ===============================
       Loading / Error
    ================================= */

    if (!data) {
        return null;
    }

    return (
        <>

            {/* ===============================
               USER PROFILE
            ================================= */}

            <div
                className="card"
                style={{ marginBottom: "2rem" }}
            >

                <h2 style={{ marginBottom: "0.5rem" }}>
                    {data.user.name}
                </h2>

                <p style={{ opacity: 0.8 }}>
                    {data.user.email}
                </p>

                <div
                    style={{
                        marginTop: "1rem",
                        display: "flex",
                        gap: "0.75rem",
                        flexWrap: "wrap",
                        alignItems: "center"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column"
                        }}
                    >

                        <label
                            style={{
                                fontSize: "0.8rem",
                                opacity: 0.7
                            }}
                        >
                            Branch
                        </label>

                        <select
                            className="input"
                            value={branch}
                            onChange={(e) =>
                                setBranch(e.target.value)
                            }
                        >
                            <option value="">
                                Select Branch
                            </option>

                            <option value="IT">IT</option>
                            <option value="CMPN">CMPN</option>
                            <option value="AIML">AIML</option>
                            <option value="ECS">ECS</option>
                            <option value="EXTC">EXTC</option>
                            <option value="MECH">MECH</option>
                        </select>

                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column"
                        }}
                    >

                        <label
                            style={{
                                fontSize: "0.8rem",
                                opacity: 0.7
                            }}
                        >
                            Semester
                        </label>

                        <select
                            className="input"
                            value={semester}
                            onChange={(e) =>
                                setSemester(e.target.value)
                            }
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                <option
                                    key={sem}
                                    value={sem}
                                >
                                    Semester {sem}
                                </option>
                            ))}
                        </select>

                    </div>

                    <button
                        className="btn btn-outline"
                        style={{
                            height: "36px",
                            // marginTop: "18px"
                        }}
                        onClick={updateUserInfo}
                        disabled={!!disabled}
                    >
                        Update
                    </button>

                </div>

            </div>

            {/* ===============================
               STATS GRID
            ================================= */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "1rem",
                    marginBottom: "2rem"
                }}
            >

                <div className="card">
                    <h3>{data.stats.totalUploads}</h3>
                    <p>Total Uploads</p>
                </div>

                <div className="card">
                    <h3>{data.stats.totalViews}</h3>
                    <p>Total Views</p>
                </div>

                <div className="card">
                    <h3>{data.stats.totalVotes}</h3>
                    <p>Total Votes</p>
                </div>

                <div className="card">
                    <h3>{data.stats.totalBookmarks}</h3>
                    <p>Total Bookmarks</p>
                </div>

            </div>

            {/* ===============================
               MY UPLOADS
            ================================= */}

            <h3 style={{ marginBottom: "1rem" }}>
                My Uploads
            </h3>

            <button
                className="btn btn-outline"
                style={{ marginBottom: "1rem" }}
                onClick={() => {
                    router.push("/upload");
                }}
            >
                Upload a Resource
            </button>

            {data.myUploads.length === 0 && (
                <p style={{ marginBottom: "2rem" }}>
                    You haven't uploaded anything yet.
                </p>
            )}

            {data.myUploads.map((res) => (

                <div
                    key={res._id}
                    className="card"
                    style={{ marginBottom: "1rem" }}
                >

                    <h4>{res.title}</h4>

                    <p style={{ opacity: 0.7 }}>
                        {res.subject} • {res.branch} • Sem {res.semester}
                    </p>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "1rem",
                            flexWrap: "wrap",
                            gap: "0.5rem"
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                gap: "1rem"
                            }}
                        >
                            <span>
                                👍 {res.votes}
                            </span>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: "0.5rem"
                            }}
                        >

                            <button
                                className="btn btn-outline"
                                onClick={() =>
                                    router.push(
                                        `/resource/${res._id}`
                                    )
                                }
                            >
                                View
                            </button>

                            <button
                                className="btn btn-outline"
                                style={{
                                    borderColor: "red",
                                    color: "red"
                                }}
                                onClick={() =>
                                    handleDelete(res._id)
                                }
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>

            ))}

        </>
    );
}