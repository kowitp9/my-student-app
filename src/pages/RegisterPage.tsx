import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import Alert from "../components/Alert";
import ThemeToggle from "../components/ThemeToggle";

// Icons
const EmailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 opacity-70"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
);
const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 opacity-70"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
      clipRule="evenodd"
    />
  </svg>
);

const RegisterPage: React.FC = () => {
  // State for form inputs, loading, and error messages
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Firebase Registration Logic
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // --- Client-side validation ---
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }
    // --- End validation ---

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/", { replace: true }); // Navigate to homepage on success
    } catch (err: any) {
      // User-friendly error handling
      if (err.code === "auth/email-already-in-use") {
        setError("อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น");
      } else if (err.code === "auth/weak-password") {
        setError("รหัสผ่านไม่ปลอดภัยเกินไป กรุณาตั้งรหัสผ่านใหม่");
      } else if (err.code === "auth/invalid-email") {
        setError("รูปแบบอีเมลไม่ถูกต้อง");
      } else {
        setError("เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง");
      }
      console.error("Firebase Register Error:", err.code, err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      {/* NEW: Theme Toggle Button */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="hero-content flex-col">
        <div className="text-center">
          <h1 className="text-5xl font-bold">สร้างบัญชีใหม่</h1>
          <p className="py-6">
            กรอกข้อมูลเพื่อสมัครสมาชิกและเริ่มต้นใช้งานระบบ
          </p>
        </div>
        {/* DaisyUI Card Layout */}
        <div className="card w-full max-w-sm shrink-0 bg-base-100 shadow-2xl">
          <form className="card-body" onSubmit={handleRegister} noValidate>
            {/* Error Alert Display */}
            {error && (
              <Alert
                type="error"
                title="เกิดข้อผิดพลาด"
                message={error}
                onClose={() => setError("")}
              />
            )}

            {/* Form Controls */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">อีเมล</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <EmailIcon />
                <input
                  type="email"
                  className="grow"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">รหัสผ่าน</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <LockIcon />
                <input
                  type="password"
                  className="grow"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <label className="label">
                <span className="label-text-alt">อย่างน้อย 6 ตัวอักษร</span>
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">ยืนยันรหัสผ่าน</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <LockIcon />
                <input
                  type="password"
                  className="grow"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </label>
            </div>
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading && <span className="loading loading-spinner"></span>}
                สมัครสมาชิก
              </button>
            </div>
            <div className="divider text-sm">มีบัญชีอยู่แล้ว?</div>
            <Link to="/login" className="btn btn-outline">
              ไปหน้าเข้าสู่ระบบ
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
