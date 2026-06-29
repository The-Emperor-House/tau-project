import Image from "next/image";

export default function FooterLogo({ src }) {
  return (
    <div className="relative w-[120px] h-[80px] sm:w-[140px] sm:h-[90px] md:w-[200px] md:h-[120px] mx-auto md:mx-0">
      <Image
        src={src}
        alt="Taurus Logo"
        fill
        sizes="(max-width: 600px) 120px, (max-width: 900px) 140px, 200px"
        className="object-contain"
        priority
      />
    </div>
  );
}
