import { FaPhoneAlt } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import SectionTitle from "./SectionTitle";

export default function HeadOffice() {
  return (
    <div>
      <SectionTitle icon={<IoLocationSharp size={18} />}>Head Office :</SectionTitle>
      <p className="text-white/90 text-base leading-relaxed text-center md:text-left">
        288/18 Phaholyothin Rd.
        <br />
        Anusawaree , Bangkhen , Bangkok 10220
      </p>
      <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
        <FaPhoneAlt />
        <span className="text-white/90 text-base tracking-wide md:hover:text-primary transition-colors">
          (66) 2 970 3080 - 3 / 088-810-1088
        </span>
      </div>
    </div>
  );
}
