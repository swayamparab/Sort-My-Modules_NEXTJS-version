"use client";

import { useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import api from "@/lib/axios";

import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    branch: "",
    semester: "",
  });

  const [error, setError] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.SubmitEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    setSuccess("");

    const email = form.email.toLowerCase();

    if (form.name.length < 3) {
      return setError(
        "Name must be at least 3 characters"
      );
    }

    if (
      !email.endsWith(
        "@student.sfit.ac.in"
      )
    ) {
      return setError(
        "Use your college email (@student.sfit.ac.in)"
      );
    }

    const passwordRegex = /^.{6,}$/;

    if (
      !passwordRegex.test(form.password)
    ) {
      return setError(
        "Password must be at least 6 letters"
      );
    }

    try {
      setLoading(true);

      const res = await api.post(
        "/auth/signup",
        {
          ...form,
          email,
        }
      );

      setSuccess(res.data.message);

      toast.success(
        "Account created successfully!"
      );

      setForm({
        name: "",
        email: "",
        password: "",
        branch: "",
        semester: "",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "4rem auto",
      }}
    >
      <h2
        style={{
          marginBottom: "1.5rem",
        }}
      >
        Create Account
      </h2>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "0.6rem",
            borderRadius: "6px",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "0.7rem",
            borderRadius: "6px",
            marginBottom: "1rem",
          }}
        >
          {success}
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            className="input"
            name="email"
            placeholder="College Email"
            value={form.email}
            onChange={handleChange}
          />

          <p
            style={{
              fontSize: "0.8rem",
              opacity: 0.7,
            }}
          >
            Use your college email
            (@student.sfit.ac.in)
          </p>

          <div
            style={{
              position: "relative",
            }}
          >
            <input
              className="input"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />

            <span
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform:
                  "translateY(-50%)",
                cursor: "pointer",
                fontSize: "0.9rem",
                opacity: 0.7,
              }}
            >
              {showPassword
                ? "Hide"
                : "Show"}
            </span>
          </div>

          <p
            style={{
              fontSize: "0.8rem",
              opacity: 0.7,
            }}
          >
            Password must be at least
            6 characters
          </p>

          <select
            className="input"
            name="branch"
            value={form.branch}
            onChange={handleChange}
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

          <select
            className="input"
            name="semester"
            value={form.semester}
            onChange={handleChange}
          >
            <option value="">
              Select Semester
            </option>

            {[1, 2, 3, 4, 5, 6, 7, 8].map(
              (s) => (
                <option
                  key={s}
                  value={s}
                >
                  Semester {s}
                </option>
              )
            )}
          </select>

          <button
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: "100%",
            }}
          >
            {loading
              ? "Creating account..."
              : "Signup"}
          </button>
        </form>
      )}

      <p
        style={{
          marginTop: "1rem",
          textAlign: "center",
        }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          style={{
            color: "#4F46E5",
            fontWeight: "500",
          }}
        >
          Login
        </Link>
      </p>
    </div>
  );
}