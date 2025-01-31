"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Import Sonner

//style
import "./otp.scss";

//image
import logo from "@/images/logo.png";
import Image from "next/image";

export default function Page() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // 120 seconds (2 minutes)
  const [canResend, setCanResend] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const Useridd = Number(storedUserId);
    if (storedUserId) {
      setUserId(Useridd);
    }
  }, []);

  useEffect(() => {
    const phoneNumber = localStorage.getItem("phoneNumber");

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
        toast.error(errorData.title || "An error occurred!", {
          description: errorData.message || "OTP confirmation failed.",
        });
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
    <main className="bg-login1 w-fully h-fully bg-no-repeat">
      <div className="w-fully h-fully flex items-center justify-end box">
        <div className="w-40 ml-auto max-w-[420px]">
          <Image className="logo" src={logo} alt="logo" />
          <div className="flex flex-col items-start gap-10 w-full">
            <h1 className="text-34 font-semibold">OTP Verification</h1>
            <form
              onSubmit={submitOTP}
              className="flex flex-col items-start gap-6 w-full"
            >
              <div className="text-16">
                Enter OTP verification sent to{" "}
                <span>{formattedPhoneNumber}</span>
              </div>
              <div className="flex gap-5">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleBackspace(e, index)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="bg-mainGreen py-7 rounded-8 text-center font-bold text-white w-16 h-16"
                  />
                ))}
              </div>
              <span className="text-16">
                Enter the verification code we just sent to your email{" "}
                <span>{formatTime(timeLeft)}</span>
              </span>
              <button
                className="w-full bg-black text-white rounded-16 py-4"
                disabled={timeLeft === 0}
              >
                Verify
              </button>
              <div className="text-14 text-center w-full">
                Didn’t receive code?{" "}
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
