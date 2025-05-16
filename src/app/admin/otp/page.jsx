"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { getUserId, getPhoneNumber } from "@/authtoken/auth";
//style
import "./otp.scss";

//images
import logo from "@/images/logo.png";
import overlayImage from "@/images/overlay.png"; // Import the same overlay image as login page

export default function Page() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // 120 seconds (2 minutes)
  const [canResend, setCanResend] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = getUserId();
    const Useridd = Number(storedUserId);
    if (storedUserId) {
      setUserId(Useridd);
    }
  }, []);

  useEffect(() => {
    const phoneNumber = getPhoneNumber();

    if (phoneNumber) {
      const firstTwoDigits = phoneNumber.substring(0, 2);
      const remainingDigits = phoneNumber.slice(2);
      const formattedRemainingDigits = `${remainingDigits.slice(
        0,
        3
      )}-${remainingDigits.slice(3, 5)}-${remainingDigits.slice(5, 7)}`;
      const modifiedPhoneNumber = `+994 (${firstTwoDigits}) ${formattedRemainingDigits}`;
      setFormattedPhoneNumber(modifiedPhoneNumber);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer); // Stop timer when it reaches 0
          setCanResend(true); // Enable Resend button
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup timer on component unmount
  }, []);

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  async function submitOTP(e) {
    e.preventDefault();
    const otpToken = otp.join("");

    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/AdminApplicationUser/OtpConfirmationForLogin",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ otpToken, userId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error("OTP confirmation failed. ");
        console.error("Server Error:", errorData);
        return;
      }

      const data = await response.json();

      if (data.jwtToken && data.refreshToken && data.userId) {
        localStorage.setItem("jwtToken", data.jwtToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("userId", data.userId);

        document.cookie = `jwtToken=${data.jwtToken}; path=/;`;
        document.cookie = `refreshToken=${data.refreshToken}; path=/;`;
        document.cookie = `userId=${data.userId}; path=/;`;

        toast.success("OTP verified successfully! Redirecting...");
        router.push("/admin/dashboard");
      } else {
        toast.error(data.message || "OTP confirmation failed.");
      }
    } catch (error) {
      toast.error("Network Error: " + error.message);
      console.error("Network Error:", error);
    }
  }

  async function resendOTP() {
    if (!canResend) return;

    try {
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/AdminApplicationUser/ResendOTP",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to resend OTP.");
        console.error("Resend OTP Error:", errorData);
        return;
      }

      toast.success("OTP resent successfully!");
      setTimeLeft(120); // Reset timer to 2 minutes
      setCanResend(false); // Disable Resend button
    } catch (error) {
      toast.error("Network Error: " + error.message);
      console.error("Network Error:", error);
    }
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <main className="bg-login1 w-fully h-fully bg-no-repeat relative overflow-hidden">
      {/* Overlay Image - same as login page */}
      {/* <div className="absolute inset-0 z-10">
        <Image src={overlayImage} alt="Overlay" priority />
      </div> */}

      <div className="w-full h-fully flex items-center justify-end box relative z-20">
        <div className="w-40 ml-auto max-w-[420px]">
          <Image className="logo" src={logo} alt="logo" />
          <div className="flex flex-col items-center gap-8 w-full">
            <h1 className="text-2xl font-semibold">OTP Verification</h1>
            <form
              onSubmit={submitOTP}
              className="flex flex-col items-center gap-6 w-full"
            >
              <div className="text-base font-medium">
                Enter OTP verification sent to{" "}
                <span className="font-semibold">{formattedPhoneNumber}</span>
              </div>
              <div className="flex gap-5 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleBackspace(e, index)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="py-7 rounded-md text-center  text-black w-16 h-16 text-2xl bg-gray-100 border-1 border-gray-400 transition-all focus:border-[#01DBC8] focus:bg-white"
                    style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 text-16 text-gray-600">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 4V8L10.5 10.5M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z"
                    stroke="#4B5565"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>
                  Time remaining:{" "}
                  <span className="font-semibold">{formatTime(timeLeft)}</span>
                </span>
              </div>
              <button
                className="w-full bg-black text-white rounded-16 py-4 hover:bg-gray-800 transition-colors mt-4 font-medium"
                disabled={otp.join("").length !== 4}
              >
                Verify
              </button>
              <div className="text-14 text-center w-full">
                Didn't receive code?{" "}
                <span
                  className={`text-mainBlue cursor-pointer ${
                    !canResend ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={resendOTP}
                >
                  Resend
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
