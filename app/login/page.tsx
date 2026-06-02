"use client";

import { useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import api from "@/lib/axios";

import { useAuth } from "@/context/AuthContext";

import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();

  const { setUser } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
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

    const email = form.email
      .trim()
      .toLowerCase();

    if (!email || !form.password) {
      return setError(
        "Email and password are required"
      );
    }

    if (
      !email.endsWith("@student.sfit.ac.in")
    ) {
      return setError(
        "Use your college email (@student.sfit.ac.in)"
      );
    }

    try {
      setLoading(true);

      const res = await api.post(
        "/auth/login",
        {
          email,
          password: form.password,
          rememberMe,
        }
      );

      setUser(res.data.user);

      toast.success("Login successful!");

      router.push("/home");
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Login failed. Try again.";

      setError(message);
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
          textAlign: "center",
        }}
      >
        Login
      </h2>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "0.7rem",
            borderRadius: "6px",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          className="input"
          name="email"
          placeholder="College Email"
          value={form.email}
          onChange={handleChange}
        />

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
              setShowPassword(!showPassword)
            }
            style={{
              position: "absolute",
              right: "12px",
              top: "35%",
              transform:
                "translateY(-50%)",
              cursor: "pointer",
              fontSize: "0.85rem",
              opacity: 0.7,
            }}
          >
            {showPassword
              ? "Hide"
              : "Show"}
          </span>
        </div>

        <label>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) =>
              setRememberMe(
                e.target.checked
              )
            }
          />{" "}
          Remember Me
        </label>

        <button
          className="btn btn-primary"
          disabled={
            loading ||
            !form.email ||
            !form.password
          }
          style={{
            width: "100%",
            marginTop: "1rem",
          }}
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>
      </form>

      <p
        style={{
          marginTop: "1rem",
          textAlign: "center",
        }}
      >
        Don't have an account?{" "}
        <Link
          href="/signup"
          style={{
            color: "#4F46E5",
            fontWeight: "500",
          }}
        >
          Signup
        </Link>
      </p>
    </div>
  );
}