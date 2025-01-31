import React, { useState, useEffect, useRef } from 'react';
import './multiSelect.scss';
import Image from 'next/image';
import downArrow from '@/images/downArrow.svg';

export default function MultiSelect({ text, className, required, options = [], value = [], onChange, name }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle option selection
  const handleChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
    onChange(selectedOptions); // Send the array of selected values to the parent component
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false); // Close the dropdown
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className={`multiSelect ${className}`} ref={dropdownRef}>
      <label htmlFor={name}>
        {text} {required && <span>*</span>}
      </label>
      <div className="dropdown" onClick={toggleDropdown}>
        <div className="dropdown-selected">
          <div className="selected-items">
            {value.length > 0 ? (
              value.map((selectedValue) => {
                const option = options.find((opt) => opt.id === selectedValue);
                return option ? (
                  <div key={option.id} className="selected-item">
                    {option.name || option.categoryName || option.roleName || option.genderName}
                  </div>
                ) : null;
              })
            ) : (
              <div className="placeholder">Select options</div>
            )}
          </div>
          <Image src={downArrow} alt="down Arrow" className="downArrow" />
        </div>
        {isDropdownOpen && (
          <select
            name={name}
            id={name}
            required={required}
            value={value} // Ensure the value is correctly passed as an array
            onChange={handleChange}
            multiple
            className="dropdown-menu"
          >
            {options.map((option) => {
              const displayName = option.name || option.categoryName || option.roleName || option.genderName;
              return (
                <option key={option.id} value={option.id}>
                  {displayName}
                </option>
              );
            })}
          </select>
        )}
      </div>
    </div>
  );
}
