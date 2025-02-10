"use client";
import { Plus } from "lucide-react";

export default function AddButton() {
  return (
    <button className="flex items-center justify-center bg-[#0AAC9E] hover:bg-[#00c4b3] transition-colors w-10 h-10 rounded-lg">
      <Plus className="w-5 h-5 text-white" />
    </button>
  );
}
