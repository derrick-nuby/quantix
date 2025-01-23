import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/top-bar";
import Providers from "../providers";
import { Crimson_Text, Roboto } from "next/font/google";

const crimsonText = Crimson_Text({
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-crimson",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export default function BusinessLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <body className={`${crimsonText.variable} ${roboto.className} antialiased`}>
      <Providers>
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">{children}</main>
        </div>
      </Providers>
    </body>
  );
}

