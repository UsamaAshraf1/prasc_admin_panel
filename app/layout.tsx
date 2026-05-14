import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "PRASC Admin Panel",
  description: "Admin dashboard for PRASC questionnaire submissions"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
