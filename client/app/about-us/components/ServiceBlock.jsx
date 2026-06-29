import { motion } from "framer-motion";

const servicesMain = [
  { title: "REBUILD", subtitle: "สร้างใหม่" },
  { title: "RENOVATE", subtitle: "ปรับปรุง ต่อเติม - ซ่อมแซม" },
  { title: "REDESIGN & DECORATE", subtitle: "ออกแบบตกแต่งภายใน" },
];

export default function ServiceBlock() {
  return (
    <div className="text-center mt-4 md:mt-8">
      <h4 className="text-black font-light tracking-[0.4rem] mb-8 text-2xl md:text-3xl">
        OUR SERVICE
      </h4>

      <div className="flex flex-col items-center gap-6 md:gap-8 w-full">
        {servicesMain.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 md:gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              className="inline-flex items-center justify-center font-bold tracking-[0.35em] text-center cursor-pointer text-black transition-colors rounded-full"
              style={{
                backgroundColor: "#f5ede5",
                minHeight: "clamp(60px, 8vw, 80px)",
                paddingLeft: "clamp(1.25rem, 4vw, 1.75rem)",
                paddingRight: "clamp(1.25rem, 4vw, 1.75rem)",
                fontSize: "clamp(0.95rem, 2vw, 1.05rem)",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#e5dbcf")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#f5ede5")}
            >
              {item.title}
            </motion.button>

            <p className="font-semibold text-center tracking-[0.2em] text-[0.9rem] md:text-[1rem] opacity-90">
              {item.subtitle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
