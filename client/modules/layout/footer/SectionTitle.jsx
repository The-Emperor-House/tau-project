export default function SectionTitle({ icon, children }) {
  return (
    <h6 className="flex items-center justify-center md:justify-start gap-1 font-bold tracking-wide mb-2 text-base md:hover:text-primary transition-colors">
      {icon}
      {children}
    </h6>
  );
}
