import React from 'react';

const Modal = ({ isOpen, onClose, onSave, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          {children}
          <div className="modal-buttons">
            <button className="save" onClick={onSave}>Save</button>
            <button className="close" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
