import Image from "next/image";

export function PlatypusLogo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="PlatypusHire logo">
      <Image
        src="/logo.png"
        alt="PlatypusHire"
        width={28}
        height={28}
        className="h-full w-auto"
        priority
      />
      <span className="text-base font-semibold tracking-tight leading-none" style={{ letterSpacing: "-0.02em" }}>
        <span className="text-current">Platypus</span>
        <span className="text-emerald-700 font-bold">Hire</span>
      </span>
    </span>
  );
}
