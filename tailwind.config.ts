import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        japan: {
          indigo: "#1A2B4C",  // Deep blue/Indigo - Sự tin cậy
          crimson: "#D91616", // Nước Nhật & Sự khẩn trương (Nút bấm)
          paper: "#F7F7F5",   // Màu giấy Washi - Nền tinh tế
          ink: "#232323",     // Màu mực đen truyền thống - Text
          gold: "#D4AF37",    // Điểm nhấn Premium
        }
      },
      fontFamily: {
        // Ưu tiên font chữ hình học, gọn gàng cho B2B
        sans: ['Inter', 'system-ui', 'sans-serif'], 
      }
    },
  },
  plugins: [],
};
export default config;