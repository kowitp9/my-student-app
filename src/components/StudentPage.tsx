import React, { useState, useMemo, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Papa from "papaparse";
import type { Student } from "../types";
import { useApp } from "../contexts/AppContextProvider";
import ConfirmationModal from "./ConfirmationModal";
import Alert from "./Alert";
import { formatClassName } from "../utils/formatters";

// --- Icons ---
const SearchIcon = () => (
  <svg
    className="h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
      clipRule="evenodd"
    />
  </svg>
);
const UserPlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M11 5a3 3 0 11-6 0 3 3 0 016 0zM2.75 16.5a.75.75 0 000-1.5h-1a.75.75 0 000 1.5h1zM18.25 16.5a.75.75 0 000-1.5h-1a.75.75 0 000 1.5h1zM11 10.75a.75.75 0 00-1.5 0v1.5h-1.5a.75.75 0 000 1.5h1.5v1.5a.75.75 0 001.5 0v-1.5h1.5a.75.75 0 000-1.5h-1.5v-1.5zM12.75 15a3 3 0 11-6 0 3 3 0 016 0zM17 9.75a.75.75 0 00-1.5 0v1.5h-1.5a.75.75 0 000 1.5h1.5v1.5a.75.75 0 001.5 0v-1.5h1.5a.75.75 0 000-1.5h-1.5v-1.5z" />
  </svg>
);
const ViewIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const DotsVerticalIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
    />
  </svg>
);
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
    />
  </svg>
);
const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.033c-1.12 0-2.033.954-2.033 2.134v.916m7.5 0a48.667 48.667 0 00-7.5 0"
    />
  </svg>
);
const ClearIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
    />
  </svg>
);
// --- NEW HELPER: ฟังก์ชันแปลงวันที่รูปแบบไทย (DD/MM/พ.ศ.) เป็น ISO (YYYY-MM-DD) ---
const convertThaiDateToISO = (thaiDate: string): string => {
  if (!thaiDate || typeof thaiDate !== "string") return "";
  const parts = thaiDate.split(/[/|-]/);
  if (parts.length !== 3) return "";

  const day = parts[0].padStart(2, "0");
  const month = parts[1].padStart(2, "0");
  const buddhistYear = parseInt(parts[2], 10);

  if (isNaN(buddhistYear)) return "";

  const christianYear = buddhistYear > 1000 ? buddhistYear - 543 : buddhistYear;
  return `${christianYear}-${month}-${day}`;
};

// --- FORMAT 1: ฟังก์ชันแปลงข้อมูลจาก Template มาตรฐาน (Header ภาษาอังกฤษ) ---
const transformStandardFormat = (row: any): Student => {
  return {
    studentId: row.studentId || `TEMP_${Date.now()}`,
    id: row.id || "",
    classLevel: formatClassName(row.classLevel) || "ชั้นอนุบาล 2",
    title: (row.title as Student["title"]) || "เด็กชาย",
    titleOther: row.titleOther || "",
    firstName: row.firstName || "",
    lastName: row.lastName || "",
    gender: (row.gender as Student["gender"]) || "ชาย",
    birthDate: row.birthDate || "",
    phoneNumber: row.phoneNumber || "",
    weight: Number(row.weight) || 0,
    height: Number(row.height) || 0,
    bloodGroup: (row.bloodGroup as Student["bloodGroup"]) || "ไม่ทราบ",
    ethnicity: row.ethnicity || "",
    nationality: row.nationality || "",
    religion: row.religion || "",
    address: {
      houseNumber: row.address_houseNumber || "",
      moo: row.address_moo || "",
      street: row.address_street || "",
      subDistrict: row.address_subDistrict || "",
      district: row.address_district || "",
      province: row.address_province || "",
    },
    father: {
      title: (row.father_title as Student["father"]["title"]) || "นาย",
      titleOther: row.father_titleOther || "",
      firstName: row.father_firstName || "",
      lastName: row.father_lastName || "",
      occupation: row.father_occupation || "",
      phoneNumber: row.father_phoneNumber || "",
    },
    mother: {
      title: (row.mother_title as Student["mother"]["title"]) || "นาง",
      titleOther: row.mother_titleOther || "",
      firstName: row.mother_firstName || "",
      lastName: row.mother_lastName || "",
      occupation: row.mother_occupation || "",
      phoneNumber: row.mother_phoneNumber || "",
    },
    parent: {
      title: (row.parent_title as Student["parent"]["title"]) || "นาย",
      titleOther: row.parent_titleOther || "",
      firstName: row.parent_firstName || "",
      lastName: row.parent_lastName || "",
      occupation: row.parent_occupation || "",
      relationship: row.parent_relationship || "",
      phoneNumber: row.parent_phoneNumber || "",
    },
    disability: {
      hasDisability:
        (row.disability_hasDisability || "false").toLowerCase() === "true",
      description: row.disability_description || "",
    },
    insurance: (row.insurance === "ทำประกัน"
      ? "ทำประกัน"
      : "ไม่ได้ทำประกัน") as Student["insurance"],
  };
};

