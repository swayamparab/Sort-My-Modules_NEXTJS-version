"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import api from "@/lib/axios";

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

type ResourceCardProps = {
  resource: Resource;
};

export default function ResourceCard({
  resource,
}: ResourceCardProps) {

  const router = useRouter();

  const [isVoted, setIsVoted] =
    useState(resource.isVoted);

  const [isBookmarked, setIsBookmarked] =
    useState(resource.isBookmarked);

  const [votes, setVotes] =
    useState(resource.votes);

  const handleVote = async () => {

    try {

      const res = await api.patch(
        `/resources/${resource._id}/vote`
      );

      setIsVoted(res.data.isVoted);

      setVotes(res.data.votes);

      if (res.data.isVoted) {

        toast.success("Upvoted 👍");

      } else {

        toast("Vote removed");

      }

    } catch (err) {

      toast.error("Vote failed");

    }
  };

  const handleBookmark = async () => {

    try {

      const res = await api.patch(
        `/resources/${resource._id}/bookmark`
      );

      setIsBookmarked(
        res.data.isBookmarked
      );

      if (res.data.isBookmarked) {

        toast.success(
          "Saved to bookmarks"
        );

      } else {

        toast(
          "Removed from bookmarks"
        );

      }

    } catch (err) {

      toast.error("Bookmark failed");

    }
  };

  const handleView = () => {

    router.push(
      `/resource/${resource._id}`
    );

  };

  return (
    <div className="card resource-card">

      {/* BADGES */}

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

      {/* TITLE */}

      <h3
        style={{
          fontWeight: "600",
        }}
      >
        {resource.title}
      </h3>

      {/* FACULTY */}

      <p
        style={{
          fontSize: "0.9rem",
          opacity: 0.7,
        }}
      >
        Faculty: {resource.faculty}
      </p>

      {/* FOOTER */}

      <div className="card-footer">

        <div className="card-stats">

          <span
            onClick={handleVote}
            style={{
              cursor: "pointer",
              border: ".5px solid gray",
              borderRadius: "3px",
              padding: "5px",
            }}
          >
            {isVoted ? "👍" : "👍🏻"} {votes}
          </span>

          <span
            onClick={handleBookmark}
            style={{
              cursor: "pointer",
              border: ".5px solid gray",
              borderRadius: "3px",
              padding: "5px",
            }}
          >
            {isBookmarked
              ? "📑saved"
              : "🔖save"}
          </span>

        </div>

        <button
          className="btn btn-primary"
          onClick={handleView}
        >
          View
        </button>

      </div>

    </div>
  );
}