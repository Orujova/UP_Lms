"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { loginUser } from "@/redux/features/authSlice";

import "./login.scss";
import logo from "@/images/logo.png";

export default function Page() {
  const [inputType, setInputType] = useState("password");
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [brandingImages, setBrandingImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  // Fetch branding settings when component mounts
  useEffect(() => {
    fetchBrandingSettings();
  }, []);

  // Setup image slider if multiple images
  useEffect(() => {
    if (brandingImages.length > 1) {
      const interval = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentImageIndex((prevIndex) =>
            prevIndex === brandingImages.length - 1 ? 0 : prevIndex + 1
          );
          setIsTransitioning(false);
        }, 150);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [brandingImages]);

  const fetchBrandingSettings = async () => {
    try {
      const response = await fetch(
        "https://demoadmin.databyte.app/api/BrendingSetting?IsOTPAndLogin=true"
      );
      const data = await response.json();

      if (
        data &&
        data.length > 0 &&
        data[0].otpAndLoginImages &&
        data[0].otpAndLoginImages.length > 0
      ) {
        // Process all images
        const fixedUrls = data[0].otpAndLoginImages.map(
          (imageUrl) =>
            `https://demoadmin.databyte.app/uploads/${imageUrl.replace(
              "https://100.42.179.27:7298/",
              ""
            )}`
        );
        setBrandingImages(fixedUrls);
      }
    } catch (error) {
      console.error("Error fetching branding settings:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSlideClick = (index) => {
    if (index !== currentImageIndex) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex(index);
        setIsTransitioning(false);
      }, 150);
    }
  };

  async function submitCredential(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await dispatch(loginUser(formData)).unwrap();
      console.log(response);
      if (response.isSuccess) {
        localStorage.setItem("userId", response.userId);
        localStorage.setItem("phone-number", response.phoneNumber);

        document.cookie = `userId=${response.userId}; path=/;`;
        document.cookie = `phone-number=${response.phoneNumber}; path=/;`;

        router.push("/admin/otp");

        toast.success("Login successful!");
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen">
      {/* Left side - Modern Image Slider */}
      <div className="hidden md:block w-2/4 relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {brandingImages.length > 0 ? (
          <>
            {/* Main image container */}
            <div className="relative h-full w-full">
              <div
                className={`absolute inset-0 transition-all duration-300 ease-out ${
                  isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                }`}
              >
                <img
                  src={brandingImages[currentImageIndex]}
                  alt={`Slide ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Subtle gradient overlay for better contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5" />
            </div>

            {/* Modern navigation dots */}
            {brandingImages.length > 1 && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/30">
                {brandingImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleSlideClick(index)}
                    className={`relative transition-all duration-300 ease-out ${
                      index === currentImageIndex 
                        ? "w-8 h-3 bg-white rounded-full shadow-lg" 
                        : "w-3 h-3 bg-white/60 rounded-full hover:bg-white/80 hover:scale-110"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}


            {/* Image counter */}
            {brandingImages.length > 1 && (
              <div className="absolute top-6 right-6 bg-black/30 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm font-medium border border-white/20">
                {currentImageIndex + 1} / {brandingImages.length}
              </div>
            )}
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 relative">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <Image src={logo} alt="UPLMS" width={240} height={100} className="opacity-90" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-2/4 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 py-12">
          {/* Mobile logo - only visible on mobile */}
          <div className="flex justify-center mb-8">
            <Image src={logo} alt="UPLMS" width={200} height={60} />
          </div>

          <h1 className="text-2xl font-bold mb-8 text-mainBlue2">Login</h1>

          <form onSubmit={submitCredential} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Username <span className="text-mainRed">*</span>
              </label>
              <div className="flex items-center border-2 border-gray-200 rounded-lg px-4 py-3 focus-within:border-gray">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-500 mr-3"
                >
                  <path
                    d="M8.00038 10.25C5.62282 10.25 3.50847 11.398 2.16237 13.1795C1.87265 13.5629 1.7278 13.7546 1.73253 14.0137C1.7362 14.2139 1.8619 14.4664 2.0194 14.59C2.22327 14.75 2.50578 14.75 3.0708 14.75H12.93C13.495 14.75 13.7775 14.75 13.9814 14.59C14.1389 14.4664 14.2646 14.2139 14.2682 14.0137C14.273 13.7546 14.1281 13.5629 13.8384 13.1795C12.4923 11.398 10.3779 10.25 8.00038 10.25Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.00038 8C9.86434 8 11.3754 6.48896 11.3754 4.625C11.3754 2.76104 9.86434 1.25 8.00038 1.25C6.13642 1.25 4.62538 2.76104 4.62538 4.625C4.62538 6.48896 6.13642 8 8.00038 8Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full outline-none text-gray-800"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password <span className="text-mainRed">*</span>
              </label>
              <div className="flex items-center border-2 border-gray-200 rounded-lg px-4 py-3 focus-within:border-gray">
                <input
                  type={inputType}
                  placeholder="Enter your password"
                  className="w-full outline-none text-gray-800"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() =>
                    setInputType(inputType === "password" ? "text" : "password")
                  }
                  className="ml-3 text-gray-500 focus:outline-none"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.99965 12.0479C7.66183 12.0479 8.26662 11.9736 8.81821 11.8453L7.58834 10.5782C7.39724 10.5934 7.20335 10.6056 6.99965 10.6056C3.25404 10.6056 1.80297 7.83218 1.45158 7C1.71544 6.39339 2.0718 5.83418 2.50716 5.34357L1.52858 4.33543C0.452004 5.53755 0.0439133 6.74832 0.0362135 6.77212C-0.0120712 6.92022 -0.0120712 7.0805 0.0362135 7.2286C0.0509131 7.27619 1.65668 12.0479 6.99965 12.0479ZM6.99965 1.9521C5.71378 1.9521 4.65751 2.23766 3.77693 2.65952L1.19469 0L0.20491 1.01968L12.8046 14L13.7944 12.9803L11.4711 10.5869C13.3009 9.17997 13.954 7.25888 13.9638 7.2286C14.0121 7.0805 14.0121 6.92022 13.9638 6.77212C13.9484 6.72381 12.3426 1.9521 6.99965 1.9521ZM10.48 9.56578L8.88401 7.9216C9.017 7.64036 9.0996 7.331 9.0996 7C9.0996 5.81663 8.14832 4.83661 6.99965 4.83661C6.67836 4.83661 6.37806 4.92171 6.10577 5.05944L4.8402 3.75564C5.53495 3.51003 6.26516 3.38786 6.99965 3.39435C10.7453 3.39435 12.1963 6.16782 12.5477 7C12.3363 7.49902 11.7315 8.68888 10.48 9.56578Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                href="/admin/login/forget"
                className="text-sm font-medium text-mainBlue hover:text-mainBlue2 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <div className="flex items-center gap-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M10 6.458V10.8333M10 13.5417H10.0083M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-mainBlue2 "
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}