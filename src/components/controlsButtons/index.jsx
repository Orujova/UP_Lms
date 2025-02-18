import { Filter, Download, CirclePlus } from "lucide-react";
import Link from "next/link";
import "./controlsButtons.scss";

export default function ControlsButtons({ count, text, link, buttonText }) {
  return (
    <div className="controls-header">
      <div className="stats">
        <h2>{count}</h2>
        <span>{text}</span>
      </div>
      <div className="actions">
        <button className="btn btn-secondary">
          <Filter size={16} />
          <span>Filter</span>
        </button>
        <Link href={link} className="btn btn-primary">
          <CirclePlus size={16} />
          <span>{buttonText}</span>
        </Link>
        <button className="btn btn-secondary">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
}
