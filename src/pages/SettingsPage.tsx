import React, { useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useApp } from "../contexts/AppContextProvider";
import Alert from "../components/Alert";
import PageHeader from "../components/PageHeader";

const SettingsPage: React.FC = () => {
  const { currentUser } = useApp();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentUser) {
      setError("ไม่พบข้อมูลผู้ใช้");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    if (newPassword.length < 6) {
      setError("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email!,
        currentPassword
      );
      // Re-authenticate user before changing password
      await reauthenticateWithCredential(currentUser, credential);

      // If re-authentication is successful, update the password
      await updatePassword(currentUser, newPassword);

      setSuccess("เปลี่ยนรหัสผ่านสำเร็จแล้ว!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      setError("รหัสผ่านปัจจุบันไม่ถูกต้อง หรือเกิดข้อผิดพลาดบางอย่าง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        breadcrumbs={[{ name: "ตั้งค่า", href: "/settings" }]}
        title="ตั้งค่าบัญชี"
      />
      <div className="card bg-base-100 shadow-xl">
        <form className="card-body" onSubmit={handleChangePassword}>
          <h2 className="card-title">เปลี่ยนรหัสผ่าน</h2>
          {error && (
            <Alert
              type="error"
              title="ผิดพลาด"
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

          <div className="form-control">
            <label className="label">
              <span className="label-text">รหัสผ่านปัจจุบัน</span>
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input input-bordered"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">รหัสผ่านใหม่</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input input-bordered"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">ยืนยันรหัสผ่านใหม่</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input input-bordered"
              required
            />
          </div>

          <div className="card-actions justify-end mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading && <span className="loading loading-spinner"></span>}
              บันทึกรหัสผ่านใหม่
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default SettingsPage;
