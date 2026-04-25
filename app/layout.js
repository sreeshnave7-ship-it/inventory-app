import "./globals.css";
import ToastProvider from "@/components/ui/ToastProvider";
import AppLayout from "@/components/layout/AppLayout";
import AuthGuard from "@/components/AuthGuard";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthGuard>
          <ToastProvider>
            <AppLayout>{children}</AppLayout>
          </ToastProvider>
        </AuthGuard>
      </body>
    </html>
  );
}