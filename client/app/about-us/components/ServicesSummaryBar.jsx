"use client";

import { Fragment } from "react";

// แต่ละบริการเป็น inline-block — ตัดบรรทัดได้เฉพาะตรง " | " ไม่ตัดกลางชื่อบริการ (เช่น "ออกแบบ | ตกแต่งภายใน")
export function ServiceList({ items }) {
  return items.map((s, i) => (
    <Fragment key={s}>
      {i > 0 && " | "}
      <span className="inline-block">{s}</span>
    </Fragment>
  ));
}

export default function ServicesSummaryBar({ services = [], categories = [] }) {
  return (
    <div className="text-center pb-12 md:pb-16 px-4">
      <p className="font-medium mb-3">
        <ServiceList items={services} />
      </p>
      <p className="font-light text-black tracking-[0.05rem] text-sm break-words" style={{ wordBreak: "break-word" }}>
        {categories.map(c => c.name).join(" | ")}
      </p>
    </div>
  );
}
