"use client";

export default function ServicesSummaryBar({ services = [], categories = [] }) {
  return (
    <div className="text-center pb-12 md:pb-16">
      <p className="font-medium mb-3 tracking-[0.05rem] break-words" style={{ wordBreak: "break-word" }}>
        {services.join(" | ")}
      </p>
      <p className="font-light text-black tracking-[0.05rem] text-sm break-words" style={{ wordBreak: "break-word" }}>
        {categories.map(c => c.name).join(" | ")}
      </p>
    </div>
  );
}
