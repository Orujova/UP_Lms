"use client"; // Ensures this is a client component

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

//style
import "./userSidebar.scss";

//image
import backArrow from "@/images/courseBackButton.svg";

export default function UserSidebar() {
  const pathname = usePathname();
  const lastSegment = pathname?.split("/").pop();

  return (
    <div className="userSidebar">
      <Link href={"/admin/dashboard/users"}>
        <Image src={backArrow} alt="back arrow" />
        <p>Back to user list</p>
      </Link>
      <div className="userSections">
        <Link
          href={"/admin/dashboard/users/adduser/manualsetup"}
          className={`userSection ${
            lastSegment === "manualsetup" ? "active" : ""
          }`}
        >
          Manual setup
        </Link>
        <Link
          href={"/admin/dashboard/users/adduser/uploadfile"}
          className={`userSection ${
            lastSegment === "uploadfile" ? "active" : ""
          }`}
        >
          Upload file
        </Link>
      </div>
    </div>
  );
}
