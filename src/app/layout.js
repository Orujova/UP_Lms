import { Montserrat } from "next/font/google";
import Providers from "@/redux/providers";
import "./globals.css";

import Wrapper from "@/lib/wrapper";
import { Toaster } from "sonner";
import "@/styles/global.scss";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "UP LMS",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <Wrapper>
      <html lang="en">
        <body className={montserrat.className}>
          <Providers>
            {/* <Toaster position="top-right" richColors /> */}
            <Toaster
              position="top-right"
              closeButton={true}
              duration={2500}
              // theme="light"
              richColors
            />
            {children}
          </Providers>
        </body>
      </html>
    </Wrapper>
  );
}
