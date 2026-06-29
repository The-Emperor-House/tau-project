import { FaLine, FaInstagram } from "react-icons/fa";
import { SiTiktok } from "react-icons/si";
import { MdEmail } from "react-icons/md";
import { CgFacebook } from "react-icons/cg";
import { IoLocationSharp } from "react-icons/io5";
import SocialIcon from "./SocialIcon";
import SectionTitle from "./SectionTitle";

export default function ShowroomAndSocial() {
  return (
    <div>
      <SectionTitle icon={<IoLocationSharp size={18} />}>Showroom :</SectionTitle>
      <p className="text-white/90 text-base leading-relaxed text-center md:text-left">
        189/9-10 Ratchada-Ramintra Rd.
        <br />
        Nuanchan , Buengkum , Bangkok 10240
      </p>
      <div className="flex items-center justify-center md:justify-start gap-1 mt-3 flex-wrap">
        <SocialIcon href="https://line.me/ti/p/~salestaurus" label="Line">
          <FaLine />
        </SocialIcon>
        <SocialIcon href="mailto:taurus@emperorhouse.com" label="Email">
          <MdEmail />
        </SocialIcon>
        <span className="mx-1 text-white/90 text-sm text-center md:text-left">
          ติดตามผลงานเพิ่มเติมของเราได้ที่
        </span>
        <SocialIcon href="https://facebook.com/TaurusByEmperor" label="Facebook">
          <CgFacebook />
        </SocialIcon>
        <SocialIcon href="https://www.instagram.com/showroomtaurus" label="Instagram">
          <FaInstagram />
        </SocialIcon>
        <SocialIcon href="https://www.tiktok.com/@taurus.by.emperor" label="TikTok">
          <SiTiktok />
        </SocialIcon>
        <span className="ml-1 text-white/90 text-sm">Taurus</span>
      </div>
    </div>
  );
}
