"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import logo from "@/images/logo.png";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Replace with your API call
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success("Password reset instructions sent to your email");
        router.push("/login");
      } else {
        setError("Email not found");
      }
    } catch (err) {
      setError("Something went wrong. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const ErrorMessage = ({ error }) =>
    error ? (
      <div className="w-full p-3 bg-[#FEF3F2] border border-[#FEE4E2] rounded-lg mt-3">
        <div className="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 6.458V10.8333M10 13.5417H10.0083M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z"
              stroke="#D92D20"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[#D92D20] text-sm font-medium">{error}</span>
        </div>
      </div>
    ) : null;

  return (
    <main className="bg-login1 w-fully h-fully bg-no-repeat">
      <div className="w-full h-fully flex items-center justify-end box">
        <div className="w-40 ml-auto max-w-[420px]">
          <Image className="logo" src={logo} alt="logo" />
          <div className="flex flex-col items-start gap-10 w-full">
            <div>
              <h1 className="text-34 font-semibold">Forgot Password?</h1>
              <p className="text-mainGray2 text-14 mt-2">
                Enter your email to reset your password
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-start gap-6 w-full"
            >
              <div className="flex flex-col items-start gap-3 w-full">
                <span className="text-14 font-medium">
                  Email <span className="text-mainRed">*</span>
                </span>
                <div className="flex justify-start items-center gap-2 w-full border-2 border-mainGray1 py-4 px-6 rounded-8">
                  <span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.333 4L7.333 8L13.333 4M2.667 2H12C12.736 2 13.333 2.597 13.333 3.333V12.667C13.333 13.403 12.736 14 12 14H2.667C1.93 14 1.333 13.403 1.333 12.667V3.333C1.333 2.597 1.93 2 2.667 2Z"
                        stroke="#4B5565"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <ErrorMessage error={error} />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white rounded-16 py-4 mt-4"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin/login")}
                className="w-full bg-transparent border-2 border-black text-black rounded-16 py-4"
              >
                Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
