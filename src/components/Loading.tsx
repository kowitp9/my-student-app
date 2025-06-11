import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-base-200">
      <div className="text-center">
        <span className="loading loading-dots loading-lg text-primary"></span>
        <p className="mt-4 text-lg">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );
};

export default Loading;
