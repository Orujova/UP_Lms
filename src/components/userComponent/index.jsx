"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { removeToken } from "@/authtoken/auth.js";
import {
  Phone,
  Eye,
  Settings,
  UserCheck,
  BookOpen,
  UserX,
  X,
  AlertTriangle,
  UserPlus,
} from "lucide-react";
import noPP from "@/images/noPP.png";
import soonAnimation from "../../animations/coming.json";
import Lottie from "react-lottie-player";
import { getToken, getUserId } from "@/authtoken/auth.js";

const userId = getUserId();

// Modal Component (unchanged)
const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-lg shadow-xl z-10 w-96 max-w-full overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-4 text-sm">{children}</div>

        {footer && (
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default function UserComponent({
  id,
  img,
  fullName,
  phone,
  department,
  position,
  isActive = true,
}) {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState(""); // "confirm" or "success" or "error" or "info"
  const settingsRef = useRef(null);
  const dropdownRef = useRef(null);

  // Calculate dropdown position
  const [dropdownPosition, setDropdownPosition] = useState({
    top: false,
    bottom: true,
  });

  // Check if dropdown would go off-screen and adjust position
  useEffect(() => {
    if (showSettings && settingsRef.current && dropdownRef.current) {
      const buttonRect = settingsRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Check if there's not enough space below
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const shouldShowAbove = spaceBelow < dropdownHeight + 10;

      setDropdownPosition({
        top: shouldShowAbove,
        bottom: !shouldShowAbove,
      });
    }
  }, [showSettings]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    }

    // Add event listener when dropdown is open
    if (showSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettings]);

  const showConfirmModal = (action) => {
    setModalType("confirm");
    if (action === "deactivate") {
      setModalTitle("Deactivate User");
      setModalMessage(
        `Are you sure you want to deactivate the user "${fullName}"?`
      );
    } else {
      setModalTitle("Activate User");
      setModalMessage(
        `Are you sure you want to activate the user "${fullName}"?`
      );
    }
    setShowModal(true);
    setShowSettings(false);
  };

  const showSuccessModal = (message) => {
    setModalType("success");
    setModalTitle("Success");
    setModalMessage(message);
    setShowModal(true);
  };

  const showErrorModal = (message) => {
    setModalType("error");
    setModalTitle("Error");
    setModalMessage(message);
    setShowModal(true);
  };

  const showComingSoonModal = (title, message) => {
    setModalType("info");
    setModalTitle(title);
    setModalMessage(message);
    setShowModal(true);
    setShowSettings(false);
  };

  // Function to log out the user
  const logoutUser = () => {
    removeToken();
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("phone-number");
    toast.success("Logged out successfully.");
    router.push("/admin/login");
  };

  const handleUserStatusChange = async () => {
    try {
      setIsLoading(true);
      setShowModal(false); // Close confirm modal

      const token = getToken();
      const API_URL = "https://bravoadmin.uplms.org/api/";
      const endpoint = `${API_URL}AdminApplicationUser/DeactivateUser`;

      // For active users, we set isDeleted to true to deactivate them
      // For inactive users, we set isDeleted to false to activate them
      const requestBody = {
        id: parseInt(id),
        isDeleted: isActive,
      };

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const successMessage = isActive
          ? "User deactivated successfully"
          : "User activated successfully";

        showSuccessModal(successMessage);

        // Show toast notification
        toast.success(successMessage, {
          duration: 3000,
          position: "top-right",
        });

        if (isActive && userId === id.toString()) {
          setTimeout(() => {
            logoutUser();
          }, 1500);
        } else {
          // Otherwise just reload the page after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.message ||
          `Failed to ${isActive ? "deactivate" : "activate"} user`;

        showErrorModal(errorMessage);

        // Show error toast
        toast.error(errorMessage, {
          duration: 3000,
          position: "top-right",
        });
      }
    } catch (error) {
      console.error(
        `Error ${isActive ? "deactivating" : "activating"} user:`,
        error
      );
      const errorMessage = `An error occurred while ${
        isActive ? "deactivating" : "activating"
      } the user`;

      showErrorModal(errorMessage);

      // Show error toast
      toast.error(errorMessage, {
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderModalFooter = () => {
    if (modalType === "confirm") {
      return (
        <>
          <button
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
            onClick={() => setShowModal(false)}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 font-normal ${
              isActive
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#0AAC9E] hover:bg-[#099b8e]"
            } text-white rounded-md text-sm font-medium`}
            onClick={handleUserStatusChange}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : isActive ? "Deactivate" : "Activate"}
          </button>
        </>
      );
    } else {
      return (
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
          onClick={() => setShowModal(false)}
        >
          Close
        </button>
      );
    }
  };

  const renderModalContent = () => {
    const iconClass = {
      confirm: isActive ? "text-yellow-500" : "text-[#0AAC9E]",
      success: "text-[#0AAC9E]",
      error: "text-red-500",
      info: "text-blue-500",
    }[modalType];

    if (modalType === "info") {
      return (
        <div className="flex flex-col items-center justify-center">
          <Lottie
            loop
            animationData={soonAnimation}
            play
            style={{ width: 300, height: 300 }}
          />
          <p className="text-gray-600 text-center mt-2">{modalMessage}</p>
        </div>
      );
    }

    return (
      <div className="flex items-start gap-3">
        {modalType === "confirm" && (
          <AlertTriangle className={iconClass} size={24} />
        )}
        <p className="text-gray-600">{modalMessage}</p>
      </div>
    );
  };

  return (
    <div
      className={`grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr_80px] gap-4 py-3.5 px-6 border-b border-gray-200 transition-all duration-200 text-base hover:bg-gray-50 ${
        !isActive ? "bg-gray-50 border-l-2 border-l-gray-300" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg overflow-hidden ${
            isActive ? "bg-gray-100" : "bg-gray-200"
          }`}
        >
          <Image
            src={img ? img : noPP}
            alt={fullName}
            width={40}
            height={40}
            className={`rounded-lg ${!isActive ? "opacity-70 grayscale" : ""}`}
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p
              className={`text-xs font-medium ${
                isActive ? "text-gray-900" : "text-gray-500"
              } mb-1`}
            >
              {fullName}
            </p>
            {!isActive && (
              <span className="text-xs bg-red-50 text-red-400 px-2 py-0.5 rounded-full font-medium">
                Deactivated
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-light">ID: {id}</p>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 text-xs ${
          isActive ? "text-gray-600" : "text-gray-400"
        }`}
      >
        <Phone size={14} className="text-gray-400" />
        <span>{phone}</span>
      </div>

      <div
        className={`flex items-center text-xs ${
          isActive ? "text-gray-600" : "text-gray-400"
        }`}
      >
        <span>{department}</span>
      </div>

      <div
        className={`flex items-center text-xs ${
          isActive ? "text-gray-600" : "text-gray-400"
        }`}
      >
        <span>{position}</span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/admin/dashboard/users/${id}`}
          className="p-2 rounded-md text-gray-500 transition-all duration-200 hover:text-teal-500 hover:bg-gray-100"
        >
          <Eye size={14} />
        </Link>

        <div className="relative" ref={settingsRef}>
          <button
            className="p-2 rounded-md text-gray-500 transition-all duration-200 hover:text-teal-500 hover:bg-gray-100"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={14} />
          </button>

          {showSettings && (
            <div
              ref={dropdownRef}
              className={`absolute ${
                dropdownPosition.top ? "bottom-full mb-1" : "top-full mt-1"
              } right-0 bg-white rounded-lg shadow-lg w-44 z-20 border border-gray-100`}
            >
              <div className="py-1">
                <button
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 text-left"
                  onClick={() =>
                    showComingSoonModal(
                      "Grant Access",
                      "Grant access feature will be implemented soon."
                    )
                  }
                >
                  <UserCheck size={14} className="text-gray-400" />
                  <span>Grant Access</span>
                </button>

                <button
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 text-left"
                  onClick={() =>
                    showComingSoonModal(
                      "Enroll Course",
                      "Enroll course feature will be implemented soon."
                    )
                  }
                >
                  <BookOpen size={14} className="text-gray-400" />
                  <span>Enroll Course</span>
                </button>

                {isActive ? (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 text-left"
                    onClick={() => showConfirmModal("deactivate")}
                    disabled={isLoading}
                  >
                    <UserX size={14} className="text-gray-400" />
                    <span>
                      {isLoading ? "Processing..." : "Deactivate User"}
                    </span>
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-[#0AAC9E] hover:bg-gray-50 text-left"
                    onClick={() => showConfirmModal("activate")}
                    disabled={isLoading}
                  >
                    <UserPlus size={14} className="text-[#0AAC9E]" />
                    <span>{isLoading ? "Processing..." : "Activate User"}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => !isLoading && setShowModal(false)}
        title={modalTitle}
        footer={renderModalFooter()}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
}
