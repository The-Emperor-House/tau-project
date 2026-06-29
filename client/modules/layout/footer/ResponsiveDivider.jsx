export default function ResponsiveDivider() {
  return (
    <>
      <div className="hidden md:block w-px self-stretch mx-6 bg-white/45" />
      <div className="block md:hidden w-full border-b border-white/35" />
    </>
  );
}
