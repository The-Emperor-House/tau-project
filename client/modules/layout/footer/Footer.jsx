"use client";

import FooterLogo from "./FooterLogo";
import HeadOffice from "./HeadOffice";
import ShowroomAndSocial from "./ShowroomAndSocial";
import ResponsiveDivider from "./ResponsiveDivider";

export default function Footer() {
  const logoSrc = "/logo/LOGO NEW TAURUS WHITE.png";

  return (
    <footer className="py-8 md:py-10 bg-[#404040] text-white">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-6 md:gap-8">
          <div className="w-full lg:w-auto lg:shrink-0 lg:min-w-[200px]">
            <FooterLogo src={logoSrc} />
          </div>
          <div className="w-full md:w-full lg:flex-1">
            <HeadOffice />
          </div>
          <div className="w-full md:hidden">
            <ResponsiveDivider />
          </div>
          <div className="w-full md:w-full lg:flex-1">
            <ShowroomAndSocial />
          </div>
        </div>
      </div>
    </footer>
  );
}
