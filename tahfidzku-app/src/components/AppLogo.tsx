import { cn } from "../lib/utils"

export function AppLogoIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn("w-6 h-6", className)}
      {...props}
    >
      {/* Book Outline */}
      <path 
        d="M 8 16 Q 22 16 32 24 Q 42 16 56 16 V 48 Q 42 48 32 56 Q 22 48 8 48 Z" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Center Spine */}
      <path 
        d="M 32 24 V 56" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
      {/* Heartbeat Line */}
      <path 
        d="M 2 36 L 14 36 L 18 24 L 24 48 L 30 14 L 36 54 L 42 24 L 48 36 L 62 36" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  )
}

interface AppLogoProps {
  className?: string
  iconClassName?: string
  textClassName?: string
  containerClassName?: string
  showText?: boolean
}

export function AppLogo({ 
  className, 
  iconClassName, 
  textClassName, 
  containerClassName,
  showText = true 
}: AppLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("bg-emerald-600 p-1.5 rounded-md flex items-center justify-center", containerClassName)}>
        <AppLogoIcon className={cn("h-5 w-5 text-white", iconClassName)} />
      </div>
      {showText && (
        <span className={cn("font-bold text-xl tracking-tight text-emerald-950", textClassName)}>
          TahfidzKu
        </span>
      )}
    </div>
  )
}
