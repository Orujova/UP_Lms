import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const TargetGroupSelector = ({ targetGroups, value, onChange, error }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const componentRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (componentRef.current && !componentRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedGroup = targetGroups.find(group => group.id.toString() === value);

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200" ref={componentRef}>
      <h3 className="text-sm font-medium mb-2 leading-5 text-gray-800/90">
        Target Group
      </h3>
      <div className="relative">
        <input
          type="text"
          placeholder="Search target groups..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onClick={() => setShowDropdown(true)}
          className="w-full px-4 py-2 text-[0.85rem] font-normal border rounded-md focus:outline-none focus:border-[#01dbc8]"
        />
        <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />

        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {targetGroups
              .filter((group) =>
                group.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((group) => (
                <div
                  key={group.id}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    onChange(group.id.toString());
                    setSearchQuery(group.name);
                    setShowDropdown(false);
                  }}
                >
                  <div className="font-medium">{group.name}</div>
                  <div className="text-xs text-gray-400 flex gap-2 mt-1">
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-center text-xs leading-4">
                        U
                      </span>
                      {group.userCount} Users
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-center text-xs leading-4">
                        F
                      </span>
                      {group.filterGroupCount} Filters
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      
      {value && selectedGroup && (
        <div className="mt-2 bg-[#f9fefe] text-[#127D74] px-3 py-2 rounded-lg flex justify-between items-center">
          <span>Selected: {selectedGroup.name}</span>
          <button
            type="button"
            onClick={() => {
              onChange('');
              setSearchQuery('');
            }}
            className="text-[#127D74] hover:text-emerald-800"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default TargetGroupSelector;