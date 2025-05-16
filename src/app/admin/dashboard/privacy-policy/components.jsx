"use client";

import {
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

// Constants
export const API_URL = "https://bravoadmin.uplms.org/api/";

// Modern UI Components with improved styling
export const PageHeader = ({ title, subtitle, icon, actions }) => (
  <div className="  py-4  flex justify-between items-center">
    <div>
      <h1 className="text-lg font-bold flex items-center text-gray-800">
        <span>{title}</span>
      </h1>
      {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
    </div>
    {actions && <div className="flex space-x-3">{actions}</div>}
  </div>
);

export const SectionHeader = ({ title, icon, actionButton }) => (
  <div className="px-6 py-4 bg-white border-b flex justify-between items-center">
    <h2 className="text-sm font-medium flex items-center text-gray-700">
      {icon && <span className="mr-2">{icon}</span>}
      {title}
    </h2>
    {actionButton}
  </div>
);

export const Button = ({
  onClick,
  variant = "primary",
  children,
  icon,
  disabled = false,
  href,
  type = "button",
  className = "",
}) => {
  const baseClasses =
    "rounded-md text-sm font-medium flex items-center transition-all duration-200";
  const variants = {
    primary: "bg-[#0AAC9E] hover:bg-[#078f83] text-white px-4 py-2 shadow-sm",
    secondary:
      "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 shadow-sm",
    tertiary: "text-[#0AAC9E] hover:bg-gray-50 px-3 py-1.5",
    icon: "p-2 text-gray-500 hover:text-[#0AAC9E] hover:bg-gray-50 rounded-full",
    danger:
      "bg-white border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 text-gray-700 px-4 py-2",
    dangerFilled: "bg-red-500 hover:bg-red-600 text-white px-4 py-2 shadow-sm",
  };

  const ButtonContent = () => (
    <>
      {icon && <span className={children ? "mr-2" : ""}>{icon}</span>}
      {children}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClasses} ${variants[variant]} ${className} ${
          disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
        }`}
      >
        <ButtonContent />
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={disabled}
    >
      <ButtonContent />
    </button>
  );
};

export const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}
  >
    {children}
  </div>
);

export const StatusBadge = ({ active, size = "small" }) => {
  const baseClasses = "inline-flex items-center rounded-full font-medium";
  const sizes = {
    small: "px-2.5 py-0.5 text-xs",
    medium: "px-3 py-1 text-sm",
  };

  return active ? (
    <span
      className={`${baseClasses} ${sizes[size]} bg-[#f9f9f9] text-[#0AAC9E] border border-[#C0F6F1]`}
    >
      <CheckCircle size={size === "small" ? 12 : 16} className="mr-1" />
      Active
    </span>
  ) : (
    <span
      className={`${baseClasses} ${sizes[size]} bg-gray-100 text-gray-600 border border-gray-200`}
    >
      <XCircle size={size === "small" ? 12 : 16} className="mr-1" />
      Inactive
    </span>
  );
};

export const ErrorAlert = ({ message, onDismiss }) => (
  <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start">
    <AlertTriangle className="mr-2 flex-shrink-0 mt-0.5" size={18} />
    <div className="flex-1">{message}</div>
    {onDismiss && (
      <button
        onClick={onDismiss}
        className="ml-3 text-red-500 hover:text-red-700"
      >
        <XCircle size={18} />
      </button>
    )}
  </div>
);

export const SuccessAlert = ({ message, onDismiss }) => (
  <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-start">
    <CheckCircle className="mr-2 flex-shrink-0 mt-0.5" size={18} />
    <div className="flex-1">{message}</div>
    {onDismiss && (
      <button
        onClick={onDismiss}
        className="ml-3 text-green-500 hover:text-green-700"
      >
        <XCircle size={18} />
      </button>
    )}
  </div>
);

export const EmptyState = ({ message, icon, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
    {icon}
    <p className="text-lg font-medium mt-4 mb-6">{message}</p>
    {action}
  </div>
);

export const FormInput = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  rows = 4,
  error,
  helpText,
  name,
}) => (
  <div className="mb-5">
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === "textarea" ? (
      <textarea
        id={id}
        name={name || id}
        rows={rows}
        className={`w-full px-3 py-2 rounded-lg border ${
          error ? "border-red-300 bg-red-50" : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] text-sm transition-all`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    ) : (
      <input
        type={type}
        id={id}
        name={name || id}
        className={`w-full px-3 py-2 rounded-lg border ${
          error ? "border-red-300 bg-red-50" : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-[#0AAC9E]/20 focus:border-[#0AAC9E] text-sm transition-all`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    )}
    {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export const Checkbox = ({ id, label, checked, onChange, name }) => (
  <div className="mb-5">
    <label className="flex items-center cursor-pointer">
      <input
        id={id}
        name={name || id}
        type="checkbox"
        className="h-4 w-4 text-[#0AAC9E] focus:ring-[#0AAC9E] border-gray-300 rounded transition-colors"
        checked={checked}
        onChange={onChange}
      />
      <span className="ml-2 text-sm text-gray-700">{label}</span>
    </label>
  </div>
);

// Improved Pagination Component
export const Pagination = ({
  totalItems,
  currentPage,
  onPageChange,
  itemsPerPage = 10,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  return (
    <div className="flex items-center justify-between w-full px-6 py-3 bg-white border-t border-gray-200">
      <div className="text-xs text-gray-500">{totalItems} items total</div>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Previous
        </button>

        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          // Show up to 5 page numbers
          let pageNum;
          if (totalPages <= 5) {
            // If 5 or fewer pages, show all
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            // Near the start
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            // Near the end
            pageNum = totalPages - 4 + i;
          } else {
            // In the middle
            pageNum = currentPage - 2 + i;
          }

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-6 h-6 flex items-center justify-center rounded-md text-sm transition-colors ${
                currentPage === pageNum
                  ? "bg-[#0AAC9E] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            currentPage === totalPages || totalPages === 0
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-6">{message}</p>
        <div className="flex space-x-3 justify-end">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="dangerFilled" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

// Navigation helper
export const useAppNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  return {
    // Navigate to the privacy policy list
    toPrivacyPolicyList: () => {
      router.push("/admin/dashboard/privacy-policy");
    },

    // Navigate to a specific privacy policy
    toPrivacyPolicy: (id) => {
      router.push(`/admin/dashboard/privacy-policy/${id}`);
    },

    // Navigate to edit a policy
    toEditPrivacyPolicy: (id) => {
      router.push(`/admin/dashboard/privacy-policy/edit/${id}`);
    },

    // Navigate to create a new policy
    toCreatePrivacyPolicy: () => {
      router.push("/admin/dashboard/privacy-policy/create");
    },

    // Go back to previous page
    goBack: () => {
      router.back();
    },
  };
};

// Feature Components
export const PolicyCard = ({ policy, onDelete }) => {
  return (
    <div className="p-5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center mb-1">
            <h3 className="text-base font-medium text-gray-900 truncate">
              {policy.title}
            </h3>
            <StatusBadge active={policy.isActive} className="ml-3" />
          </div>
          <p className="text-gray-500 line-clamp-2 mb-2">
            {policy.description}
          </p>
          <div className="flex items-center text-xs text-gray-500">
            <span>
              Last updated:{" "}
              {new Date(policy.updatedAt || Date.now()).toLocaleDateString()}
            </span>
            {policy.id && <span className="mx-2">•</span>}
            {policy.id && <span>ID: {policy.id}</span>}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="tertiary"
            href={`/admin/dashboard/privacy-policy/${policy.id}`}
            icon={<Eye size={16} />}
          >
            View
          </Button>
          <Button
            variant="tertiary"
            href={`/admin/dashboard/privacy-policy/edit/${policy.id}`}
            icon={<Edit size={16} />}
          >
            Edit
          </Button>
          <Button
            variant="tertiary"
            onClick={() => onDelete(policy.id)}
            icon={<Trash2 size={16} />}
            className="text-gray-500 hover:text-red-500"
          />
        </div>
      </div>
    </div>
  );
};
