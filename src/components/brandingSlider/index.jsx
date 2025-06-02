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
  const [isTransitioning, setIsTransitioning] = useState(false);

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
      }, 4000); // 4 seconds like in login page

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

  const handleSlideClick = (index) => {
    if (index !== currentImageIndex) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex(index);
        setIsTransitioning(false);
      }, 150);
    }
  };

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

      {/* Right side - Content */}
      <div className="w-full md:w-2/4 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 py-12">
          {/* Logo - shown only if showLogo is true or we're on mobile */}
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