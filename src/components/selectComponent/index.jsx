import { ChevronDown } from "lucide-react";
import "./selectComponent.scss";

export default function SelectComponent({
  text,
  className = "",
  required = false,
  options = [],
  value,
  onChange,
  name,
  error,
  disabled = false,
}) {
  return (
    <div className={`selectComponent ${error ? "error" : ""} ${className}`}>
      <label htmlFor={name}>
        {text}
        {required && <span>* </span>}
      </label>
      <div className="selectWrapper">
        <select
          id={name}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
        >
          <option value="" hidden></option>
          {options.map((option) => {
            const displayName =
              option.categoryName ||
              option.name ||
              option.roleName ||
              option.genderName;
            return (
              <option key={option.id} value={option.id}>
                {displayName}
              </option>
            );
          })}
        </select>
        <ChevronDown className="dropdownIcon" />
      </div>
      {error && <span className="errorMessage">{error}</span>}
    </div>
  );
}
