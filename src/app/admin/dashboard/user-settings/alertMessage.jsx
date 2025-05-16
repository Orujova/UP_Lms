"use client";
import React from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

const AlertMessage = ({ message, setMessage }) => {
  return (
    <div
      className={`p-3 rounded-md text-sm mb-6 flex items-start ${
        message.type === "error"
          ? "bg-red-50 text-red-700 border border-red-200"
          : "bg-[#f9fefe] text-[#127D74] border border-[#C0F6F1]"
      }`}
      style={{
        borderColor: message.type === "error" ? "#FFC9C9" : "#C3E6CB",
      }}
    >
      {message.type === "error" ? (
        <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
      ) : (
        <CheckCircle2 size={16} className="mr-2 flex-shrink-0 mt-0.5" />
      )}
      <span>{message.text}</span>
      <button
        onClick={() => setMessage({ text: "", type: "" })}
        className="ml-auto"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default AlertMessage;
