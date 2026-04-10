import type { Metadata } from "next";
import { Lora, Nunito, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GrainOverlay } from "@/components/shared/grain-overlay";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "mirkayk — your ai dev team, blooming",
  description: "AI agent orchestration platform for web development teams",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lora.variable} ${nunito.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light"){document.documentElement.classList.add(t)}else if(window.matchMedia("(prefers-color-scheme:dark)").matches){document.documentElement.classList.add("dark")}else{document.documentElement.classList.add("light")}}catch(e){document.documentElement.classList.add("light")}})()`,
          }}
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <GrainOverlay />
      </body>
    </html>
  );
}
