import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Student } from "../types";
import { useApp } from "../contexts/AppContextProvider";
import ConfirmationModal from "../components/ConfirmationModal";
import PageHeader from "../components/PageHeader";
import Loading from "../components/Loading";
import Alert from "../components/Alert";
import { formatClassName } from "../utils/formatters";

// --- Reusable Field Component ---
const Field: React.FC<{
  label: string;
  helperText?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, helperText, error, children, className }) => (
  <div className={`form-control w-full ${className}`}>
    {" "}
    <label className="label">
      <span className="label-text">{label}</span>
    </label>{" "}
    {children}{" "}
    <div className="label h-6">
      {error ? (
        <span className="label-text-alt text-error">{error}</span>
      ) : helperText ? (
        <span className="label-text-alt opacity-70">{helperText}</span>
      ) : null}
    </div>{" "}
  </div>
);

// --- 3-Dropdown Date Picker Component ---
const CustomDatePicker: React.FC<{
  initialDate: string;
  onChange: (date: string) => void;
  hasError?: boolean;
}> = ({ initialDate, onChange, hasError }) => {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    if (initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)) {
      const [y, m, d] = initialDate.split("-");
      setDay(d);
      setMonth(m);
      setYear(y);
    } else {
      setDay("");
      setMonth("");
      setYear("");
    }
  }, [initialDate]);

  useEffect(() => {
    if (day && month && year) {
      onChange(`${year}-${month}-${day}`);
    }
  }, [day, month, year, onChange]);

  const currentADYear = new Date().getFullYear();
  const yearsAD = Array.from({ length: 50 }, (_, i) =>
    String(currentADYear - 7 - i)
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const days = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  return (
    <div className="grid grid-cols-3 gap-2">
      {" "}
      <select
        value={day}
        onChange={(e) => setDay(e.target.value)}
        className={`select select-bordered ${hasError && "select-error"}`}
      >
        <option value="" disabled>
          วัน
        </option>
        {days.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>{" "}
      <select
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className={`select select-bordered ${hasError && "select-error"}`}
      >
        <option value="" disabled>
          เดือน
        </option>
        {months.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>{" "}
      <select
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className={`select select-bordered ${hasError && "select-error"}`}
      >
        <option value="" disabled>
          ปี (พ.ศ.)
        </option>
        {yearsAD.map((y) => (
          <option key={y} value={y}>
            {parseInt(y) + 543}
          </option>
        ))}
      </select>{" "}
    </div>
  );
};

const StudentFormPage: React.FC = () => {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const { students, addStudent, updateStudent } = useApp();
  const isEditing = Boolean(docId);
  const classLevels = [
    "อนุบาล 2",
    "อนุบาล 3",
    "ประถมศึกษาปีที่ 1",
    "ประถมศึกษาปีที่ 2",
    "ประถมศึกษาปีที่ 3",
    "ประถมศึกษาปีที่ 4",
    "ประถมศึกษาปีที่ 5",
    "ประถมศึกษาปีที่ 6",
    "มัธยมศึกษาปีที่ 1",
    "มัธยมศึกษาปีที่ 2",
    "มัธยมศึกษาปีที่ 3",
  ];

  const initialFormState: Student = {
    docId: "",
    id: "",
    studentId: "",
    classLevel: "อนุบาล 2",
    title: "เด็กชาย",
    titleOther: "",
    firstName: "",
    lastName: "",
    gender: "ชาย",
    birthDate: "",
    phoneNumber: "",
    weight: "",
    height: "",
    bloodGroup: "ไม่ทราบ",
    ethnicity: "",
    nationality: "",
    religion: "",
    address: {
      houseNumber: "",
      moo: "",
      street: "",
      subDistrict: "",
      district: "",
      province: "",
    },
    father: {
      title: "นาย",
      titleOther: "",
      firstName: "",
      lastName: "",
      occupation: "",
      phoneNumber: "",
    },
    mother: {
      title: "นาง",
      titleOther: "",
      firstName: "",
      lastName: "",
      occupation: "",
      phoneNumber: "",
    },
    parent: {
      title: "นาย",
      titleOther: "",
      firstName: "",
      lastName: "",
      occupation: "",
      relationship: "",
      phoneNumber: "",
    },
    disability: { hasDisability: false, description: "" },
    insurance: "ทำประกัน",
  };

  const [formData, setFormData] = useState<Student>(initialFormState);
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [studentExists, setStudentExists] = useState(true);

  useEffect(() => {
    if (isEditing) {
      if (students.length > 0) {
        const studentToEdit = students.find((s) => s.docId === docId);
        if (studentToEdit) {
          setFormData({
            ...studentToEdit,
            classLevel: formatClassName(studentToEdit.classLevel),
          });
          setStudentExists(true);
        } else {
          setStudentExists(false);
        }
        setIsLoading(false);
      }
    } else {
      setFormData(initialFormState);
      setIsLoading(false);
    }
  }, [docId, isEditing, students]);

  const handleUseParentInfo = (type: "father" | "mother") => {
    /* ... */
  };
  const handleClearParentInfo = () => {
    /* ... */
  };
  const calculatedAge = useMemo(() => {
    /* ... */
  }, [formData.birthDate]);
  const validate = () => {
    /* ... */ return true;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsModalOpen(true);
    }
  };

  const handleConfirmSave = async () => {
    setIsModalOpen(false);
    const studentToSave: Omit<Student, "docId"> = {
      ...formData,
      weight: Number(formData.weight) || 0,
      height: Number(formData.height) || 0,
      classLevel: formatClassName(formData.classLevel),
    };
    delete (studentToSave as any).docId;

    try {
      if (isEditing && docId) {
        await updateStudent(docId, studentToSave);
        navigate(`/student/${docId}`, { replace: true });
      } else {
        await addStudent(studentToSave);
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Save failed:", error);
      setAlertState({
        isOpen: true,
        type: "error",
        title: "บันทึกข้อมูลไม่สำเร็จ",
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล",
      });
    }
  };

  if (isEditing && isLoading) {
    return <Loading />;
  }
  if (isEditing && !studentExists) {
    return (
      <div className="text-center p-10 text-error text-2xl">
        ไม่พบข้อมูลนักเรียนที่ระบุ
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { name: "รายชื่อนักเรียน", href: "/" },
          { name: isEditing ? "แก้ไขข้อมูล" : "เพิ่มรายคน", href: "#" },
        ]}
        title={
          isEditing
            ? `แก้ไขข้อมูล: ${formData.firstName}`
            : "เพิ่มข้อมูลนักเรียนรายคน"
        }
      />
      {alertState?.isOpen && (
        <Alert
          type={alertState.type}
          title={alertState.title}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}
      <form
        onSubmit={handleSubmit}
        className="card bg-base-100 shadow-xl"
        noValidate
      >
        <div className="card-body p-6 md:p-8 space-y-12">
          {/* All Fieldsets and Fields using direct state updates */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold border-b border-base-300 pb-2 w-full">
              ข้อมูลการศึกษา
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <Field
                label="เลขประจำตัวนักเรียน"
                error={errors.studentId}
                helperText="กรอกตัวเลข 4 หลัก"
              >
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, studentId: e.target.value }))
                  }
                  placeholder="เช่น 1234"
                  maxLength={4}
                  className={`input input-bordered w-full ${
                    errors.studentId && "input-error"
                  }`}
                />
              </Field>
              <Field label="ระดับชั้น">
                <select
                  value={formData.classLevel}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, classLevel: e.target.value }))
                  }
                  className="select select-bordered"
                >
                  {classLevels.map((level) => (
                    <option key={level} value={level}>
                      ชั้น {level}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold border-b border-base-300 pb-2 w-full">
              ข้อมูลส่วนตัวและสุขภาพ
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-x-4 items-end">
              <Field label="คำนำหน้า" className="md:col-span-2">
                <select
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      title: e.target.value as Student["title"],
                    }))
                  }
                  className="select select-bordered w-full"
                >
                  <option>เด็กชาย</option>
                  <option>เด็กหญิง</option>
                  <option>นาย</option>
                  <option>นางสาว</option>
                  <option value="อื่น ๆ">อื่น ๆ</option>
                </select>
              </Field>
              <Field label="ระบุคำนำหน้า" className="md:col-span-4">
                <input
                  type="text"
                  value={formData.titleOther}
                  disabled={formData.title !== "อื่น ๆ"}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, titleOther: e.target.value }))
                  }
                  placeholder="กรอกคำนำหน้าชื่ออื่นๆ (ถ้ามี)"
                  className="input input-bordered w-full disabled:bg-base-200/70"
                />
              </Field>
            </div>
            {/* Other fields... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 items-start">
              <Field label="วัน/เดือน/ปีเกิด" error={errors.birthDate}>
                <CustomDatePicker
                  initialDate={formData.birthDate}
                  onChange={(date) =>
                    setFormData((p) => ({ ...p, birthDate: date }))
                  }
                  hasError={!!errors.birthDate}
                />
              </Field>
              <Field label="อายุ (คำนวณอัตโนมัติ)">
                <div className="input input-bordered bg-base-200 flex items-center h-12">
                  {calculatedAge || "-"}
                </div>
              </Field>
            </div>
            {/* More fields... */}
          </fieldset>

          {/* Other fieldsets... */}
        </div>
        <div className="card-actions justify-end p-6 border-t border-base-300">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-ghost"
          >
            ยกเลิก
          </button>
          <button type="submit" className="btn btn-primary">
            บันทึกข้อมูล
          </button>
        </div>
      </form>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="ยืนยันการบันทึก"
        message="คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?"
      />
    </div>
  );
};

export default StudentFormPage;
