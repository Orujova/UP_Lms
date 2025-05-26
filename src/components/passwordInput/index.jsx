// Password Input Component with Requirements
import { useState, useEffect } from "react";

const PasswordInput = ({
  value,
  onChange,
  disabled = false,
  name = "password",
  placeholder = "Enter your password",
}) => {
  const [inputType, setInputType] = useState("password");
  const [isFocused, setIsFocused] = useState(false);
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Validate password against requirements
  useEffect(() => {
    if (value) {
      setRequirements({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  }, [value]);

  // Helper to determine if all requirements are met
  const allRequirementsMet = Object.values(requirements).every(Boolean);

  return (
    <div className="flex flex-col items-start gap-3 w-full">
      <span className="text-14 font-medium">
        Password <span className="text-mainRed">*</span>
      </span>

      {/* Password Input Field */}
      <div
        className={`flex justify-start items-center gap-2 w-full border-2 py-4 px-6 rounded-8 transition-colors duration-200
        ${isFocused ? "border-mainBlue" : "border-mainGray1"}
        ${!allRequirementsMet && value && !isFocused ? "border-amber-400" : ""}
        ${allRequirementsMet && value ? "border-green-500" : ""}`}
      >
        <input
          type={inputType}
          placeholder={placeholder}
          className="w-full outline-none"
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required
          disabled={disabled}
        />

        {/* Password visibility toggle icon */}
        <span
          onClick={() =>
            setInputType(inputType === "password" ? "text" : "password")
          }
          className="cursor-pointer"
        >
          {inputType === "password" ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.99965 12.0479C7.66183 12.0479 8.26662 11.9736 8.81821 11.8453L7.58834 10.5782C7.39724 10.5934 7.20335 10.6056 6.99965 10.6056C3.25404 10.6056 1.80297 7.83218 1.45158 7C1.71544 6.39339 2.0718 5.83418 2.50716 5.34357L1.52858 4.33543C0.452004 5.53755 0.0439133 6.74832 0.0362135 6.77212C-0.0120712 6.92022 -0.0120712 7.0805 0.0362135 7.2286C0.0509131 7.27619 1.65668 12.0479 6.99965 12.0479ZM6.99965 1.9521C5.71378 1.9521 4.65751 2.23766 3.77693 2.65952L1.19469 0L0.20491 1.01968L12.8046 14L13.7944 12.9803L11.4711 10.5869C13.3009 9.17997 13.954 7.25888 13.9638 7.2286C14.0121 7.0805 14.0121 6.92022 13.9638 6.77212C13.9484 6.72381 12.3426 1.9521 6.99965 1.9521ZM10.48 9.56578L8.88401 7.9216C9.017 7.64036 9.0996 7.331 9.0996 7C9.0996 5.81663 8.14832 4.83661 6.99965 4.83661C6.67836 4.83661 6.37806 4.92171 6.10577 5.05944L4.8402 3.75564C5.53495 3.51003 6.26516 3.38786 6.99965 3.39435C10.7453 3.39435 12.1963 6.16782 12.5477 7C12.3363 7.49902 11.7315 8.68888 10.48 9.56578Z"
                fill="#484A4B"
              />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.00002 3.39453C10.7457 3.39453 12.1967 6.168 12.548 7.00018C12.1967 7.83236 10.7457 10.6058 7.00002 10.6058C3.25441 10.6058 1.80334 7.83236 1.45195 7.00018C1.80334 6.168 3.25441 3.39453 7.00002 3.39453ZM7.00002 1.9522C1.65705 1.9522 0.0513051 6.7239 0.0366055 6.7723C-0.0116792 6.9204 -0.0116792 7.08068 0.0366055 7.22878C0.0513051 7.27637 1.65705 12.0481 7.00002 12.0481C12.343 12.0481 13.9487 7.27637 13.9634 7.22878C14.0117 7.08068 14.0117 6.9204 13.9634 7.22878C13.9487 6.7239 12.343 1.9522 7.00002 1.9522ZM7.00002 4.83679C5.85134 4.83679 4.90006 5.81681 4.90006 7.00018C4.90006 8.18355 5.85134 9.16357 7.00002 9.16357C8.14869 9.16357 9.09997 8.18355 9.09997 7.00018C9.09997 5.81681 8.14869 4.83679 7.00002 4.83679ZM7.00002 8.16815C6.41064 8.16815 5.92954 7.63961 5.92954 6.99946C5.92954 6.35931 6.41064 5.83077 7.00002 5.83077C7.58939 5.83077 8.07049 6.35931 8.07049 6.99946C8.07049 7.63961 7.58939 8.16815 7.00002 8.16815Z"
                fill="#484A4B"
              />
            </svg>
          )}
        </span>

        {/* Visual strength indicator */}
        {value && (
          <span
            className={`ml-1 ${
              allRequirementsMet ? "text-green-500" : "text-amber-500"
            }`}
          >
            {allRequirementsMet ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.3334 4L6.00002 11.3333L2.66669 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 4V8M8 12H8.01M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </span>
        )}
      </div>

      {/* Requirements hint - only shown when focused or when password has content but isn't valid */}
      {(isFocused || (value && !allRequirementsMet)) && (
        <div className="text-sm mt-2 bg-gray-50 p-3 rounded-lg w-full transition-all">
          <p className="text-gray-500 mb-2 font-medium text-xs">
            Password requirements:
          </p>
          <ul className="space-y-1 text-xs">
            <li className="flex items-center">
              <span
                className={`mr-2 ${
                  requirements.length ? "text-green-500" : "text-gray-400"
                }`}
              >
                {requirements.length ? "✓" : "○"}
              </span>
              <span
                className={
                  requirements.length ? "text-green-700" : "text-gray-600"
                }
              >
                At least 8 characters
              </span>
            </li>
            <li className="flex items-center">
              <span
                className={`mr-2 ${
                  requirements.uppercase ? "text-green-500" : "text-gray-400"
                }`}
              >
                {requirements.uppercase ? "✓" : "○"}
              </span>
              <span
                className={
                  requirements.uppercase ? "text-green-700" : "text-gray-600"
                }
              >
                At least one uppercase letter
              </span>
            </li>
            <li className="flex items-center">
              <span
                className={`mr-2 ${
                  requirements.lowercase ? "text-green-500" : "text-gray-400"
                }`}
              >
                {requirements.lowercase ? "✓" : "○"}
              </span>
              <span
                className={
                  requirements.lowercase ? "text-green-700" : "text-gray-600"
                }
              >
                At least one lowercase letter
              </span>
            </li>
            <li className="flex items-center">
              <span
                className={`mr-2 ${
                  requirements.number ? "text-green-500" : "text-gray-400"
                }`}
              >
                {requirements.number ? "✓" : "○"}
              </span>
              <span
                className={
                  requirements.number ? "text-green-700" : "text-gray-600"
                }
              >
                At least one number
              </span>
            </li>
            <li className="flex items-center">
              <span
                className={`mr-2 ${
                  requirements.special ? "text-green-500" : "text-gray-400"
                }`}
              >
                {requirements.special ? "✓" : "○"}
              </span>
              <span
                className={
                  requirements.special ? "text-green-700" : "text-gray-600"
                }
              >
                At least one special character (!@#$%^&*(),.?":{})
              </span>
            </li>
          </ul>
        </div>
      )}

      {/* Simple strength meter when not focused but password has content */}
      {value && !isFocused && (
        <div className="w-full flex items-center gap-2 text-xs">
          <div className="flex-1 h-1 bg-gray-200 rounded overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                Object.values(requirements).filter(Boolean).length <= 1
                  ? "bg-red-500 w-1/5"
                  : Object.values(requirements).filter(Boolean).length <= 3
                  ? "bg-amber-500 w-3/5"
                  : "bg-green-500 w-full"
              }`}
            />
          </div>
          <span
            className={`font-medium ${
              Object.values(requirements).filter(Boolean).length <= 1
                ? "text-red-500"
                : Object.values(requirements).filter(Boolean).length <= 3
                ? "text-amber-500"
                : "text-green-500"
            }`}
          >
            {Object.values(requirements).filter(Boolean).length <= 1
              ? "Weak"
              : Object.values(requirements).filter(Boolean).length <= 3
              ? "Medium"
              : "Strong"}
          </span>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
