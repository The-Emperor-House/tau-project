"use client";

export default function NewsCard({ item, onClick }) {
  return (
    <div
      onClick={() => onClick?.(item)}
      className="cursor-pointer rounded-2xl overflow-hidden h-full shadow-md hover:shadow-lg transition-shadow bg-card"
    >
      <div className="relative w-full overflow-hidden" style={{ paddingTop: "56.25%" }}>
        <img
          src={item.coverUrl}
          alt={item.heading1}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <p className="font-bold text-base leading-tight">{item.heading1}</p>
        {item.heading2 && (
          <p className="text-sm text-muted-foreground mt-1">{item.heading2}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(item.createdAt).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
