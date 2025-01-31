import { ChevronDown } from 'lucide-react';
import './selectComponent.scss';

export default function SelectComponent({
  text,
  className,
  required,
  options = [],
  value,
  onChange,
  name,
}) {
  return (
    <div className={`selectComponent ${className}`}>
      <label htmlFor={text}>
      {required && <span>* </span>}
      {text}
      </label>
      <div className="selectWrapper">
        <select
          name={name}
          id={text}
          required={required}
          value={value}
          onChange={onChange}
        >
          <option value="" hidden></option>
          {options.map((option) => {
            const displayName =
              option.categoryName || option.name || option.roleName || option.genderName;
            return (
              <option key={option.id} value={option.id}>
                {displayName}
              </option>
            );
          })}
        </select>
        <ChevronDown className="dropdownIcon" size={16} />
      </div>
    </div>
  );
}
