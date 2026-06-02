"use client";

import {
    useState,
    useEffect,
    useCallback
} from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import api from "@/lib/axios";

type Subject = {
    subject: string;
};

export default function UploadPage() {

    const router = useRouter();

    /* ===============================
       STATES
    ================================= */

    const [branch, setBranch] = useState("");

    const [semester, setSemester] =
        useState("");

    const [subjects, setSubjects] =
        useState<Subject[]>([]);

    const [selectedSubject, setSelectedSubject] =
        useState("");

    const [customSubject, setCustomSubject] =
        useState("");

    const [title, setTitle] = useState("");

    const [faculty, setFaculty] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [pdf, setPdf] =
        useState<File | null>(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [fileError, setFileError] =
        useState("");

    /* ===============================
       FETCH SUBJECTS
    ================================= */

    const fetchSubjects = useCallback(async () => {

        if (!branch || !semester) return;

        try {

            const res = await api.get(
                `/subjects?branch=${branch}&semester=${semester}`
            );

            setSubjects(res.data);

        } catch (err) {

            console.log(
                "Failed to fetch subjects"
            );

        }

    }, [branch, semester]);

    useEffect(() => {

        fetchSubjects();

    }, [fetchSubjects]);

    /* ===============================
       FILE HANDLING
    ================================= */

    const MAX_SIZE =
        20 * 1024 * 1024;

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file =
            e.target.files?.[0];

        if (!file) return;

        if (file.size > MAX_SIZE) {

            setFileError(
                "File must be smaller than 20MB"
            );

            toast.error(
                "File must be smaller than 20MB"
            );

            setPdf(null);

            return;
        }

        if (
            file.type !==
            "application/pdf"
        ) {

            setFileError(
                "Only PDF files are allowed"
            );

            toast.error(
                "Only PDF files are allowed"
            );

            setPdf(null);

            return;
        }

        setPdf(file);

        setFileError("");

    };

    /* ===============================
       SUBMIT
    ================================= */

    const handleSubmit = async (
        e: React.SubmitEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        setError("");

        if (!branch || !semester) {

            return setError(
                "Please select branch and semester."
            );

        }

        if (!pdf) {

            return setError(
                "Please upload a PDF file."
            );

        }

        const finalSubject =
            selectedSubject === "other"
                ? customSubject.trim()
                : selectedSubject;

        if (!finalSubject) {

            return setError(
                "Please select or enter a subject."
            );

        }

        try {

            setLoading(true);

            const toastId =
                toast.loading(
                    "Uploading resource..."
                );

            const formData =
                new FormData();

            formData.append(
                "title",
                title
            );

            formData.append(
                "faculty",
                faculty
            );

            formData.append(
                "description",
                description
            );

            formData.append(
                "subject",
                finalSubject
            );

            formData.append(
                "branch",
                branch
            );

            formData.append(
                "semester",
                semester
            );

            formData.append(
                "file",
                pdf
            );

            await api.post(
                "/resources/upload",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            toast.success(
                "Resource uploaded successfully!",
                { id: toastId }
            );

            router.push("/home");

        } catch (err) {

            toast.error(
                "Upload failed. Please try again."
            );

            setError(
                "Upload failed. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div
            style={{
                maxWidth: "600px",
                margin: "auto"
            }}
        >

            <h2
                style={{
                    marginBottom: "1rem"
                }}
            >
                Upload Resource
            </h2>

            <div className="card">

                <form onSubmit={handleSubmit}>

                    {/* BRANCH */}

                    <select
                        className="input"
                        value={branch}
                        onChange={(e) =>
                            setBranch(
                                e.target.value
                            )
                        }
                        required
                    >
                        <option value="">
                            Select Branch
                        </option>

                        <option value="IT">
                            IT
                        </option>

                        <option value="CMPN">
                            CMPN
                        </option>

                        <option value="AIML">
                            AIML
                        </option>

                        <option value="ECS">
                            ECS
                        </option>

                        <option value="EXTC">
                            EXTC
                        </option>

                        <option value="MECH">
                            MECH
                        </option>

                    </select>

                    {/* SEMESTER */}

                    <select
                        className="input"
                        value={semester}
                        onChange={(e) =>
                            setSemester(
                                e.target.value
                            )
                        }
                        required
                    >
                        <option value="">
                            Select Semester
                        </option>

                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <option
                                key={sem}
                                value={sem}
                            >
                                Semester {sem}
                            </option>
                        ))}

                    </select>

                    {/* SUBJECT */}

                    <select
                        className="input"
                        value={selectedSubject}
                        onChange={(e) =>
                            setSelectedSubject(
                                e.target.value
                            )
                        }
                        required
                    >

                        <option value="">
                            Select Subject
                        </option>

                        {subjects.map((sub) => (
                            <option
                                key={sub.subject}
                                value={sub.subject}
                            >
                                {sub.subject}
                            </option>
                        ))}

                        <option value="other">
                            + Add New Subject
                        </option>

                    </select>

                    {/* CUSTOM SUBJECT */}

                    {selectedSubject === "other" && (

                        <input
                            className="input"
                            type="text"
                            placeholder="Enter new subject"
                            value={customSubject}
                            onChange={(e) =>
                                setCustomSubject(
                                    e.target.value
                                )
                            }
                            required
                        />

                    )}

                    {/* TITLE */}

                    <input
                        className="input"
                        type="text"
                        placeholder="Resource Title"
                        value={title}
                        onChange={(e) =>
                            setTitle(
                                e.target.value
                            )
                        }
                        required
                    />

                    {/* FACULTY */}

                    <input
                        className="input"
                        type="text"
                        placeholder="Faculty Name"
                        value={faculty}
                        onChange={(e) =>
                            setFaculty(
                                e.target.value
                            )
                        }
                        required
                    />

                    {/* DESCRIPTION */}

                    <textarea
                        className="input"
                        placeholder="Description"
                        rows={4}
                        value={description}
                        onChange={(e) =>
                            setDescription(
                                e.target.value
                            )
                        }
                        style={{
                            resize: "none"
                        }}
                    />

                    {/* FILE */}

                    <input
                        className="input"
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        required
                    />

                    {fileError && (

                        <p
                            style={{
                                color: "red",
                                fontSize: "0.85rem"
                            }}
                        >
                            {fileError}
                        </p>

                    )}

                    <button
                        className="btn btn-primary"
                        disabled={
                            loading ||
                            !!fileError ||
                            !pdf
                        }
                        style={{
                            width: "100%",
                            opacity:
                                loading ||
                                    fileError ||
                                    !pdf
                                    ? 0.6
                                    : 1,

                            cursor:
                                loading ||
                                    fileError ||
                                    !pdf
                                    ? "not-allowed"
                                    : "pointer"
                        }}
                    >
                        {loading
                            ? "Uploading..."
                            : "Upload"}
                    </button>

                </form>

                {error && (

                    <p
                        style={{
                            color: "red",
                            marginTop: "1rem"
                        }}
                    >
                        {error}
                    </p>

                )}

            </div>

        </div>
    );
}