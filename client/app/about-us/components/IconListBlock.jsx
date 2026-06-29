import { Search, Lightbulb, Handshake, HardHat, ClipboardCheck } from "lucide-react";
import { motion } from "framer-motion";

const servicesDetail = [
  { icon: Search, text: "Survey Area" },
  { icon: Lightbulb, text: "Concept Design & Estimate Price" },
  { icon: Handshake, text: "Perspective & Sign Contract" },
  { icon: HardHat, text: "Construction In Progress & Material Approve" },
  { icon: ClipboardCheck, text: "Handover" },
];

export default function IconListBlock() {
  return (
    <div className="text-center mt-4 flex flex-col items-center gap-6 md:gap-8 w-full">
      {servicesDetail.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.03 }}
            className="flex flex-row items-center gap-6 md:gap-8 w-full max-w-[480px] md:max-w-[560px] mx-auto min-h-[80px] md:min-h-[92px]"
          >
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{
                backgroundColor: "#ab9685",
                width: "clamp(72px, 10vw, 84px)",
                height: "clamp(72px, 10vw, 84px)",
              }}
            >
              <Icon
                className="text-white"
                style={{ width: "clamp(34px, 5vw, 40px)", height: "clamp(34px, 5vw, 40px)" }}
              />
            </div>

            <p className="text-left text-black text-[1.05rem] md:text-[1.2rem] leading-[1.5] tracking-[0.02rem] break-words">
              {item.text}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
