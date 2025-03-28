"use client";
import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="relative group w-[48rem]">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-gray-400 group-hover:text-[#01DBC8] transition-colors duration-200" />
      </div>
      <input
        type="search"
        placeholder="Search anything here..."
        className="w-full h-9 pl-12 pr-4 bg-gray-50/50 hover:bg-gray-50 
                  focus:bg-white border border-gray-100 hover:border-gray-200 
                  focus:border-[#01DBC8] rounded-xl text-xs outline-none 
                  transition-all duration-200 placeholder-gray-400
                  focus:shadow-[0_0_0_2px_rgba(1,219,200,0.1)]"
      />
    </div>
  );
}
