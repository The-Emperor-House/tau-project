export function parseVideo(url) {
  if (!url || typeof url !== "string") return null;
  const u = url.trim();

  // --- YouTube: watch?v=, youtu.be, shorts, embed ---
  const ytWatch = /youtube\.com\/watch\?v=([^&]+)/i.exec(u);
  const ytShorts = /youtube\.com\/shorts\/([^?]+)/i.exec(u);
  const ytBe = /youtu\.be\/([^?]+)/i.exec(u);
  const ytEmbed = /youtube\.com\/embed\/([^?]+)/i.exec(u);
  const ytId = ytWatch?.[1] || ytShorts?.[1] || ytBe?.[1] || ytEmbed?.[1];
  if (ytId) {
    return {
      type: "iframe",
      src: `https://www.youtube.com/embed/${ytId}`,
      title: "YouTube video",
      allow:
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
    };
  }

  // --- Vimeo: vimeo.com/<id> หรือ player.vimeo.com/video/<id> ---
  const vimeoId =
    /vimeo\.com\/(\d+)/i.exec(u)?.[1] ||
    /player\.vimeo\.com\/video\/(\d+)/i.exec(u)?.[1];
  if (vimeoId) {
    return {
      type: "iframe",
      src: `https://player.vimeo.com/video/${vimeoId}`,
      title: "Vimeo video",
      allow: "autoplay; fullscreen; picture-in-picture",
    };
  }

  // --- ไฟล์วิดีโอโดยตรง ---
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(u)) {
    return { type: "video", src: u };
  }

  // ไม่รู้จักรูปแบบ
  return null;
}