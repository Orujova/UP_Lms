"use client";

import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Link,
  Type,
  Undo,
  Redo,
  Code,
  Quote,
  Strikethrough,
  Palette,
  Upload,
  Table,
  Minus
} from 'lucide-react';

const SimpleRichTextEditor = ({ 
  value = '', 
  onChange, 
  placeholder = 'Start writing...', 
  minHeight = 200,
  readOnly = false 
}) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  
  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Save state for undo/redo
  const saveState = () => {
    if (editorRef.current) {
      const newState = editorRef.current.innerHTML;
      setUndoStack(prev => [...prev.slice(-19), newState]); // Keep last 20 states
      setRedoStack([]); // Clear redo stack when new action is performed
    }
  };

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current && onChange) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  // Format commands with better browser compatibility
  const execCommand = (command, value = null) => {
    saveState(); // Save state before executing command
    
    // Special handling for formatBlock
    if (command === 'formatBlock') {
      // Ensure we have a selection or cursor position
      const selection = window.getSelection();
      if (selection.rangeCount === 0) {
        editorRef.current?.focus();
        // Create a range at the end of content
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.addRange(range);
      }
      
      // Use insertHTML for better compatibility
      if (value === 'h2') {
        document.execCommand('formatBlock', false, '<h2>');
      } else if (value === 'h3') {
        document.execCommand('formatBlock', false, '<h3>');
      } else if (value === 'h4') {
        document.execCommand('formatBlock', false, '<h4>');
      } else if (value === 'p') {
        document.execCommand('formatBlock', false, '<p>');
      } else if (value === 'blockquote') {
        document.execCommand('formatBlock', false, '<blockquote>');
      } else if (value === 'pre') {
        document.execCommand('formatBlock', false, '<pre>');
      }
    } else {
      document.execCommand(command, false, value);
    }
    
    editorRef.current?.focus();
    handleInput();
  };

  // Alternative format function for better control
  const applyFormat = (formatType) => {
    saveState();
    
    const selection = window.getSelection();
    if (selection.rangeCount === 0) {
      editorRef.current?.focus();
      return;
    }
    
    const range = selection.getRangeAt(0);
    
    // Get the current block element
    let blockElement = range.commonAncestorContainer;
    if (blockElement.nodeType === Node.TEXT_NODE) {
      blockElement = blockElement.parentNode;
    }
    
    // Find the closest block-level element within the editor
    while (blockElement && blockElement !== editorRef.current && blockElement.parentNode) {
      const tagName = blockElement.tagName?.toLowerCase();
      if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'].includes(tagName)) {
        break;
      }
      blockElement = blockElement.parentNode;
    }
    
    // Only proceed if we found a valid block element that's a child of the editor
    if (blockElement && blockElement !== editorRef.current && editorRef.current.contains(blockElement)) {
      try {
        const content = blockElement.innerHTML;
        const newElement = document.createElement(formatType);
        newElement.innerHTML = content;
        
        // Safely replace the element
        if (blockElement.parentNode && blockElement.parentNode.contains(blockElement)) {
          blockElement.parentNode.replaceChild(newElement, blockElement);
          
          // Restore selection to the new element
          const newRange = document.createRange();
          newRange.selectNodeContents(newElement);
          newRange.collapse(false); // Collapse to end
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } catch (error) {
        console.error('Error applying format:', error);
        // Fallback to insertHTML
        const selectedText = selection.toString() || 'Formatted text';
        const html = `<${formatType}>${selectedText}</${formatType}>`;
        document.execCommand('insertHTML', false, html);
      }
    } else {
      // If no valid block element found, use insertHTML as fallback
      const selectedText = selection.toString() || 'Formatted text';
      const html = `<${formatType}>${selectedText}</${formatType}>`;
      document.execCommand('insertHTML', false, html);
    }
    
    handleInput();
  };

  // Check if command is active
  const isCommandActive = (command) => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  };

  // Undo function
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const currentState = editorRef.current.innerHTML;
      const previousState = undoStack[undoStack.length - 1];
      
      setRedoStack(prev => [currentState, ...prev]);
      setUndoStack(prev => prev.slice(0, -1));
      
      editorRef.current.innerHTML = previousState;
      handleInput();
    }
  };

  // Redo function
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const currentState = editorRef.current.innerHTML;
      const nextState = redoStack[0];
      
      setUndoStack(prev => [...prev, currentState]);
      setRedoStack(prev => prev.slice(1));
      
      editorRef.current.innerHTML = nextState;
      handleInput();
    }
  };

  // Insert HTML
  const insertHTML = (html) => {
    saveState();
    document.execCommand('insertHTML', false, html);
    handleInput();
  };

  // Handle file upload for images
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.margin = '5px 0';
        img.style.borderRadius = '4px';
        
        const range = window.getSelection().getRangeAt(0);
        range.insertNode(img);
        range.setStartAfter(img);
        range.setEndAfter(img);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        
        handleInput();
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    event.target.value = '';
  };

  // Add link with validation
  const addLink = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    let url = prompt('Enter URL:', 'https://');
    if (url && url.trim()) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      if (selectedText) {
        execCommand('createLink', url);
        // Add target blank to new links
        setTimeout(() => {
          const links = editorRef.current.querySelectorAll('a[href="' + url + '"]');
          links.forEach(link => link.setAttribute('target', '_blank'));
        }, 100);
      } else {
        const linkText = prompt('Enter link text:', url);
        if (linkText) {
          insertHTML(`<a href="${url}" target="_blank">${linkText}</a>`);
        }
      }
    }
  };

  // Insert table - creates table with header row
  const insertTable = () => {
    // Default 3x3 table with header
    let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ddd;">';
    
    // Header row
    tableHTML += '<tr>';
    for (let c = 0; c < 3; c++) {
      tableHTML += '<th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2; font-weight: 600; text-align: left;">Header</th>';
    }
    tableHTML += '</tr>';
    
    // Data rows
    for (let r = 1; r < 3; r++) {
      tableHTML += '<tr>';
      for (let c = 0; c < 3; c++) {
        tableHTML += '<td style="padding: 8px; border: 1px solid #ddd;">Cell</td>';
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</table>';
    
    insertHTML(tableHTML);
  };

  // Handle paste to preserve some formatting but clean up
  const handlePaste = (e) => {
    e.preventDefault();
    saveState();
    
    let paste = e.clipboardData.getData('text/html');
    if (!paste) {
      paste = e.clipboardData.getData('text/plain');
      // Convert plain text to HTML with line breaks
      paste = paste.replace(/\n/g, '<br>');
    }
    
    // Clean up the pasted content
    const cleanHTML = paste
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .replace(/<(\/?)(\w+)[^>]*>/gi, (match, slash, tag) => {
        // Keep only allowed tags
        const allowedTags = ['b', 'strong', 'i', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'ul', 'ol', 'li', 'a', 'table', 'tr', 'td', 'th', 'blockquote', 'code', 'pre'];
        if (allowedTags.includes(tag.toLowerCase())) {
          if (tag.toLowerCase() === 'a' && !slash) {
            return `<${slash}${tag} target="_blank">`;
          }
          return `<${slash}${tag}>`;
        }
        return '';
      })
      .replace(/style="[^"]*"/gi, '') // Remove inline styles except for specific cases
      .replace(/<img[^>]+>/gi, (match) => {
        // Handle images - keep src but add our styling
        const srcMatch = match.match(/src="([^"]+)"/);
        if (srcMatch) {
          return `<img src="${srcMatch[1]}" style="max-width: 100%; height: auto; margin: 5px 0; border-radius: 4px;" />`;
        }
        return '';
      });
    
    document.execCommand('insertHTML', false, cleanHTML);
    handleInput();
  };

  // Handle key commands
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            handleRedo();
          } else {
            e.preventDefault();
            handleUndo();
          }
          break;
        case 'y':
          e.preventDefault();
          handleRedo();
          break;
        case 'k':
          e.preventDefault();
          addLink();
          break;
      }
    }
    
    // Save state on Enter for better undo/redo experience
    if (e.key === 'Enter') {
      setTimeout(saveState, 100);
    }
  };

  // Toolbar button component
  const ToolbarButton = ({ icon: Icon, command, value, title, isActive, onClick, disabled = false }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick || (() => execCommand(command, value))}
      disabled={disabled || readOnly}
      className={`p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive ? 'bg-[#0AAC9E]/10 text-[#0AAC9E]' : 'text-gray-600'
      }`}
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  // Color picker colors
  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#808080', '#800000', '#008000', '#000080', '#808000', '#800080', '#008080',
    '#C0C0C0', '#FF8000', '#80FF00', '#8000FF', '#FF0080', '#0080FF', '#FF8080'
  ];

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-[#0AAC9E] focus-within:border-[#0AAC9E]">
      {/* Toolbar */}
      {!readOnly && (
        <div className="border-b border-gray-200 bg-gray-50 p-2">
          <div className="flex items-center space-x-1 flex-wrap gap-1">
            {/* Undo/Redo */}
            <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
              <ToolbarButton
                icon={Undo}
                title="Undo (Ctrl+Z)"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
              />
              <ToolbarButton
                icon={Redo}
                title="Redo (Ctrl+Y)"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
              />
            </div>

            {/* Text Formatting */}
            <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
              <ToolbarButton
                icon={Bold}
                command="bold"
                title="Bold (Ctrl+B)"
                isActive={isEditorFocused && isCommandActive('bold')}
              />
              <ToolbarButton
                icon={Italic}
                command="italic"
                title="Italic (Ctrl+I)"
                isActive={isEditorFocused && isCommandActive('italic')}
              />
              <ToolbarButton
                icon={Underline}
                command="underline"
                title="Underline (Ctrl+U)"
                isActive={isEditorFocused && isCommandActive('underline')}
              />
              <ToolbarButton
                icon={Strikethrough}
                command="strikeThrough"
                title="Strikethrough"
                isActive={isEditorFocused && isCommandActive('strikeThrough')}
              />
            </div>

            {/* Text Style */}
            <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      applyFormat(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0AAC9E] bg-white cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>Format</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                  <option value="h4">Heading 4</option>
                  <option value="p">Normal Text</option>
                  <option value="blockquote">Quote</option>
                  <option value="pre">Code Block</option>
                </select>
              </div>

              <div className="relative">
                <ToolbarButton
                  icon={Palette}
                  title="Text Color"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <div className="grid grid-cols-7 gap-1">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            execCommand('foreColor', color);
                            setShowColorPicker(false);
                          }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      className="w-full mt-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                      onClick={() => setShowColorPicker(false)}
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Lists */}
            <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
              <ToolbarButton
                icon={List}
                command="insertUnorderedList"
                title="Bullet List"
                isActive={isEditorFocused && isCommandActive('insertUnorderedList')}
              />
              <ToolbarButton
                icon={ListOrdered}
                command="insertOrderedList"
                title="Numbered List"
                isActive={isEditorFocused && isCommandActive('insertOrderedList')}
              />
            </div>

            {/* Alignment */}
            <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
              <ToolbarButton
                icon={AlignLeft}
                command="justifyLeft"
                title="Align Left"
                isActive={isEditorFocused && isCommandActive('justifyLeft')}
              />
              <ToolbarButton
                icon={AlignCenter}
                command="justifyCenter"
                title="Align Center"
                isActive={isEditorFocused && isCommandActive('justifyCenter')}
              />
              <ToolbarButton
                icon={AlignRight}
                command="justifyRight"
                title="Align Right"
                isActive={isEditorFocused && isCommandActive('justifyRight')}
              />
            </div>

            {/* Insert Elements */}
            <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
              <ToolbarButton
                icon={Link}
                title="Add Link (Ctrl+K)"
                onClick={addLink}
              />
              <ToolbarButton
                icon={Upload}
                title="Upload Image"
                onClick={() => fileInputRef.current?.click()}
              />
              <ToolbarButton
                icon={Table}
                title="Insert Table"
                onClick={insertTable}
              />
            </div>

            {/* Special */}
            <div className="flex items-center space-x-1">
              <ToolbarButton
                icon={Quote}
                command="formatBlock"
                value="blockquote"
                title="Quote Block"
              />
              <ToolbarButton
                icon={Code}
                command="formatBlock"
                value="pre"
                title="Code Block"
              />
              <ToolbarButton
                icon={Minus}
                title="Insert Horizontal Rule"
                onClick={() => insertHTML('<hr style="margin: 10px 0; border: none; border-top: 1px solid #ccc;" />')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for image uploads */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onInput={handleInput}
        onFocus={() => {
          setIsEditorFocused(true);
          saveState(); // Save initial state when focusing
        }}
        onBlur={() => setIsEditorFocused(false)}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        className={`p-4 outline-none ${readOnly ? 'bg-gray-50' : 'bg-white'}`}
        style={{ minHeight: `${minHeight}px` }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Click outside to close color picker */}
      {showColorPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowColorPicker(false)}
        />
      )}

      {/* Enhanced Styles */}
      <style jsx>{`
        [contenteditable] hr {
          margin: 1.5em 0;
          border: none;
          border-top: 1px solid #ccc;
        }
        
        [contenteditable] *:first-child {
          margin-top: 0;
        }
        
        [contenteditable] *:last-child {
          margin-bottom: 0;
        }
        
        /* Focus styles for better UX */
        [contenteditable]:focus {
          outline: none;
        }
        
        /* Improved selection styles */
        [contenteditable] ::selection {
          background-color: #0AAC9E20;
        }
        
        /* Better spacing for nested lists */
        [contenteditable] ul ul,
        [contenteditable] ol ol,
        [contenteditable] ul ol,
        [contenteditable] ol ul {
          margin: 0.5em 0;
        }
        
        /* Improved table hover effects */
        [contenteditable] table:hover {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        [contenteditable] tr:hover {
          background-color: #f9f9f9;
        }
        
        /* Better link styling */
        [contenteditable] a {
          transition: color 0.2s ease;
          text-decoration-thickness: 1px;
          text-underline-offset: 2px;
        }
        
        /* Improved code styling */
        [contenteditable] pre code {
          background: none;
          padding: 0;
          border-radius: 0;
        }
        
        /* Better blockquote styling */
        [contenteditable] blockquote p {
          margin: 0.5em 0;
        }
        
        [contenteditable] blockquote:first-child {
          margin-top: 0;
        }
        
        [contenteditable] blockquote:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default SimpleRichTextEditor;