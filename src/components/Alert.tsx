import React from "react";

interface AlertProps {
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, title, message, onClose }) => {
  const alertClasses = {
    success: "alert-success",
    error: "alert-error",
  };

  return (
    <div
      className={`alert ${alertClasses[type]} shadow-lg animate-fade-in my-4`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div>
        <h3 className="font-bold">{title}</h3>
        <div className="text-xs">{message}</div>
      </div>
      <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
        ✕
      </button>
    </div>
  );
};

export default Alert;
