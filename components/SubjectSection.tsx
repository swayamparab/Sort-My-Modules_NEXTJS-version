"use client";

import Link from "next/link";

import ResourceCard from "./ResourceCard";

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

type SubjectData = {
  subject: string;
  topResources: Resource[];
};

type SubjectSectionProps = {
  subjectData: SubjectData;
};

export default function SubjectSection({
  subjectData,
}: SubjectSectionProps) {
  return (
    <div
      style={{
        marginBottom: "2.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2>{subjectData.subject}</h2>

        <Link
          href={`/subject/${encodeURIComponent(subjectData.subject)}`}
          style={{
            fontSize: "13px",
            fontWeight: "600",
            textDecoration: "none",
            padding: "6px 16px",
            borderRadius: "999px",
            backgroundColor: "#ffffff10",
            color: "white",
            backdropFilter: "blur(6px)",
            border:
              "1px solid rgba(255,255,255,0.2)",
            transition: "0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              "#ffffff20";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              "#ffffff10";
          }}
        >
          View All
        </Link>
      </div>

      {subjectData.topResources.map(
        (res, index) => (
          <ResourceCard
            key={res._id}
            resource={res}
          />
        )
      )}
    </div>
  );
}