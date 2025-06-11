// src/contexts/ThemeProvider.tsx
import React, { createContext, useState, useEffect, useContext } from "react";

type Theme = "nord" | "dracula";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// 1. สร้าง Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 2. สร้าง Provider Component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("nord"); // ค่าเริ่มต้นเป็น Light Theme

  useEffect(() => {
    // 3. ตรวจสอบ Theme ที่เคยบันทึกไว้ใน localStorage หรือจาก System Preference
    const savedTheme = localStorage.getItem("theme") as Theme;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme("dracula");
    }
  }, []);

  useEffect(() => {
    // 4. เมื่อ theme เปลี่ยน, ให้ set attribute 'data-theme' ที่ <html> และบันทึกลง localStorage
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "nord" ? "dracula" : "nord"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 5. สร้าง Custom Hook เพื่อให้เรียกใช้ง่าย
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
