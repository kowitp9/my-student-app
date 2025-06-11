import React, { useMemo } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useApp } from "../contexts/AppContextProvider";
import ThemeToggle from "./ThemeToggle";
import Toast from "./Toast";

// --- Icons (ตรวจสอบให้แน่ใจว่ามีครบทุกอันที่นี่) ---
const BellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);
const UserCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "เมื่อสักครู่";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  return `${days} วันที่แล้ว`;
}

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

        {/* REVISED: เรียงลำดับปุ่มใหม่ */}
        <div className="navbar-end gap-2">
          {/* 1. ปุ่มแจ้งเตือน */}
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle"
              onClick={markAllNotificationsAsRead}
            >
              <div className="indicator">
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="badge badge-sm badge-primary indicator-item">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
            </button>
            <div
              tabIndex={0}
              className="dropdown-content z-[1] mt-4 card card-compact w-80 max-h-96 overflow-y-auto bg-base-100 shadow"
            >
              <div className="card-body p-1">
                <h3 className="card-title text-sm gap-2 px-1 pt-2">
                  การแจ้งเตือนล่าสุด
                </h3>
                <div className="divider my-0"></div>
                <ul className="menu p-0 text-sm">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <li key={n.id} className="disabled">
                        <div className="flex flex-row justify-between items-start w-full p-2">
                          <div className="flex items-start gap-2">
                            <span className="text-lg pt-1">
                              {n.type === "added"
                                ? "📝"
                                : n.type === "modified"
                                ? "🔄️"
                                : "🗑️"}
                            </span>
                            <div className="flex flex-col">
                              <p className="whitespace-normal text-wrap">
                                {n.type === "added" && "เพิ่ม:"}
                                {n.type === "modified" && "แก้ไข:"}
                                {n.type === "removed" && "ลบ:"}
                                <span className="font-semibold ml-1">
                                  {n.studentName}
                                </span>
                              </p>
                            </div>
                          </div>
                          <span className="text-xs opacity-60 flex-shrink-0">
                            {formatTimeAgo(n.timestamp)}
                          </span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="p-4 text-center text-sm opacity-70">
                      ไม่มีการแจ้งเตือน
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* 2. เมนูผู้ใช้ */}
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <UserCircleIcon />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-64 mt-4"
            >
              <div className="flex items-center gap-2 px-3 py-2">
                <UserCircleIcon />
                <span className="font-semibold truncate ">
                  {currentUser?.email}
                </span>
              </div>
              <div className="divider my-0"></div>
              <li>
                <Link to="/settings">
                  <SettingsIcon /> ตั้งค่าบัญชี
                </Link>
              </li>
              <li>
                <button onClick={logout} className="text-error">
                  <LogoutIcon /> ออกจากระบบ
                </button>
              </li>
            </ul>
          </div>

          {/* 3. ปุ่มสลับ Theme */}
          <ThemeToggle />
        </div>
      </header>

      <main className="p-4 md:p-8">
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
};

export default Layout;
