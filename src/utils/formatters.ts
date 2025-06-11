// src/utils/formatters.ts

// REVISED: ทำให้ฟังก์ชันฉลาดขึ้น สามารถจัดการกับข้อมูลที่มีคำว่า "ชั้น" ติดมาได้
export const formatClassName = (level: string): string => {
    if (!level) return '';
    
    let cleanLevel = level.trim();

    // 1. ลบคำว่า "ชั้น" ที่อาจจะติดมาข้างหน้าออกไปก่อน
    if (cleanLevel.startsWith('ชั้น')) {
        cleanLevel = cleanLevel.replace('ชั้น', '').trim();
    }

    // 2. แปลงจากตัวย่อเป็นชื่อเต็ม (ถ้ามี)
    const classMap: { [key: string]: string } = {
        'อ.2': 'อนุบาล 2',
        'อ.3': 'อนุบาล 3',
        'ป.1': 'ประถมศึกษาปีที่ 1',
        'ป.2': 'ประถมศึกษาปีที่ 2',
        'ป.3': 'ประถมศึกษาปีที่ 3',
        'ป.4': 'ประถมศึกษาปีที่ 4',
        'ป.5': 'ประถมศึกษาปีที่ 5',
        'ป.6': 'ประถมศึกษาปีที่ 6',
        'ม.1': 'มัธยมศึกษาปีที่ 1',
        'ม.2': 'มัธยมศึกษาปีที่ 2',
        'ม.3': 'มัธยมศึกษาปีที่ 3',
    };

    // 3. คืนค่าที่แปลงแล้ว หรือค่าที่ clean แล้วถ้าไม่มีใน map
    return classMap[cleanLevel] || cleanLevel;
};