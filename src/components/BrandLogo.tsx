import React from 'react';

interface BrandLogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  collapsed?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  showTagline = true,
  size = 'md',
  collapsed = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 3D Geometric DNA Extrusion Nozzle Logo Mark */}
      <div
        className={`${iconSizes[size]} shrink-0 relative flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500 shadow-md shadow-violet-900/20 p-1.5 transition-transform hover:scale-105`}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* 3D Isometric Layered Hex / Nozzle / DNA Helix */}
          <path
            d="M20 3L35 11.6V28.4L20 37L5 28.4V11.6L20 3Z"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
            className="opacity-90"
          />
          <path
            d="M20 3V20M35 11.6L20 20M5 11.6L20 20"
            stroke="white"
            strokeWidth="1.75"
            strokeLinecap="round"
            className="opacity-70"
          />
          {/* Inner 3D filament layer spiral */}
          <path
            d="M12 16L20 20.8L28 16"
            stroke="#FACC15"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M12 21L20 25.8L28 21"
            stroke="#38BDF8"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M15 27L20 30L25 27"
            stroke="#F472B6"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="20" cy="20" r="2.5" fill="#FACC15" />
        </svg>
      </div>

      {!collapsed && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`${textSizes[size]} font-extrabold tracking-tight bg-gradient-to-r from-violet-700 via-fuchsia-600 to-violet-900 bg-clip-text text-transparent`}
            >
              3DNA
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
              3D
            </span>
          </div>
          {showTagline && (
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
              Hecho en Itá Ibaté
            </span>
          )}
        </div>
      )}
    </div>
  );
};
