"use client";
import { Plus } from "lucide-react";

export default function AddButton() {
  return (
    <button className="flex items-center justify-center bg-[#0AAC9E] hover:bg-[#00c4b3] transition-colors w-9 h-8 rounded-lg">
      <Plus className="w-4 h-4 text-white" />
    </button>
  );
}
