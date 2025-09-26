import Link from "next/link";

interface LogoProps {
  showText?: boolean;
  href?: string;
  className?: string;
}

export function Logo({ showText = true, href = "/", className = "" }: LogoProps) {
  const logoContent = (
    <div className={`flex items-center gap-3 hover:opacity-90 transition-opacity ${className}`}>
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-lg">F</span>
      </div>
      {showText && (
        <div>
          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FitLife Studio
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{logoContent}</Link>;
  }

  return logoContent;
}