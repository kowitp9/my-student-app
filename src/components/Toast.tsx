// src/components/Toast.tsx
import React, { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  duration?: number;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  duration = 4000,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        // Wait for fade-out animation before fully dismissing
        setTimeout(onDismiss, 500);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onDismiss]);

  return (
    <div
      className={`toast toast-top toast-center z-50 transition-all duration-500 ${
        visible ? "opacity-100" : "opacity-0 -translate-y-10"
      }`}
    >
      <div className="alert alert-info shadow-lg">
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast;
