/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // --- เพิ่ม/แก้ไขส่วนนี้ ---
    extend: {
      fontFamily: {
        // ตั้งค่าให้ Sarabun เป็นฟอนต์หลักสำหรับคลาส font-sans (ซึ่งเป็นค่าเริ่มต้น)
        sans: ['Sarabun', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["emerald", "dracula"],
  },
}