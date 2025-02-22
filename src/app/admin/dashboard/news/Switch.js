import React from 'react';

const Switch = ({ checked, onCheckedChange, icon: Icon, offIcon: OffIcon, label, description }) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <label className="text-sm font-medium leading-5 text-gray-800/90">
            {label}
          </label>
          {description && (
            <p className="text-xs font-normal text-gray-400">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {checked ? (
            Icon && <Icon className="w-4 h-4 text-[#0AAC9E]" />
          ) : (
            OffIcon && <OffIcon className="w-4 h-4 text-gray-400" />
          )}
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onCheckedChange(!checked)}
            className={`relative inline-flex h-5 w-11 items-center rounded-full transition-colors ${
              checked ? "bg-[#0AAC9E]" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-3 w-4 transform rounded-full bg-white transition-transform ${
                checked ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Switch;