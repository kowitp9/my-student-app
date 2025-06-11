import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
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

const LoginPage: React.FC = () => {
  // State for form inputs, loading, and error messages
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // NEW: State and Ref for reset password modal
  const [resetEmail, setResetEmail] = useState("");
  const resetModalRef = useRef<HTMLDialogElement>(null);
  // Firebase Login Logic
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/", { replace: true }); // Navigate to homepage on success
    } catch (err: any) {
      // User-friendly error handling
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else if (err.code === "auth/invalid-email") {
        setError("รูปแบบอีเมลไม่ถูกต้อง");
      } else {
        setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง");
      }
      console.error("Firebase Login Error:", err.code, err.message);
    } finally {
      setLoading(false); // Stop loading state
    }
  }; // NEW: Forgot Password Logic
  const handlePasswordReset = async () => {
    if (!resetEmail) {
      alert("กรุณากรอกอีเมลของคุณ");
      return;
    }
    setError("");
    setSuccess("");
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setSuccess(
        `ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ ${resetEmail} แล้ว (โปรดตรวจสอบใน Junk/Spam หากไม่พบ)`
      );
      resetModalRef.current?.close();
    } catch (err: any) {
      setError("ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้ อาจไม่มีอีเมลนี้ในระบบ");
    }
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left lg:pl-10">
          <h1 className="text-5xl font-bold">เข้าสู่ระบบ</h1>
          <p className="py-6">
            ยินดีต้อนรับสู่ระบบจัดการข้อมูลนักเรียน
            กรุณาเข้าสู่ระบบเพื่อเริ่มต้นใช้งาน
          </p>
        </div>
        {/* DaisyUI Card Layout */}
        <div className="card w-full max-w-sm shrink-0 bg-base-100 shadow-2xl">
          <form className="card-body" onSubmit={handleLogin} noValidate>
            {/* Error Alert Display */}
            {error && (
              <Alert
                type="error"
                title="เกิดข้อผิดพลาด"
                message={error}
                onClose={() => setError("")}
              />
            )}
            {success && (
              <Alert
                type="success"
                title="สำเร็จ"
                message={success}
                onClose={() => setSuccess("")}
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
                <button
                  type="button"
                  onClick={() => resetModalRef.current?.showModal()}
                  className="label-text-alt link link-hover"
                >
                  ลืมรหัสผ่าน?
                </button>
              </label>
            </div>
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading && <span className="loading loading-spinner"></span>}
                เข้าสู่ระบบ
              </button>
            </div>
            <div className="divider text-sm">ยังไม่มีบัญชี?</div>
            <Link to="/register" className="btn btn-outline btn-primary">
              สมัครสมาชิก
            </Link>
          </form>
        </div>
      </div>
      {/* NEW: Forgot Password Modal */}
      <dialog ref={resetModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">รีเซ็ตรหัสผ่าน</h3>
          <p className="py-4">
            กรอกอีเมลของคุณเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่
          </p>
          <div className="form-control">
            <label className="input input-bordered flex items-center gap-2">
              <EmailIcon />
              <input
                type="email"
                className="grow"
                placeholder="email@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </label>
          </div>
          <div className="modal-action">
            <form method="dialog" className="w-full flex justify-end gap-2">
              <button className="btn btn-ghost">ยกเลิก</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePasswordReset}
              >
                ส่งอีเมล
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default LoginPage;
