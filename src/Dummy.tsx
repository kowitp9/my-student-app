import React, { useMemo } from "react";
import { Outlet, Link, useLocation } from "react-router-dom"; // 1. นำเข้า useLocation
import { useApp } from "../contexts/AppContextProvider";
import ThemeToggle from "./ThemeToggle";
import Toast from "./Toast";

// ... (โค้ด Icons และ formatTimeAgo เหมือนเดิมทั้งหมด) ...

const Layout: React.FC = () => {
  const {
    currentUser,
    logout,
    notifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
  } = useApp();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const latestUnreadNotification = useMemo(
    () => notifications.find((n) => !n.read),
    [notifications]
  );

  // 2. ดึงข้อมูล location ปัจจุบัน
  const location = useLocation();

  return (
    <div className="min-h-screen bg-base-200 font-sans" data-theme="cupcake">
      {latestUnreadNotification && (
        <Toast
          key={latestUnreadNotification.id}
          message={`${
            latestUnreadNotification.type === "added"
              ? "📝 เพิ่ม:"
              : latestUnreadNotification.type === "modified"
              ? "🔄️ แก้ไข:"
              : "🗑️ ลบ:"
          } ${latestUnreadNotification.studentName}`}
          onDismiss={() => markNotificationAsRead(latestUnreadNotification.id)}
        />
      )}

      <header className="navbar bg-base-100 shadow-lg sticky top-0 z-30">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl">
            ระบบข้อมูลนักเรียน
          </Link>
        </div>

        <div className="navbar-end gap-2">
          {/* ... (Navbar-end ทั้งหมดเหมือนเดิม) ... */}
        </div>
      </header>

      <main className="p-4 md:p-8">
        {/* 3. เพิ่ม key ให้กับ Outlet โดยใช้ pathname ของ URL */}
        {/* นี่คือหัวใจของการแก้ไขครับ */}
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
};

export default Layout;
