// src/App.tsx
import { Routes, Route } from "react-router-dom"; // <-- ไม่ต้องมี BrowserRouter แล้ว
import { AppProvider } from "./contexts/AppContextProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SettingsPage from "./pages/SettingsPage";
import StudentPage from "./components/StudentPage";
import StudentDetailPage from "./pages/StudentDetailPage";
import StudentFormPage from "./pages/StudentFormPage";

function App() {
  return (
    <AppProvider>
      {/* ไม่ต้องมี <Router> ที่นี่แล้ว */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<Layout />}>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<StudentPage />} />
            <Route path="/student/:docId" element={<StudentDetailPage />} />
            <Route path="/student/new" element={<StudentFormPage />} />
            <Route path="/student/:docId/edit" element={<StudentFormPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </AppProvider>
  );
}

export default App;
