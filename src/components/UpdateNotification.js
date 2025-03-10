import React from 'react';

const UpdateNotification = ({ message, confirmButton = false, onConfirm }) => {
  return (
    <div className="update-notification">
      <div className="notification-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span>Software Update</span>
      </div>
      <p>{message}</p>
      {confirmButton && (
        <div className="buttons">
          <button 
            className="cancel-button" 
            onClick={() => {}}
          >
            Later
          </button>
          <button 
            className="confirm-button" 
            onClick={onConfirm}
          >
            Restart Now
          </button>
        </div>
      )}
    </div>
  );
};

export default UpdateNotification;