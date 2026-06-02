"use client";

import { useEffect, useState } from "react";

import api from "@/lib/axios";

import SubjectSection from "@/components/SubjectSection";

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

type Subject = {
  subject: string;
  topResources: Resource[];
};

export default function HomePage() {
  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const res = await api.get(
          "/home"
        );

        setSubjects(res.data);
      } catch (err) {
        console.log(
          "error in home page"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHome();
  }, []);

  return (
    <>
      {loading && <p>Loading...</p>}

      {!loading &&
        subjects.length === 0 && (
          <p>
            No resources available yet.
          </p>
        )}

      {subjects.map((subject) => (
        <SubjectSection
          key={subject.subject}
          subjectData={subject}
        />
      ))}
    </>
  );
}