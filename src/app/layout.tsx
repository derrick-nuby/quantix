import "./globals.css";
import { generateMetadata, viewport } from "./metadata";

export const metadata = generateMetadata();
export { viewport };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {children}
    </html>
  );
}

