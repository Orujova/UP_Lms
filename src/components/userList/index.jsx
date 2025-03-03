"use client";
import { useEffect } from "react";
import { ArrowUpDown } from "lucide-react";
import UserComponent from "../userComponent";
import "./userList.scss";

const BASE_IMAGE_URL = "https://bravoadmin.uplms.org/uploads/";

const formatImageUrl = (imageUrl) => {
  if (!imageUrl) return "";

  const cleanPath = imageUrl.replace("https://100.42.179.27:7198/", "");

  return `${BASE_IMAGE_URL}${cleanPath}`;
};

export default function UserList({ adminApplicationUser }) {
  useEffect(() => {
    const tableHeader = document.querySelector(".table-header");
    const tableBody = document.querySelector(".table-body");

    const handleScroll = () => {
      if (tableBody?.scrollTop > 0) {
        tableHeader?.classList.add("scrolled");
      } else {
        tableHeader?.classList.remove("scrolled");
      }
    };

    tableBody?.addEventListener("scroll", handleScroll);
    return () => tableBody?.removeEventListener("scroll", handleScroll);
  }, []);

  const columns = [
    { key: "fullName", label: "Full name", sortable: true },
    { key: "contact", label: "Contact", sortable: false },
    { key: "department", label: "Department", sortable: true },
    { key: "position", label: "Position", sortable: true },
    { key: "action", label: "Action", sortable: false },
  ];

  return (
    <div className="user-list">
      <div className="table-header">
        {columns.map((column) => (
          <div key={column.key} className={`column ${column.key}`}>
            <span>{column.label}</span>
            {column.sortable && <ArrowUpDown className="sort-icon" size={16} />}
          </div>
        ))}
      </div>

      <div className="table-body">
        {adminApplicationUser.appUsers?.map((user) => (
          <UserComponent
            key={user.id}
            img={formatImageUrl(user.imageUrl)}
            fullName={`${user.firstName} ${user.lastName}`}
            id={user.id}
            phone={user.phoneNumber}
            department={user.department?.name || "Not specified"}
            position={user.position?.name || "Not specified"}
            isActive={!user.isDeleted}
          />
        ))}
      </div>
    </div>
  );
}
