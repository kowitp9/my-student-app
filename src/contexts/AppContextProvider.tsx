import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, type User, signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import type { Student, AppNotification } from "../types";
import { auth, db } from "../firebaseConfig";

interface AppContextType {
  theme: "nord" | "dracula";
  toggleTheme: () => void;
  currentUser: User | null;
  authLoading: boolean;
  students: Student[];
  addStudent: (student: Student) => Promise<void>;
  updateStudent: (docId: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (docId: string) => Promise<void>;
  logout: () => Promise<void>;
  notifications: AppNotification[];
  markAllNotificationsAsRead: () => void;
  markNotificationAsRead: (notificationId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<"nord" | "dracula">("nord");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "nord" | "dracula";
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "nord" ? "dracula" : "nord"));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setStudents([]);
      setNotifications([]);
      return;
    }
    const q = query(collection(db, "students"), orderBy("firstName", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const studentsData: Student[] = [];
      querySnapshot.docChanges().forEach((change) => {
        if (
          !isInitialLoad &&
          (change.type === "added" || change.type === "modified") &&
          !change.doc.metadata.hasPendingWrites
        ) {
          const studentData = change.doc.data() as Student;
          const newNotification: AppNotification = {
            id: `${Date.now()}-${change.doc.id}`,
            type: change.type,
            studentName: `${studentData.firstName} ${studentData.lastName}`,
            timestamp: new Date(),
            read: false,
          };
          setNotifications((prev) => [newNotification, ...prev].slice(0, 10));
        }
      });

      querySnapshot.forEach((doc) => {
        studentsData.push({ ...(doc.data() as Student), docId: doc.id });
      });
      setStudents(studentsData);
      setIsInitialLoad(false); // NEW: เมื่อโหลดข้อมูลครั้งแรกเสร็จสิ้น ให้ตั้งค่าเป็น false
    });
    return () => {
      unsubscribe();
      setIsInitialLoad(true); // Reset เมื่อ unmount
    };
  }, [currentUser]);

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // ฟังก์ชันสำหรับซ่อน Toast ทีละอัน
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const addStudent = async (student: Student) => {
    // แยก docId ออกไปก่อนบันทึก เพราะมันเป็น ID ของ Firestore ไม่ใช่ข้อมูลใน document
    const { docId, ...studentData } = student;
    await addDoc(collection(db, "students"), studentData);
  };
  const updateStudent = async (docId: string, data: Partial<Student>) => {
    const studentDoc = doc(db, "students", docId);
    await updateDoc(studentDoc, data);
  };
  const deleteStudent = async (docId: string) => {
    await deleteDoc(doc(db, "students", docId));
  };
  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    theme,
    toggleTheme,
    currentUser,
    authLoading,
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    logout,
    notifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    toast: null,
  };

  return (
    <AppContext.Provider value={value}>
      {!authLoading && children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