// --- FORMAT 2: ฟังก์ชันแปลงข้อมูลจาก Template พิเศษ (Header ภาษาไทย) ---
const transformSpecialFormat = (row: any): Student => {
  const hasDisability =
    row["ความด้อยโอกาส"] &&
    row["ความด้อยโอกาส"].trim() !== "" &&
    row["ความด้อยโอกาส"].trim().toLowerCase() !== "ไม่มี";
  return {
    studentId: row["เลขประจำตัวนักเรียน"] || `TEMP_${Date.now()}`,
    id: row["เลขบัตรประชาชน"] || "",
    classLevel: formatClassName(row["ชั้น"] || ""), // REVISED
    title: (row["คำนำหน้าชื่อ"] as Student["title"]) || "เด็กชาย",
    firstName: row["ชื่อ"] || "",
    lastName: row["นามสกุล"] || "",
    gender: (row["เพศ"] === "ช"
      ? "ชาย"
      : row["เพศ"] === "ญ"
      ? "หญิง"
      : "ชาย") as Student["gender"],
    birthDate: convertThaiDateToISO(row["วันเกิด"]),
    phoneNumber: row["เบอร์โทรศัพท์"] || "",
    weight: Number(row["น้ำหนัก"]) || 0,
    height: Number(row["ส่วนสูง"]) || 0,
    bloodGroup:
      ((row["กลุ่มเลือด"] === "-"
        ? "ไม่ทราบ"
        : row["กลุ่มเลือด"]) as Student["bloodGroup"]) || "ไม่ทราบ",
    ethnicity: row["เชื้อชาติ"] || "ไทย",
    nationality: row["สัญชาติ"] || "ไทย",
    religion: row["ศาสนา"] || "พุทธ",
    address: {
      houseNumber: row["บ้านเลขที่"] || "",
      moo: row["หมู่"] || "",
      street: (row["ถนน/ซอย"] === "-" ? "" : row["ถนน/ซอย"]) || "",
      subDistrict: row["ตำบล"] || "",
      district: row["อำเภอ"] || "",
      province: row["จังหวัด"] || "",
    },
    father: {
      firstName: (row["ชื่อบิดา"] === "ไม่ปรากฎ" ? "" : row["ชื่อบิดา"]) || "",
      lastName:
        (row["นามสกุลบิดา"] === "ไม่ปรากฎ" ? "" : row["นามสกุลบิดา"]) || "",
      occupation:
        (row["อาชีพของบิดา"] === "ไม่ได้ประกอบอาชีพ"
          ? ""
          : row["อาชีพของบิดา"]) || "",
      title: "นาย",
      titleOther: "",
      phoneNumber: "",
    },
    mother: {
      firstName: row["ชื่อมารดา"] || "",
      lastName: row["นามสกุลมารดา"] || "",
      occupation: row["อาชีพของมารดา"] || "",
      title: "นาง",
      titleOther: "",
      phoneNumber: "",
    },
    parent: {
      firstName: row["ชื่อผู้ปกครอง"] || "",
      lastName: row["นามสกุลผู้ปกครอง"] || "",
      occupation: row["อาชีพของผู้ปกครอง"] || "",
      relationship: row["ความเกี่ยวข้องของผู้ปกครองกับนักเรียน"] || "",
      title: "นาย",
      titleOther: "",
      phoneNumber: "",
    },
    disability: {
      hasDisability: hasDisability,
      description: hasDisability ? row["ความด้อยโอกาส"] : "",
    },
    insurance: "ทำประกัน",
    titleOther: "",
  };
};

