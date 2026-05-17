import "./globals.css";
import { Toaster } from 'sonner'; // Import thư viện

export const metadata = {
  title: "ZENIX Japan - Global Trading Platform",
  description: "Connect global buyers directly with vetted, high-precision industrial SMEs in Japan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Đặt Toaster ở đây, chọn vị trí góc trên bên phải */}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}