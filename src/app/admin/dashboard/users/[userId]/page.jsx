"use client";

import { useState } from "react";
import Image from "next/image";
import UserPageInnerButtons from "@/components/userPageInnerButtons";
import UserDetailsPage from "@/components/userDetailsPage";
import { getToken, getUserId } from "@/authtoken/auth.js";

//style
import "./userPage.scss";

//image
import banner from "@/images/userBanner.svg";
import test from "@/images/Frame 427320675 (4).svg";
import UserTrainingsPage from "@/components/userTrainingsPage";

export default function page() {
  const [pageControl, setPageControl] = useState("User details");

  const userId = getUserId();
  const token = getToken();

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `https://bravoadmin.uplms.org/api/AdminApplicationUser/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`, // Tokeni localStorage'dan alıyoruz
            accept: "text/plain",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.isSuccess) {
          alert("User deleted successfully");

          window.location.href = "/admin/dashboard/users";
        } else {
          alert("Failed to delete user");
        }
      } else {
        throw new Error("Delete request failed");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An error occurred while deleting the user.");
    }
  };

  return (
    <div className="userPage">
      <div className="userBanner">
        <Image className="banner" src={banner} alt={"user banner"} />
        <Image className="profile" src={test} alt={"user image"} />
      </div>
      <div className="editAndDelete">
        <div className="edit button">Edit</div>
        <div className="delete button" onClick={handleDelete}>
          Delete
        </div>
      </div>
      <UserPageInnerButtons function={setPageControl} value={pageControl} />

      {pageControl === "User details" ? (
        <UserDetailsPage />
      ) : pageControl === "Achivements" ? null : pageControl === "Trainings" ? (
        <UserTrainingsPage />
      ) : null}
    </div>
  );
}