const StatusBadge: React.FC<{ status: Student["insurance"] }> = ({
  status,
}) => {
  const active = status === "ทำประกัน";
  const badgeClass = active ? "badge-success" : "badge-ghost";
  const shortText = active ? "ทำ" : "ไม่ได้ทำ";
  return (
    <div className={`badge ${badgeClass} badge-sm`}>
      <span className="hidden sm:inline">{status}</span>
      <span className="sm:hidden">{shortText}</span>
    </div>
  );
};

const StudentPage: React.FC = () => {
  const { students, addStudent, deleteStudent } = useApp();
  const [modalState, setModalState] = useState({
    isOpen: false,
    studentIdToDelete: "",
  });
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const searchTerm = searchParams.get("search") || "";
  const titleFilter = searchParams.get("title") || "all";
  const classFilter = searchParams.get("class") || "all";
  const genderFilter = searchParams.get("gender") || "all";
  const insuranceFilter = searchParams.get("insurance") || "all";

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

  const filteredStudents = useMemo(() => {
    let filtered = [...students];
    if (titleFilter !== "all") {
      filtered = filtered.filter((s) => s.title === titleFilter);
    }
    if (classFilter !== "all") {
      filtered = filtered.filter((s) => s.classLevel === classFilter);
    }
    if (genderFilter !== "all") {
      filtered = filtered.filter((s) => s.gender === genderFilter);
    }
    if (insuranceFilter !== "all") {
      filtered = filtered.filter((s) => s.insurance === insuranceFilter);
    }

    if (searchTerm.trim()) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((student) =>
        Object.values(student).some((value) => {
          if (typeof value === "string")
            return value.toLowerCase().includes(lowercasedTerm);
          if (typeof value === "object" && value !== null) {
            return Object.values(value).some(
              (nestedValue) =>
                typeof nestedValue === "string" &&
                nestedValue.toLowerCase().includes(lowercasedTerm)
            );
          }
          return false;
        })
      );
    }
    return filtered;
  }, [
    students,
    searchTerm,
    titleFilter,
    classFilter,
    genderFilter,
    insuranceFilter,
  ]);

  // --- REVISED: ฟังก์ชันเดียวที่จัดการ Filter ทั้งหมด ---
  const handleFilterChange = (key: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      newSearchParams.set(key, value);
    } else {
      newSearchParams.delete(key);
    }
    setSearchParams(newSearchParams, { replace: true });
  };
  const clearFilters = () => {
    setSearchParams({}, { replace: true });
  };
  const handleDeleteClick = (docId: string) => {
    setModalState({ isOpen: true, studentIdToDelete: docId });
  };
  const handleConfirmDelete = () => {
    const studentToDelete = students.find(
      (s) => s.studentId === modalState.studentIdToDelete
    );
    deleteStudent(modalState.studentIdToDelete); // <-- เรียกใช้ฟังก์ชันจาก Context
    setModalState({ isOpen: false, studentIdToDelete: "" });
    setAlertState({
      isOpen: true,
      type: "success",
      title: "สำเร็จ!",
      message: `ลบข้อมูล ${studentToDelete?.firstName} สำเร็จแล้ว`,
    });
  };

  const handleDownloadCSV = () => {
    const headers = [
      "studentId",
      "id",
      "classLevel",
      "title",
      "titleOther",
      "firstName",
      "lastName",
      "gender",
      "birthDate",
      "phoneNumber",
      "weight",
      "height",
      "bloodGroup",
      "ethnicity",
      "nationality",
      "religion",
      "address_houseNumber",
      "address_moo",
      "address_street",
      "address_subDistrict",
      "address_district",
      "address_province",
      "father_title",
      "father_titleOther",
      "father_firstName",
      "father_lastName",
      "father_occupation",
      "father_phoneNumber",
      "mother_title",
      "mother_titleOther",
      "mother_firstName",
      "mother_lastName",
      "mother_occupation",
      "mother_phoneNumber",
      "parent_title",
      "parent_titleOther",
      "parent_firstName",
      "parent_lastName",
      "parent_occupation",
      "parent_relationship",
      "parent_phoneNumber",
      "disability_hasDisability",
      "disability_description",
      "insurance",
    ];
    const exampleRow = [
      "1234567890123",
      "1001",
      "ประถมศึกษาปีที่ 1",
      "เด็กชาย",
      "",
      "สมชาย",
      "ใจดี",
      "ชาย",
      "2015-01-15",
      "0812345678",
      "25",
      "120",
      "A",
      "ไทย",
      "ไทย",
      "พุทธ",
      "123/45",
      "1",
      "ถนนพัฒนาการ",
      "สวนหลวง",
      "สวนหลวง",
      "กรุงเทพมหานคร",
      "นาย",
      "",
      "สมศักดิ์",
      "ใจดี",
      "รับจ้าง",
      "0811112222",
      "นาง",
      "",
      "สมศรี",
      "ใจดี",
      "แม่บ้าน",
      "0822223333",
      "นาย",
      "",
      "สมศักดิ์",
      "ใจดี",
      "รับจ้าง",
      "บิดา",
      "0811112222",
      "false",
      "",
      "ทำประกัน",
    ];
    const csvContent = headers.join(",") + "\n";
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");

    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", "student_template_standard.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const headers = results.meta.fields || [];
          let studentsToSave: Student[];

          // --- ตรวจสอบรูปแบบไฟล์ ---
          if (
            headers.includes("firstName") &&
            headers.includes("father_firstName")
          ) {
            // รูปแบบที่ 1: แบบมาตรฐาน
            studentsToSave = results.data.map((row) =>
              transformStandardFormat(row)
            );
          } else if (
            headers.includes("เลขประจำตัวนักเรียน") &&
            headers.includes("ชื่อผู้ปกครอง")
          ) {
            // รูปแบบที่ 2: แบบพิเศษ (ภาษาไทย)
            studentsToSave = results.data.map((row) =>
              transformSpecialFormat(row)
            );
          } else {
            // ไม่รู้จักรูปแบบ
            setAlertState({
              isOpen: true,
              type: "error",
              title: "ผิดพลาด",
              message:
                "รูปแบบไฟล์ CSV ไม่รองรับหรือไม่ถูกต้อง กรุณาใช้ไฟล์ตัวอย่างจากระบบ",
            });
            return;
          }

          const validStudents = studentsToSave.filter(
            (s) => s.studentId || s.id
          );
          if (validStudents.length === 0) {
            setAlertState({
              isOpen: true,
              type: "error",
              title: "ผิดพลาด",
              message: "ไม่พบข้อมูลที่ถูกต้องในไฟล์ CSV",
            });
            return;
          }

          await Promise.all(
            validStudents.map((student) => addStudent(student))
          );

          setAlertState({
            isOpen: true,
            type: "success",
            title: "สำเร็จ!",
            message: `นำเข้าข้อมูลนักเรียน ${validStudents.length} คนเรียบร้อย!`,
          });
        } catch (error) {
          console.error("Error processing students:", error);
          setAlertState({
            isOpen: true,
            type: "error",
            title: "ผิดพลาด!",
            message: "เกิดปัญหาในการประมวลผลข้อมูล",
          });
        }
      },
      error: (error) => {
        setAlertState({
          isOpen: true,
          type: "error",
          title: "ผิดพลาด!",
          message: `ไม่สามารถอ่านไฟล์ CSV ได้: ${error.message}`,
        });
      },
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">
            รายชื่อนักเรียน
          </h1>
          <p className="mt-1 text-sm text-base-content/70">
            พบข้อมูล {filteredStudents.length} คน จากทั้งหมด {students.length}
            คน
          </p>
        </div>
        <div className="dropdown dropdown-end">
          <button tabIndex={0} role="button" className="btn btn-primary">
            <UserPlusIcon /> เพิ่มข้อมูล
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link to="/student/new">เพิ่มรายคน</Link>
            </li>
            <li>
              <button onClick={() => fileInputRef.current?.click()}>
                อัปโหลดไฟล์ CSV
              </button>
            </li>
            <li>
              <button onClick={handleDownloadCSV}>ดาวน์โหลดไฟล์ตัวอย่าง</button>
            </li>
          </ul>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
        </div>
      </div>

      {alertState?.isOpen && (
        <Alert
          type={alertState.type}
          title={alertState.title}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-6 space-y-6">
          {/* --- NEW: Separated Search Section --- */}
          <div>
            <label htmlFor="search-input" className="label-text font-semibold">
              ค้นหาด่วน
            </label>
            <label className="input input-bordered flex items-center gap-2 mt-2">
              <input
                id="search-input"
                type="text"
                className="grow"
                placeholder="ค้นหาจากทุกข้อมูล..."
                value={searchTerm}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
              <SearchIcon />
            </label>
          </div>

          <div className="divider">ตัวกรองข้อมูล</div>

          {/* --- NEW: Advanced Filters Section --- */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filter Dropdowns */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">คำนำหน้า</span>
                </label>
                <select
                  className="select select-bordered"
                  value={titleFilter}
                  onChange={(e) => handleFilterChange("title", e.target.value)}
                >
                  <option value="all">ทั้งหมด</option>
                  <option>เด็กชาย</option>
                  <option>เด็กหญิง</option>
                  <option>นาย</option>
                  <option>นางสาว</option>
                </select>
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">ชั้น</span>
                </label>
                <select
                  className="select select-bordered"
                  value={classFilter}
                  onChange={(e) => handleFilterChange("class", e.target.value)}
                >
                  <option value="all">ทั้งหมด</option>
                  {classLevels.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">เพศ</span>
                </label>
                <select
                  className="select select-bordered"
                  value={genderFilter}
                  onChange={(e) => handleFilterChange("gender", e.target.value)}
                >
                  <option value="all">ทั้งหมด</option>
                  <option>ชาย</option>
                  <option>หญิง</option>
                </select>
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">ประกัน</span>
                </label>
                <select
                  className="select select-bordered"
                  value={insuranceFilter}
                  onChange={(e) =>
                    handleFilterChange("insurance", e.target.value)
                  }
                >
                  <option value="all">ทั้งหมด</option>
                  <option>ทำประกัน</option>
                  <option>ไม่ได้ทำประกัน</option>
                </select>
              </div>
            </div>
            {/* Centered Clear Button */}
            <div className="flex justify-center">
              <button className="btn btn-ghost" onClick={clearFilters}>
                <ClearIcon /> ล้างค่าทั้งหมด
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        {/* --- NEW: Responsive Table Wrapper --- */}
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                {/* REVISED: นำ sticky top-0 ออก */}
                <th>รหัสนักเรียน</th>
                <th>ชื่อ-สกุล</th>
                <th>ประกัน</th>
                <th className="text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.docId || student.studentId} className="hover">
                  <td>
                    <div className="font-bold">{student.studentId}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      {/* สามารถเพิ่ม Avatar ได้ถ้าต้องการ */}
                      <div>
                        <div className="font-bold">{`${student.title}${student.firstName} ${student.lastName}`}</div>
                        <div className="text-sm opacity-50">
                          ชั้น {student.classLevel}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={student.insurance} />
                  </td>
                  {/* --- NEW: Explicit Action Buttons --- */}
                  <th className="text-center">
                    {/* ส่วนแสดงผลบนจอใหญ่ (md ขึ้นไป) - เหมือนเดิม */}
                    <div className="hidden md:flex justify-center items-center gap-1">
                      <button
                        onClick={() => navigate(`/student/${student.docId}`)}
                        className="btn btn-ghost btn-xs"
                        aria-label="ดูข้อมูล"
                      >
                        <ViewIcon />
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/student/${student.docId}/edit`)
                        }
                        className="btn btn-ghost btn-xs"
                        aria-label="แก้ไข"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(student.docId!)}
                        className="btn btn-ghost btn-xs text-error"
                        aria-label="ลบ"
                      >
                        <DeleteIcon />
                      </button>
                    </div>

                    {/* REVISED: ส่วนแสดงผลบนจอเล็ก - แก้ไขปุ่มให้แสดงผลไอคอนถูกต้อง */}
                    <div className="dropdown dropdown-left md:hidden">
                      <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost btn-xs btn-circle"
                      >
                        <DotsVerticalIcon />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40"
                      >
                        <li>
                          <button
                            onClick={() =>
                              navigate(`/student/${student.docId}`)
                            }
                          >
                            ดูข้อมูล
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() =>
                              navigate(`/student/${student.docId}/edit`)
                            }
                          >
                            แก้ไข
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => handleDeleteClick(student.docId!)}
                            className="text-error"
                          >
                            ลบ
                          </button>
                        </li>
                      </ul>
                    </div>
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="text-center p-10 text-base-content/60">
              ไม่พบข้อมูลนักเรียนที่ตรงกับเงื่อนไข
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบข้อมูล"
        message={`คุณต้องการลบข้อมูลของนักเรียนรหัส ${modalState.studentIdToDelete} ใช่หรือไม่?`}
      />
    </div>
  );
};

export default StudentPage;
