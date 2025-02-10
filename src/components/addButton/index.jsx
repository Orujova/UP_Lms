import Link from "next/link";
import { Plus } from "lucide-react";
//style
import "./addButton.scss";

export default function AddButton(props) {
  return (
    <Link href={props.link} className="addButton">
      <Plus size={18} />
      <span>{props.text}</span>
    </Link>
  );
}
