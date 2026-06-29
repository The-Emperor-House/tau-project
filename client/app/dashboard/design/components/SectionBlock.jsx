"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";

export default function SectionBlock({ title, items, loading, onEdit, onDelete, colors }) {
  return (
    <div>
      <h6 className="text-base font-bold mb-4" style={{ color: colors.accent }}>{title}</h6>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {(loading ? Array.from({ length: 6 }) : items).map((item, index) => (
          <motion.div
            key={item?.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl overflow-hidden bg-card shadow-md flex flex-col h-full"
          >
            {loading ? (
              <>
                <div className="relative w-full aspect-video bg-muted animate-pulse rounded-t-2xl" />
                <div className="p-4 flex-1 space-y-2">
                  <div className="h-5 bg-muted rounded animate-pulse w-4/5" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/5" />
                </div>
                <div className="flex justify-end gap-2 p-4">
                  <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                </div>
              </>
            ) : (
              <>
                <div className="relative w-full aspect-video overflow-hidden rounded-t-2xl">
                  <img
                    src={item.coverUrl || "/no-image.jpg"}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1">
                  <p className="font-bold text-sm text-foreground">{item.name}</p>
                </div>
                <div className="flex justify-end gap-2 p-4 pt-0">
                  <button
                    onClick={() => onEdit(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg transition-colors"
                    style={{ color: colors.accent, borderColor: colors.accent }}
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-500 border border-rose-500/40 rounded-lg hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
