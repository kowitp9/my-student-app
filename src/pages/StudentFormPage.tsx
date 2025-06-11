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
    <label className="label">
      <span className="label-text">{label}</span>
    </label>
    {children}
    <div className="label h-6">
      {error ? (
        <span className="label-text-alt text-error">{error}</span>
      ) : helperText ? (
        <span className="label-text-alt opacity-70">{helperText}</span>
      ) : null}
    </div>
  </div>
);

// --- REVISED AND FIXED: 3-Dropdown Date Picker Component ---
const CustomDatePicker: React.FC<{
  initialDate: string;
  onChange: (date: string) => void;
  hasError?: boolean;
}> = ({ initialDate, onChange, hasError }) => {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Sync with parent state when editing an existing student
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

  // Call parent onChange when all parts are selected
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
      </select>
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
      </select>
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
      </select>
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
      // ถ้ามี students ใน context แล้ว ให้ค้นหาเลย
      if (students.length > 0) {
        const studentToEdit = students.find((s) => s.docId === docId);
        if (studentToEdit) {
          // แปลงชื่อชั้นให้เป็นชื่อเต็มก่อนนำไปใส่ในฟอร์ม
          setFormData({
            ...studentToEdit,
            classLevel: formatClassName(studentToEdit.classLevel),
          });
          setStudentExists(true);
        } else {
          // ถ้าค้นหาแล้วไม่เจอจริงๆ
          setStudentExists(false);
        }
        setIsLoading(false);
      }
      // ถ้ายังไม่มี students ให้รอ (isLoading ยังเป็น true)
    } else {
      setFormData(initialFormState);
      setIsLoading(false);
    }
  }, [docId, isEditing, students]);

  const handleUseParentInfo = (type: "father" | "mother") => {
    const source = type === "father" ? formData.father : formData.mother;
    setFormData((prev) => ({
      ...prev,
      parent: {
        ...prev.parent,
        title: source.title,
        titleOther: source.titleOther,
        firstName: source.firstName,
        lastName: source.lastName,
        occupation: source.occupation,
        phoneNumber: source.phoneNumber,
        relationship: type === "father" ? "บิดา" : "มารดา",
      },
    }));
  };

  const handleClearParentInfo = () => {
    setFormData((prev) => ({ ...prev, parent: initialFormState.parent }));
  };

  const calculatedAge = useMemo(() => {
    if (!formData.birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(formData.birthDate))
      return null;
    const birth = new Date(formData.birthDate);
    if (isNaN(birth.getTime())) return null;
    let age = new Date().getFullYear() - birth.getFullYear();
    const m = new Date().getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && new Date().getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? `${age} ปี` : null;
  }, [formData.birthDate]);

  const validate = (): boolean => {
    const newErrors: Record<string, any> = {
      father: {},
      mother: {},
      parent: {},
    };
    if (!formData.firstName.trim()) newErrors.firstName = "กรุณากรอกชื่อ";
    if (!formData.lastName.trim()) newErrors.lastName = "กรุณากรอกนามสกุล";
    if (!formData.id.trim()) newErrors.id = "กรุณากรอกเลขบัตรประชาชน";
    else if (!/^\d{13}$/.test(formData.id))
      newErrors.id = "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก";
    if (
      !formData.birthDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(formData.birthDate)
    ) {
      newErrors.birthDate = "กรุณาเลือก วัน/เดือน/ปีเกิด ให้ครบถ้วน";
    }
    if (!formData.father.firstName.trim())
      newErrors.father.firstName = "กรุณากรอกชื่อบิดา";
    if (!formData.father.lastName.trim())
      newErrors.father.lastName = "กรุณากรอกนามสกุลบิดา";
    if (!formData.mother.firstName.trim())
      newErrors.mother.firstName = "กรุณากรอกชื่อมารดา";
    if (!formData.mother.lastName.trim())
      newErrors.mother.lastName = "กรุณากรอกนามสกุลมารดา";
    if (!formData.parent.firstName.trim())
      newErrors.parent.firstName = "กรุณากรอกชื่อผู้ปกครอง";
    if (!formData.parent.lastName.trim())
      newErrors.parent.lastName = "กรุณากรอกนามสกุลผู้ปกครอง";
    if (!formData.parent.relationship.trim())
      newErrors.parent.relationship = "กรุณาระบุความเกี่ยวข้อง";
    setErrors(newErrors);
    return !Object.values(newErrors).some((val) =>
      typeof val === "object" ? Object.keys(val).length > 0 : !!val
    );
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset alert ก่อน validation
    setAlertState(null);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <Field label="ชื่อ" error={errors.firstName}>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="เช่น สมชาย"
                  className={`input input-bordered w-full ${
                    errors.firstName && "input-error"
                  }`}
                />
              </Field>
              <Field label="นามสกุล" error={errors.lastName}>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="เช่น ใจดี"
                  className={`input input-bordered w-full ${
                    errors.lastName && "input-error"
                  }`}
                />
              </Field>
              <Field label="เลขบัตรประจำตัวประชาชน" error={errors.id}>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                  placeholder="กรอกเลข 13 หลัก"
                  maxLength={13}
                  className={`input input-bordered w-full ${
                    errors.id && "input-error"
                  }`}
                />
              </Field>
              <Field label="เบอร์โทรศัพท์">
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  placeholder="0812345678"
                  className="input input-bordered w-full"
                />
              </Field>
            </div>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4">
              <Field label="เพศ">
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender: e.target.value as Student["gender"],
                    })
                  }
                  className="select select-bordered"
                >
                  <option>ชาย</option>
                  <option>หญิง</option>
                </select>
              </Field>
              <Field label="น้ำหนัก (กก.)">
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  placeholder="เช่น 50"
                  className="input input-bordered w-full"
                />
              </Field>
              <Field label="ส่วนสูง (ซม.)">
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      height:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  placeholder="เช่น 165"
                  className="input input-bordered w-full"
                />
              </Field>
              <Field label="กลุ่มเลือด">
                <select
                  value={formData.bloodGroup}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bloodGroup: e.target.value as Student["bloodGroup"],
                    })
                  }
                  className="select select-bordered"
                >
                  <option>ไม่ทราบ</option>
                  <option>A</option>
                  <option>B</option>
                  <option>AB</option>
                  <option>O</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
              <Field label="เชื้อชาติ">
                <input
                  type="text"
                  value={formData.ethnicity}
                  onChange={(e) =>
                    setFormData({ ...formData, ethnicity: e.target.value })
                  }
                  placeholder="เช่น ไทย"
                  className="input input-bordered w-full"
                />
              </Field>
              <Field label="สัญชาติ">
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) =>
                    setFormData({ ...formData, nationality: e.target.value })
                  }
                  placeholder="เช่น ไทย"
                  className="input input-bordered w-full"
                />
              </Field>
              <Field label="ศาสนา">
                <input
                  type="text"
                  value={formData.religion}
                  onChange={(e) =>
                    setFormData({ ...formData, religion: e.target.value })
                  }
                  placeholder="เช่น พุทธ"
                  className="input input-bordered w-full"
                />
              </Field>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold border-b border-base-300 pb-2 w-full">
              ข้อมูลที่อยู่
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-x-4">
              <Field label="บ้านเลขที่" className="md:col-span-3">
                <input
                  type="text"
                  name="houseNumber"
                  placeholder="123/45"
                  value={formData.address.houseNumber}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      address: { ...p.address, houseNumber: e.target.value },
                    }))
                  }
                  className="input input-bordered w-full"
                />
              </Field>
              <Field label="หมู่" className="md:col-span-3">
                <input
                  type="text"
                  name="moo"
                  placeholder="5"
                  value={formData.address.moo}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      address: { ...p.address, moo: e.target.value },
                    }))
                  }
                  className="input input-bordered w-full"
                />
              </Field>
              <Field label="ถนน/ซอย" className="md:col-span-6">
                <input
                  type="text"
                  name="street"
                  placeholder="ถนนสุขุมวิท"
                  value={formData.address.street}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      address: { ...p.address, street: e.target.value },
                    }))
                  }
                  className="input input-bordered w-full"
                />
              </Field>
              <Field label="ตำบล/แขวง" className="md:col-span-3">
                <input
                  type="text"
                  name="subDistrict"
                  placeholder="คลองเตย"
                  value={formData.address.subDistrict}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      address: { ...p.address, subDistrict: e.target.value },
                    }))
                  }
                  className="input input-bordered w-full"
                />
              </Field>
              <Field label="อำเภอ/เขต" className="md:col-span-3">
                <input
                  type="text"
                  name="district"
                  placeholder="คลองเตย"
                  value={formData.address.district}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      address: { ...p.address, district: e.target.value },
                    }))
                  }
                  className="input input-bordered w-full"
                />
              </Field>
              <Field label="จังหวัด" className="md:col-span-6">
                <input
                  type="text"
                  name="province"
                  placeholder="กรุงเทพมหานคร"
                  value={formData.address.province}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      address: { ...p.address, province: e.target.value },
                    }))
                  }
                  className="input input-bordered w-full"
                />
              </Field>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold border-b border-base-300 pb-2 w-full">
              ข้อมูลครอบครัว
            </legend>
            <div className="p-4 bg-base-200/50 rounded-lg space-y-4">
              <div className="text-md font-medium text-base-content/70">
                ข้อมูลบิดา
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4">
                <Field label="คำนำหน้า" className="md:col-span-1">
                  <select
                    value={formData.father.title}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        father: {
                          ...p.father,
                          title: e.target.value as "นาย" | "อื่น ๆ",
                        },
                      }))
                    }
                    className="select select-bordered"
                  >
                    <option>นาย</option>
                    <option value="อื่น ๆ">อื่น ๆ</option>
                  </select>
                </Field>
                <Field label="ระบุ" className="md:col-span-3">
                  <input
                    type="text"
                    value={formData.father.titleOther}
                    disabled={formData.father.title !== "อื่น ๆ"}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        father: { ...p.father, titleOther: e.target.value },
                      }))
                    }
                    placeholder="กรอกคำนำหน้าชื่ออื่นๆ (ถ้ามี)"
                    className="input input-bordered w-full disabled:bg-base-200/70"
                  />
                </Field>
                <Field
                  label="ชื่อ (บิดา)"
                  className="md:col-span-2"
                  error={errors.father?.firstName}
                >
                  <input
                    type="text"
                    value={formData.father.firstName}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        father: { ...p.father, firstName: e.target.value },
                      }))
                    }
                    className={`input input-bordered w-full ${
                      errors.father?.firstName && "input-error"
                    }`}
                    placeholder="สมศักดิ์"
                  />
                </Field>
                <Field
                  label="นามสกุล (บิดา)"
                  className="md:col-span-2"
                  error={errors.father?.lastName}
                >
                  <input
                    type="text"
                    value={formData.father.lastName}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        father: { ...p.father, lastName: e.target.value },
                      }))
                    }
                    className={`input input-bordered w-full ${
                      errors.father?.lastName && "input-error"
                    }`}
                    placeholder="ใจดี"
                  />
                </Field>
                <Field label="อาชีพ" className="md:col-span-2">
                  <input
                    type="text"
                    value={formData.father.occupation}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        father: { ...p.father, occupation: e.target.value },
                      }))
                    }
                    className="input input-bordered"
                    placeholder="เกษตรกร"
                  />
                </Field>
                <Field label="เบอร์โทรศัพท์" className="md:col-span-2">
                  <input
                    type="tel"
                    value={formData.father.phoneNumber}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        father: { ...p.father, phoneNumber: e.target.value },
                      }))
                    }
                    className="input input-bordered"
                    placeholder="08xxxxxxxx"
                  />
                </Field>
              </div>
            </div>
            <div className="p-4 bg-base-200/50 rounded-lg space-y-4">
              <div className="text-md font-medium text-base-content/70">
                ข้อมูลมารดา
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4">
                <Field label="คำนำหน้า" className="md:col-span-1">
                  <select
                    value={formData.mother.title}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        mother: {
                          ...p.mother,
                          title: e.target.value as "นาง" | "นางสาว" | "อื่น ๆ",
                        },
                      }))
                    }
                    className="select select-bordered"
                  >
                    <option>นาง</option>
                    <option>นางสาว</option>
                    <option value="อื่น ๆ">อื่น ๆ</option>
                  </select>
                </Field>
                <Field label="ระบุ" className="md:col-span-3">
                  <input
                    type="text"
                    value={formData.mother.titleOther}
                    disabled={formData.mother.title !== "อื่น ๆ"}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        mother: { ...p.mother, titleOther: e.target.value },
                      }))
                    }
                    placeholder="กรอกคำนำหน้าชื่ออื่นๆ (ถ้ามี)"
                    className="input input-bordered w-full disabled:bg-base-200/70"
                  />
                </Field>
                <Field
                  label="ชื่อ (มารดา)"
                  className="md:col-span-2"
                  error={errors.mother?.firstName}
                >
                  <input
                    type="text"
                    value={formData.mother.firstName}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        mother: { ...p.mother, firstName: e.target.value },
                      }))
                    }
                    className={`input input-bordered w-full ${
                      errors.mother?.firstName && "input-error"
                    }`}
                    placeholder="สมศรี"
                  />
                </Field>
                <Field
                  label="นามสกุล (มารดา)"
                  className="md:col-span-2"
                  error={errors.mother?.lastName}
                >
                  <input
                    type="text"
                    value={formData.mother.lastName}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        mother: { ...p.mother, lastName: e.target.value },
                      }))
                    }
                    className={`input input-bordered w-full ${
                      errors.mother?.lastName && "input-error"
                    }`}
                    placeholder="ใจดี"
                  />
                </Field>
                <Field label="อาชีพ" className="md:col-span-2">
                  <input
                    type="text"
                    value={formData.mother.occupation}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        mother: { ...p.mother, occupation: e.target.value },
                      }))
                    }
                    className="input input-bordered"
                    placeholder="ค้าขาย"
                  />
                </Field>
                <Field label="เบอร์โทรศัพท์" className="md:col-span-2">
                  <input
                    type="tel"
                    value={formData.mother.phoneNumber}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        mother: { ...p.mother, phoneNumber: e.target.value },
                      }))
                    }
                    className="input input-bordered"
                    placeholder="08xxxxxxxx"
                  />
                </Field>
              </div>
            </div>
            <div className="divider">ข้อมูลผู้ปกครอง</div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm">จัดการข้อมูล:</span>
              <button
                type="button"
                className="btn btn-xs btn-outline"
                onClick={() => handleUseParentInfo("father")}
              >
                ใช้ข้อมูลบิดา
              </button>
              <button
                type="button"
                className="btn btn-xs btn-outline"
                onClick={() => handleUseParentInfo("mother")}
              >
                ใช้ข้อมูลมารดา
              </button>
              <button
                type="button"
                className="btn btn-xs btn-outline btn-error"
                onClick={handleClearParentInfo}
              >
                ล้างข้อมูลผู้ปกครอง
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4">
              <Field label="คำนำหน้า (ผู้ปกครอง)" className="md:col-span-1">
                <select
                  value={formData.parent.title}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      parent: {
                        ...p.parent,
                        title: e.target.value as
                          | "นาย"
                          | "นาง"
                          | "นางสาว"
                          | "อื่น ๆ",
                      },
                    }))
                  }
                  className="select select-bordered"
                >
                  <option>นาย</option>
                  <option>นาง</option>
                  <option>นางสาว</option>
                  <option value="อื่น ๆ">อื่น ๆ</option>
                </select>
              </Field>
              <Field label="ระบุ" className="md:col-span-3">
                <input
                  type="text"
                  value={formData.parent.titleOther}
                  disabled={formData.parent.title !== "อื่น ๆ"}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      parent: { ...p.parent, titleOther: e.target.value },
                    }))
                  }
                  placeholder="กรอกคำนำหน้าชื่ออื่นๆ (ถ้ามี)"
                  className="input input-bordered w-full disabled:bg-base-200/70"
                />
              </Field>
              <Field
                label="ชื่อ (ผู้ปกครอง)"
                className="md:col-span-2"
                error={errors.parent?.firstName}
              >
                <input
                  type="text"
                  value={formData.parent.firstName}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      parent: { ...p.parent, firstName: e.target.value },
                    }))
                  }
                  className={`input input-bordered w-full ${
                    errors.parent?.firstName && "input-error"
                  }`}
                  placeholder="ชื่อจริง"
                />
              </Field>
              <Field
                label="นามสกุล (ผู้ปกครอง)"
                className="md:col-span-2"
                error={errors.parent?.lastName}
              >
                <input
                  type="text"
                  value={formData.parent.lastName}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      parent: { ...p.parent, lastName: e.target.value },
                    }))
                  }
                  className={`input input-bordered w-full ${
                    errors.parent?.lastName && "input-error"
                  }`}
                  placeholder="นามสกุล"
                />
              </Field>
              <Field label="อาชีพ" className="md:col-span-2">
                <input
                  type="text"
                  value={formData.parent.occupation}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      parent: { ...p.parent, occupation: e.target.value },
                    }))
                  }
                  className="input input-bordered"
                  placeholder="อาชีพ"
                />
              </Field>
              <Field label="เบอร์โทรศัพท์" className="md:col-span-2">
                <input
                  type="tel"
                  value={formData.parent.phoneNumber}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      parent: { ...p.parent, phoneNumber: e.target.value },
                    }))
                  }
                  className="input input-bordered"
                  placeholder="เบอร์โทรศัพท์"
                />
              </Field>
              <Field
                label="ความเกี่ยวข้อง"
                className="md:col-span-2"
                error={errors.parent?.relationship}
              >
                <input
                  type="text"
                  value={formData.parent.relationship}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      parent: { ...p.parent, relationship: e.target.value },
                    }))
                  }
                  placeholder="เช่น บิดา, ป้า"
                  className={`input input-bordered ${
                    errors.parent?.relationship && "input-error"
                  }`}
                />
              </Field>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold border-b border-base-300 pb-2 w-full">
              ข้อมูลอื่นๆ
            </legend>
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  checked={formData.disability.hasDisability}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      disability: {
                        ...p.disability,
                        hasDisability: e.target.checked,
                      },
                    }))
                  }
                  className="checkbox checkbox-primary"
                />
                <span className="label-text">มีความด้อยโอกาส/พิการ</span>
              </label>
              <Field label="ระบุความด้อยโอกาส/พิการ" className="mt-2">
                <input
                  type="text"
                  value={formData.disability.description}
                  disabled={!formData.disability.hasDisability}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      disability: {
                        ...p.disability,
                        description: e.target.value,
                      },
                    }))
                  }
                  className="input input-bordered w-full disabled:bg-base-200/70"
                  placeholder="กรอกรายละเอียด (เมื่อเลือก 'มีความด้อยโอกาส')"
                />
              </Field>
            </div>
            <Field label="การทำประกันอุบัติเหตุ">
              <select
                name="insurance"
                value={formData.insurance}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    insurance: e.target.value as Student["insurance"],
                  }))
                }
                className="select select-bordered"
              >
                <option>ทำประกัน</option>
                <option>ไม่ได้ทำประกัน</option>
              </select>
            </Field>
          </fieldset>
        </div>

        <div className="card-actions justify-end p-6 border-t border-base-300">
          {/* REVISED: เปลี่ยน onClick ให้เป็นการ "ย้อนกลับ" และ disable ปุ่มตอนกำลังบันทึก */}
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
