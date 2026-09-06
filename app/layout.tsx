import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Farad | Atur giliran listrik rumah",
  description:
    "Farad membantu merencanakan kegiatan rumah yang memakai listrik: lihat jam yang terlalu padat, atur giliran aktivitas yang fleksibel, dan pahami estimasi energinya — tanpa perangkat tambahan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-farad-ivory">
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f%5B%5D=satoshi@1,2&display=swap"
        />
        {children}
      </body>
    </html>
  );
}
