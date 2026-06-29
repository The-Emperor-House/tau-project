import './globals.css';
import { Poppins, Prompt } from 'next/font/google';
import { Providers } from '@/shared/providers/Providers';
import MainNavbar from '@/modules/layout/navbar/MainNavbar';
import Footer from '@/modules/layout/footer/Footer';
import ClientGuards from "@/modules/layout/common/ClientGuards";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-prompt',
});

export const metadata = {
  title: 'Taurus: WE RENEW',
  description: 'เปลี่ยนบ้านหลังเก่าให้เป็นไปตามจินตนาการของคุณ',
  icons: { icon: '/favicon.ico' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  const enableGuards = process.env.NODE_ENV === "production";

  return (
    <html lang="th" className={`${poppins.variable} ${prompt.variable}`}>
      <body data-protect={enableGuards ? "on" : "off"}>
        <Providers>
          <ClientGuards enabled={enableGuards} />
          <MainNavbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
