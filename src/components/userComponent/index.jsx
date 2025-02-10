// import Image from "next/image";
import Link from "next/link";
import { Phone, Edit } from "lucide-react";
import "./userComponent.scss";

export default function UserComponent({
  id,
  img,
  fullName,
  phone,
  department,
  position,
}) {
  return (
    <div className="user-row">
      <div className="user-info">
        <div className="avatar">
          {/* <Image
            src={img}
            alt={fullName}
            width={40}
            height={40}
            className="rounded-lg"
          /> */}
        </div>
        <div className="details">
          <p className="name">{fullName}</p>
          <p className="id">ID: {id}</p>
        </div>
      </div>
      <div className="contact">
        <Phone size={16} />
        <span>{phone}</span>
      </div>
      <div className="department">
        <span>{department}</span>
      </div>
      <div className="position">
        <span>{position}</span>
      </div>
      <div className="actions">
        <Link href={`/admin/dashboard/users/${id}`} className="edit-link">
          <Edit size={16} />
        </Link>
      </div>
    </div>
  );
}
