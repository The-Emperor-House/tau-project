import { FaPhoneAlt } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";

export default function HeadOffice() {
  return (
    <div>
      <h6 className="flex items-center justify-center md:justify-start gap-1 font-bold tracking-wide mb-2 text-base md:hover:text-primary transition-colors">
        <IoLocationSharp size={18} />
        Head Office :
      </h6>
      <p className="text-white/90 text-base leading-relaxed text-center md:text-left">
        288/18 Phaholyothin Rd.
        <br />
        Anusawaree , Bangkhen , Bangkok 10220
      </p>
      <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
        <FaPhoneAlt />
        <span className="text-white/90 text-base tracking-wide md:hover:text-primary transition-colors">
          (66) 2 970 3080 - 3 / (66) 61 0596111
        </span>
      </div>
    </div>
  );
}
