import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../contexts/AppContextProvider";
import Loading from "./Loading"; // <-- นำเข้า Loading component

const ProtectedRoute: React.FC = () => {
  // REVISED: ดึง authLoading มาใช้ด้วย
  const { currentUser, authLoading } = useApp();

  // 1. ถ้าระบบกำลังตรวจสอบสถานะ Login ให้แสดงหน้า Loading ก่อน
  if (authLoading) {
    return <Loading />;
  }

  // 2. เมื่อตรวจสอบเสร็จแล้ว ค่อยตัดสินใจ
  //    - ถ้ามี currentUser ให้ไปหน้าลูก (Outlet)
  //    - ถ้าไม่มี ให้ไปหน้า Login
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
