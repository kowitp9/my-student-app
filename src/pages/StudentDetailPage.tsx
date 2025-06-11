import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { Student } from "../types";
import { useApp } from "../contexts/AppContextProvider";
import PageHeader from "../components/PageHeader";

// --- Icons ---
const IdCardIcon = () => (
  <svg
    className="mr-1.5 h-5 w-5 text-blue-500"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zM12 15.75a2.25 2.25 0 01-2.25-2.25A2.25 2.25 0 0112 11.25a2.25 2.25 0 012.25 2.25A2.25 2.25 0 0112 15.75z"
    />
  </svg>
);
const ClassIcon = () => (
  <svg
    className="mr-1.5 h-5 w-5 text-blue-500"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l-.07.002z"
    />
  </svg>
);
const EditIcon = () => (
  <svg
    className="-ml-0.5 mr-1.5 h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
  </svg>
);

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="py-3 grid grid-cols-3 gap-4 border-b border-base-200">
    <dt className="text-sm font-medium text-base-content/70">{label}</dt>
    <dd className="text-sm text-base-content col-span-2">
      {value || <span className="opacity-50">-</span>}
    </dd>
  </div>
);

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-lg font-semibold text-primary mt-6 pb-2 col-span-full">
    {title}
  </h3>
);

// NEW: ฟังก์ชันแปลงชื่อชั้นเรียนแบบย่อเป็นแบบเต็ม
const formatClassName = (level: string) => {
  const classMap: { [key: string]: string } = {
    "อ.2": "ชั้นอนุบาล 2",
    "อ.3": "ชั้นอนุบาล 3",
    "ป.1": "ชั้นประถมศึกษาปีที่ 1",
    "ป.2": "ชั้นประถมศึกษาปีที่ 2",
    "ป.3": "ชั้นประถมศึกษาปีที่ 3",
    "ป.4": "ชั้นประถมศึกษาปีที่ 4",
    "ป.5": "ชั้นประถมศึกษาปีที่ 5",
    "ป.6": "ชั้นประถมศึกษาปีที่ 6",
    "ม.1": "ชั้นมัธยมศึกษาปีที่ 1",
    "ม.2": "ชั้นมัธยมศึกษาปีที่ 2",
    "ม.3": "ชั้นมัธยมศึกษาปีที่ 3",
  };
  // คืนค่าชื่อเต็มถ้ามีใน map, ถ้าไม่ก็คืนค่าเดิม
  return classMap[level] || level;
};

const StudentDetailPage: React.FC = () => {
  const { docId } = useParams<{ docId: string }>();
  const { students } = useApp(); // REVISED: ดึงข้อมูลนักเรียนจาก Context
  const navigate = useNavigate();

  // REVISED: ค้นหานักเรียนด้วย docId จาก state ใน Context
  const student = students.find((s) => s.docId === docId);

  if (!student) {
    return (
      <div className="p-8 text-center text-error">ไม่พบข้อมูลนักเรียน</div>
    );
  }

  const calculateAge = (birthDate: string): number | null => {
    if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return null;
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(student.birthDate);

  return (
    <div className="max-w-screen-2xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { name: "รายชื่อนักเรียน", href: "/" },
          { name: student.firstName, href: `/student/${student.docId}` },
        ]}
        title={`${student.title} ${student.firstName} ${student.lastName}`}
        meta={[
          <>
            {" "}
            <IdCardIcon /> รหัส: {student.studentId}{" "}
          </>, // REVISED: แสดง studentId
          <>
            <ClassIcon /> ชั้น: {student.classLevel}
          </>,
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate(`/student/${student.docId}/edit`)}
            className="btn btn-primary"
          >
            <EditIcon /> แก้ไข
          </button>
        }
      />
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <SectionTitle title="ข้อมูลการศึกษา" />
            <DetailItem label="เลขประจำตัวนักเรียน" value={student.studentId} />

            <DetailItem label="ชั้น" value={student.classLevel} />

            <SectionTitle title="ข้อมูลส่วนตัว" />
            <DetailItem label="เลขบัตรประจำตัวประชาชน" value={student.id} />
            <DetailItem label="เพศ" value={student.gender} />
            <DetailItem
              label="วันเกิด"
              value={
                student.birthDate
                  ? new Date(student.birthDate).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-"
              }
            />
            <DetailItem label="อายุ" value={age !== null ? `${age} ปี` : "-"} />
            <DetailItem label="เบอร์โทรศัพท์" value={student.phoneNumber} />
            <DetailItem
              label="น้ำหนัก"
              value={student.weight ? `${student.weight} กก.` : "-"}
            />
            <DetailItem
              label="ส่วนสูง"
              value={student.height ? `${student.height} ซม.` : "-"}
            />
            <DetailItem label="กลุ่มเลือด" value={student.bloodGroup} />
            <DetailItem label="เชื้อชาติ" value={student.ethnicity} />
            <DetailItem label="สัญชาติ" value={student.nationality} />
            <DetailItem label="ศาสนา" value={student.religion} />

            <SectionTitle title="ข้อมูลที่อยู่" />
            <DetailItem
              label="บ้านเลขที่"
              value={student.address.houseNumber}
            />
            <DetailItem label="หมู่" value={student.address.moo} />
            <DetailItem label="ถนน/ซอย" value={student.address.street} />
            <DetailItem label="ตำบล" value={student.address.subDistrict} />
            <DetailItem label="อำเภอ" value={student.address.district} />
            <DetailItem label="จังหวัด" value={student.address.province} />

            <SectionTitle title="ข้อมูลครอบครัว" />
            <DetailItem
              label="ชื่อผู้ปกครอง"
              value={`${student.parent.title || ""}${
                student.parent.title === "อื่น ๆ"
                  ? student.parent.titleOther
                  : ""
              } ${student.parent.firstName} ${student.parent.lastName}`}
            />
            <DetailItem
              label="ความเกี่ยวข้อง"
              value={student.parent.relationship}
            />
            <DetailItem
              label="อาชีพผู้ปกครอง"
              value={student.parent.occupation}
            />
            <DetailItem
              label="เบอร์โทรผู้ปกครอง"
              value={student.parent.phoneNumber}
            />
            <DetailItem
              label="ชื่อบิดา"
              value={`${student.father.title || ""}${
                student.father.title === "อื่น ๆ"
                  ? student.father.titleOther
                  : ""
              } ${student.father.firstName} ${student.father.lastName}`}
            />
            <DetailItem label="อาชีพบิดา" value={student.father.occupation} />
            <DetailItem
              label="เบอร์โทรบิดา"
              value={student.father.phoneNumber}
            />
            <DetailItem
              label="ชื่อมารดา"
              value={`${student.mother.title || ""}${
                student.mother.title === "อื่น ๆ"
                  ? student.mother.titleOther
                  : ""
              } ${student.mother.firstName} ${student.mother.lastName}`}
            />
            <DetailItem label="อาชีพมารดา" value={student.mother.occupation} />
            <DetailItem
              label="เบอร์โทรมารดา"
              value={student.mother.phoneNumber}
            />

            <SectionTitle title="ข้อมูลอื่นๆ" />
            <DetailItem
              label="ความด้อยโอกาส"
              value={
                student.disability.hasDisability
                  ? student.disability.description
                  : "ไม่มี"
              }
            />
            <DetailItem label="ประกัน" value={student.insurance} />
          </dl>
        </div>
      </div>
    </div>
  );
};
export default StudentDetailPage;
