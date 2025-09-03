import React, { useState,  useRef } from "react";

import { 
  Plus, 
  ChevronDown, 
  ChevronRight, 
 
  Edit3, 
  Trash2,
  Clock,
  
  EyeOff,

  GripVertical,

} from "lucide-react";



const DraggableSection = ({ 
  section, 
  sectionIndex, 
  isExpanded, 
  isActive, 
  sectionProgress, 
  contents, 
  onToggle, 
  onEdit, 
  onDelete, 
  onDragStart, 
  onDragEnd, 
  onDragOver, 
  onDrop,
  isDragging,
  dragOverIndex,
  children
}) => {
  const dragRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sectionIndex.toString());
    
    if (dragRef.current) {
      dragRef.current.style.opacity = '0.5';
    }
    
    onDragStart(sectionIndex);
  };
  
  const handleDragEnd = (e) => {
    if (dragRef.current) {
      dragRef.current.style.opacity = '1';
    }
    setIsDragOver(false);
    onDragEnd();
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!isDragging) {
      setIsDragOver(true);
      onDragOver(sectionIndex);
    }
  };
  
  const handleDragEnter = (e) => {
    e.preventDefault();
    if (!isDragging) {
      setIsDragOver(true);
    }
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    setIsDragOver(false);
    
    if (draggedIndex !== sectionIndex) {
      onDrop(sectionIndex, draggedIndex);
    }
  };
  
  const showDropIndicator = isDragOver && !isDragging;
  
  return (
    <div className="relative">
      {/* Drop indicator */}
      {showDropIndicator && (
        <div className="h-1 bg-[#0AAC9E] rounded-full mb-2 opacity-80 animate-pulse" />
      )}
      
      <div 
        ref={dragRef}
        className={`border rounded-lg transition-all duration-200 ${
          isActive 
            ? 'border-[#0AAC9E] bg-[#0AAC9E]/5' 
            : 'border-gray-200 bg-white hover:border-gray-300'
        } ${isDragging ? 'scale-95 shadow-lg' : ''} ${showDropIndicator ? 'ring-2 ring-[#0AAC9E]/30' : ''}`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Section Header */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {/* Drag Handle */}
              <div 
                className="cursor-move text-gray-400 hover:text-[#0AAC9E] transition-colors p-1"
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                title="Drag to reorder"
              >
                <GripVertical className="w-4 h-4" />
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(section.id);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>

              <div className="flex items-center space-x-3 flex-1">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                      #{section.order}
                    </span>
                    <h4 className="text-sm font-medium text-gray-900">
                      {section.description || "Untitled Section"}
                    </h4>
                    {section.hideSection && (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    {section.mandatory && (
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                        Required
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {section.duration || 0} min
                    </span>
                    <span>
                      {contents.length} item{contents.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Actions */}
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(section);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit Section"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(section.id);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Section"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Section Content */}
        {isExpanded && (
          <div className="border-t border-gray-100 bg-gray-50/50 p-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default DraggableSection