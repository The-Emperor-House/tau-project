import './globals.css';
import { Poppins, Prompt } from 'next/font/google';
import { Providers } from '@/shared/providers/Providers';
import MainNavbar from '@/modules/layout/navbar/MainNavbar';
import Footer from '@/modules/layout/footer/Footer';
import { Suspense } from 'react';
import RouteLoader from '@/modules/layout/common/RouteLoader';
import ClientGuards from "@/modules/layout/common/ClientGuards";
import EmotionRegistry from '@/app/EmotionRegistry';

// กำหนด fonts
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

// กำหนด metadata สำหรับ SEO
export const metadata = {
  title: 'Taurus: WE RENEW',
  description: 'เปลี่ยนบ้านหลังเก่าให้เป็นไปตามจินตนาการของคุณ',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  const enableGuards = process.env.NODE_ENV === "production";

  return (
    <html lang="th" className={`${poppins.variable} ${prompt.variable}`}>
      <head>
        {/* จุดเสียบ Style ของ Emotion/MUI ให้ SSR/CSR ตรงกัน */}
        <meta name="emotion-insertion-point" content="" />
      </head>
      <body data-protect={enableGuards ? "on" : "off"}>
        {/* ครอบทั้งแอปด้วย EmotionRegistry (มี CacheProvider ภายใน) */}
        <EmotionRegistry>
          <Providers>
            <ClientGuards enabled={enableGuards} />
            <MainNavbar />
            <main>
              <Suspense fallback={<RouteLoader />}>{children}</Suspense>
            </main>
            <Footer />
          </Providers>
        </EmotionRegistry>
      </body>
    </html>
  );
}
