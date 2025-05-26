"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import logo from "@/images/logo.png";

/**
 * A reusable component for background image slider
 * Used on login, OTP, and forgot password pages
 */
export default function BrandingSlider({ children, showLogo = false }) {
  const [brandingImages, setBrandingImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch branding settings when component mounts
  useEffect(() => {
    fetchBrandingSettings();
  }, []);

  // Setup image slider if multiple images
  useEffect(() => {
    if (brandingImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === brandingImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000); // Change image every 5 seconds

      return () => clearInterval(interval);
    }
  }, [brandingImages]);

  const fetchBrandingSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://bravoadmin.uplms.org/api/BrendingSetting?IsOTPAndLogin=true"
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
            `https://bravoadmin.uplms.org/uploads/${imageUrl.replace(
              "https://100.42.179.27:7198/",
              ""
            )}`
        );
        setBrandingImages(fixedUrls);
      }
    } catch (error) {
      console.error("Error fetching branding settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen">
      {/* Left side - Background image with overlay */}
      <div className="hidden md:block w-2/4 relative overflow-hidden">
        {brandingImages.length > 0 ? (
          <>
            <div
              className="absolute inset-0 bg-no-repeat bg-cover bg-center transition-opacity duration-1000"
              style={{
                backgroundImage: `url(${brandingImages[currentImageIndex]})`,
                opacity: 1,
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />

            {/* UPLMS Brand overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white px-8">
              <div className="max-w-2xl text-center">
                <h1 className="text-4xl font-bold mb-4">
                  Learning Management System
                </h1>
                <p className="text-xl opacity-90">
                  Empower your learning journey with our comprehensive education
                  platform
                </p>
              </div>
            </div>

            {/* Slider indicators */}
            {brandingImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
                {brandingImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-mainBlue2 to-mainGreen">
            <div className="absolute inset-0 bg-black bg-opacity-20 z-10" />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <Image src={logo} alt="UPLMS" width={240} height={100} />
            </div>
          </div>
        )}
      </div>

      {/* Right side - Content */}
      <div className="w-full md:w-2/4 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 py-12">
          {/* Logo - shown only if showLogo is true or we're on mobile (shown via CSS) */}
          <div
            className={`flex justify-center mb-8 ${
              showLogo ? "" : "md:hidden"
            }`}
          >
            <Image src={logo} alt="UPLMS" width={200} height={60} />
          </div>

          {children}
        </div>
      </div>
    </main>
  );
}
