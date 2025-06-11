import type { ReactNode } from "react";

export interface Student {
  docId?: string;
  id: string; 
  studentId: string;
  classLevel: string;
  
  title: 'เด็กชาย' | 'เด็กหญิง' | 'นาย' | 'นางสาว' | 'อื่น ๆ';
  titleOther?: string;
  firstName: string;
  lastName: string;
  gender: 'ชาย' | 'หญิง';
  birthDate: string; // Stored as YYYY-MM-DD (A.D.)
  phoneNumber?: string;
  weight: number | ""; // REVISED: Allow empty string for form state
  height: number | ""; // REVISED: Allow empty string for form state
  bloodGroup: 'ไม่ทราบ' | 'A' | 'B' | 'AB' | 'O';
  ethnicity: string;
  nationality: string;
  religion: string;
  
  address: {
    houseNumber: string;
    moo: string;
    street: string;
    subDistrict: string;
    district: string;
    province: string;
  };
  
  father: {
   
    title: 'นาย' | 'อื่น ๆ';
    titleOther?: string;
    firstName: string;
    lastName: string;
    occupation: string;
    phoneNumber?: string;
  };
  mother: {
   
    title: 'นาง' | 'นางสาว' | 'อื่น ๆ';
    titleOther?: string;
    firstName: string;
    lastName: string;
    occupation: string;
    phoneNumber?: string;
  };
  parent: {
    [x: string]: ReactNode;
    title: 'นาย' | 'นาง' | 'นางสาว' | 'อื่น ๆ';
    titleOther?: string;
    firstName: string;
    lastName: string;
    occupation: string;
    relationship: string;
    phoneNumber?: string;
  };
  
  disability: {
    hasDisability: boolean; 
    description?: string;
  };
  insurance: 'ทำประกัน' | 'ไม่ได้ทำประกัน';
}

export interface AppNotification {
  id: string; // ใช้ timestamp + studentId เพื่อให้ไม่ซ้ำกัน
  type: 'added' | 'modified' | 'removed';
  studentName: string;
  timestamp: Date;
  read: boolean;
}