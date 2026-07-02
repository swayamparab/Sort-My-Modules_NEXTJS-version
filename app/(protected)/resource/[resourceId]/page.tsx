"use client";

import {
    useEffect,
    useRef,
    useState
} from "react";

import { useParams } from "next/navigation";

import {
    Document,
    Page,
    pdfjs
} from "react-pdf";

import toast from "react-hot-toast";

import api from "@/lib/axios";

pdfjs.GlobalWorkerOptions.workerSrc =
    new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
    ).toString();

type Resource = {
    _id: string;
    title: string;
    subject: string;
    branch: string;
    semester: string;
    pdfUrl: string;
    views: number;
    votes: number;
    isVoted: boolean;
    isBookmarked: boolean;

    uploadedBy?: {
        name: string;
    };
};

export default function ResourceViewerPage() {

    const params = useParams();

    const resourceId =
        params.resourceId as string;

    const [resource, setResource] =
        useState<Resource | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [isVoted, setIsVoted] =
        useState(false);

    const [isBookmarked, setIsBookmarked] =
        useState(false);

    const [votes, setVotes] =
        useState(0);

    const [views, setViews] =
        useState(0);

    const [numPages, setNumPages] =
        useState<number | null>(null);

    const [scale, setScale] =
        useState(1);

    const [pageInput, setPageInput] =
        useState("");

    const [currentPage, setCurrentPage] =
        useState(1);

    const containerRef =
        useRef<HTMLDivElement | null>(null);

    const [containerWidth, setContainerWidth] =
        useState(0);

    const ticking =
        useRef(false);

    const onDocumentLoadSuccess = ({
        numPages,
    }: {
        numPages: number;
    }) => {

        setNumPages(numPages);

    };

    // fetch resource
    useEffect(() => {

        const fetchResource =
            async () => {

                try {

                    const res =
                        await api.get(
                            `/resources/${resourceId}`
                        );

                    setResource(
                        res.data
                    );

                    setIsVoted(
                        res.data.isVoted
                    );

                    setIsBookmarked(
                        res.data.isBookmarked
                    );

                    setVotes(
                        res.data.votes
                    );

                    setViews(
                        res.data.views
                    );

                } catch {

                    console.log(
                        "Failed to load resource"
                    );

                } finally {

                    setLoading(false);

                }
            };

        fetchResource();

    }, [resourceId]);

    // responsive pdf width
    useEffect(() => {

        const updateWidth = () => {

            if (containerRef.current) {

                setContainerWidth(
                    containerRef.current.offsetWidth
                );

            }
        };

        updateWidth();

        window.addEventListener(
            "resize",
            updateWidth
        );

        return () =>
            window.removeEventListener(
                "resize",
                updateWidth
            );

    }, []);

    //vote
    const handleVote = async () => {

        try {

            const res =
                await api.patch(
                    `/resources/${resourceId}/vote`
                );

            setIsVoted(
                res.data.isVoted
            );

            setVotes(
                res.data.votes
            );

        } catch {

            console.log(
                "Vote failed"
            );

        }
    };


    // bookmark
    const handleBookmark =
        async () => {

            try {

                const res =
                    await api.patch(
                        `/resources/${resourceId}/bookmark`
                    );

                setIsBookmarked(
                    res.data.isBookmarked
                );

            } catch {

                console.log(
                    "Bookmark failed"
                );

            }
        };

    // download
    const handleDownload =
        async () => {

            const toastId =
                toast.loading(
                    "Preparing download..."
                );

            try {

                const response =
                    await fetch(
                        `/api/resources/${resourceId}/download`,
                        {
                            credentials:
                                "include",
                        }
                    );

                if (
                    !response.ok
                ) {

                    throw new Error(
                        "Download failed"
                    );

                }

                const blob =
                    await response.blob();

                const url =
                    window.URL.createObjectURL(
                        blob
                    );

                const a =
                    document.createElement(
                        "a"
                    );

                a.href = url;

                a.download =
                    `${resource?.title}.pdf`;

                a.click();

                window.URL.revokeObjectURL(
                    url
                );

                toast.success(
                    "Download started",
                    {
                        id: toastId,
                    }
                );

            } catch {

                toast.error(
                    "Download failed",
                    {
                        id: toastId,
                    }
                );

            }
        };

    //zoom
    const zoomIn = () => {

        setScale((prev) =>
            Math.min(
                prev + 0.2,
                3
            )
        );

    };

    const zoomOut = () => {

        setScale((prev) =>
            Math.max(
                prev - 0.2,
                0.3
            )
        );

    };

    // page detection

    const handleScroll = () => {

        if (!ticking.current) {

            window.requestAnimationFrame(
                () => {

                    const pages =
                        document.querySelectorAll(
                            "[data-page]"
                        );

                    let visible = 1;

                    pages.forEach(
                        (page) => {

                            const rect =
                                page.getBoundingClientRect();

                            if (
                                rect.top <= 150 &&
                                rect.bottom >= 150
                            ) {

                                visible =
                                    Number(
                                        page.getAttribute(
                                            "data-page"
                                        )
                                    );
                            }
                        }
                    );

                    setCurrentPage(
                        visible
                    );

                    ticking.current =
                        false;
                }
            );

            ticking.current = true;
        }
    };

    
    if (loading) {

        return (
            <p>
                Loading resource...
            </p>
        );
    }

    if (!resource) {

        return (
            <p>
                Resource not found
            </p>
        );
    }

    return (
        <>

            {/* HEADER */}

            <div
                style={{
                    marginBottom:
                        "1.5rem"
                }}
            >

                <div className="badge-container">

                    <span className="badge badge-primary">
                        {resource.subject}
                    </span>

                    <span className="badge">
                        {resource.branch}
                    </span>

                    <span className="badge">
                        Sem {resource.semester}
                    </span>

                </div>

                <h2
                    style={{
                        marginTop:
                            "0.8rem"
                    }}
                >
                    {resource.title}
                </h2>

                <p
                    style={{
                        opacity: 0.7
                    }}
                >
                    Uploaded by{" "}
                    {
                        resource.uploadedBy
                            ?.name
                    }
                </p>

            </div>

            {/* ACTIONS */}

            <div
                style={{
                    display: "flex",
                    gap: "1rem",
                    marginBottom:
                        "1.5rem"
                }}
            >

                <span
                    style={{
                        cursor: "pointer"
                    }}
                    onClick={handleVote}
                >
                    {isVoted
                        ? "👍"
                        : "👍🏻"}{" "}
                    {votes}
                </span>

                <span
                    style={{
                        cursor: "pointer"
                    }}
                    onClick={
                        handleBookmark
                    }
                >
                    {isBookmarked
                        ? "📑saved"
                        : "🔖save"}
                </span>

            </div>

            {/* CONTROLS */}

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom:
                        "0.5rem"
                }}
            >

                <button
                    className="btn btn-primary"
                    onClick={
                        handleDownload
                    }
                >
                    ⬇ Download
                </button>

                <button
                    className="btn"
                    onClick={zoomOut}
                >
                    ➖ Zoom
                </button>

                <button
                    className="btn"
                    onClick={zoomIn}
                >
                    ➕ Zoom
                </button>

            </div>

            {/* PAGE CONTROLS */}

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom:
                        "1rem"
                }}
            >

                <input
                    type="number"
                    placeholder="Page"
                    value={pageInput}
                    onChange={(e) =>
                        setPageInput(
                            e.target.value
                        )
                    }
                    style={{
                        width: "70px"
                    }}
                />

                <button
                    className="btn"
                    onClick={() => {

                        const page =
                            Number(
                                pageInput
                            );

                        if (
                            !page ||
                            page < 1 ||
                            page >
                            (numPages || 1)
                        ) {

                            return;
                        }

                        const el =
                            document.querySelector(
                                `[data-page="${page}"]`
                            );

                        el?.scrollIntoView(
                            {
                                behavior:
                                    "smooth",
                            }
                        );

                        setPageInput(
                            ""
                        );
                    }}
                >
                    Go
                </button>

                <span
                    style={{
                        alignSelf:
                            "center",
                        fontWeight:
                            "500"
                    }}
                >
                    {numPages
                        ? `${numPages} pages`
                        : ""}
                </span>

            </div>

            {/* PDF VIEWER */}

            <div
                ref={containerRef}
                onScroll={handleScroll}
                style={{
                    height: "80vh",
                    overflowY:
                        "scroll",
                    display: "flex",
                    flexDirection:
                        "column",
                    alignItems:
                        "center",
                    border:
                        "1px solid var(--border)",
                    borderRadius:
                        "10px",
                    padding: "10px",
                    gap: "20px",
                }}
            >

                {/* PAGE INDICATOR */}

                <div
                    style={{
                        position:
                            "sticky",
                        top: "10px",
                        margin:
                            "0 auto",
                        width:
                            "fit-content",

                        padding:
                            "6px 14px",

                        borderRadius:
                            "999px",

                        fontSize:
                            "10px",

                        fontWeight:
                            "500",

                        letterSpacing:
                            "0.3px",

                        color:
                            "rgba(255,255,255,0.8)",

                        background:
                            "rgba(0, 0, 0, 0.28)",

                        backdropFilter:
                            "blur(8px)",

                        WebkitBackdropFilter:
                            "blur(8px)",

                        border:
                            "1px solid rgba(255,255,255,0.12)",

                        boxShadow:
                            "0 2px 8px rgba(0,0,0,0.2)",

                        zIndex: 10,

                        textAlign:
                            "center",
                    }}
                >
                    Page {currentPage} /{" "}
                    {numPages}
                </div>

                <Document
                    file={
                        resource.pdfUrl
                    }
                    onLoadSuccess={
                        onDocumentLoadSuccess
                    }
                    onLoadError={(
                        error:Error
                    ) => {

                        console.error(
                            "PDF failed to load:",
                            error
                        );

                    }}
                    loading={
                        <p>
                            Loading PDF...
                        </p>
                    }
                >

                    {Array.from(
                        new Array(
                            numPages
                        ),
                        (_, index) => (
                            <div
                                key={
                                    index + 1
                                }
                                data-page={
                                    index + 1
                                }
                            >

                                <Page
                                    pageNumber={
                                        index + 1
                                    }
                                    width={
                                        containerWidth
                                    }
                                    scale={scale}
                                    renderTextLayer={
                                        false
                                    }
                                    renderAnnotationLayer={
                                        false
                                    }
                                />

                            </div>
                        )
                    )}

                </Document>

            </div>

        </>
    );
}