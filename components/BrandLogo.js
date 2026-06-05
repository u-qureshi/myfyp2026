import Image from 'next/image'

export const BRAND_LOGO_PATH = '/images/smartscheduler-logo.png'
export const BRAND_NAME = 'SmartScheduler'
export const BRAND_TAGLINE = 'Smart Solutions. Effortless Planning.'

const LOGO_ASPECT = 1024 / 559

/** Full horizontal logo — best for login, signup, role selection */
export function BrandLogoFull({
  width = 220,
  className = '',
  priority = false
}) {
  const height = Math.round(width / LOGO_ASPECT)

  return (
    <Image
      src={BRAND_LOGO_PATH}
      alt={BRAND_NAME}
      width={width}
      height={height}
      priority={priority}
      unoptimized
      className={`h-auto max-w-full object-contain ${className}`}
      style={{ width, height: 'auto', maxHeight: height }}
    />
  )
}

/** Circular brand mark — sidebars & small avatars */
export function BrandLogo({
  size = 72,
  className = '',
  priority = false
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-white p-1.5 shadow-md ring-2 ring-[#c9a227]/25 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={BRAND_LOGO_PATH}
        alt={BRAND_NAME}
        fill
        priority={priority}
        unoptimized
        className="object-contain"
        sizes={`${size}px`}
      />
    </div>
  )
}

/** Logo on dark sidebar backgrounds */
export function SidebarBrandMark({ size = 72, className = '', priority = false }) {
  return <BrandLogo size={size} priority={priority} className={className} />
}

/** Centered sidebar logo row with optional mobile close slot */
export function SidebarBrandHeader({ size = 72, priority = false, closeButton = null }) {
  return (
    <div className="relative mb-8 flex justify-center pt-1">
      <SidebarBrandMark size={size} priority={priority} />
      {closeButton}
    </div>
  )
}

/** Full-page loading with logo */
export function BrandLoadingScreen({
  message = 'Loading...',
  submessage = '',
  size = 96,
  className = 'min-h-screen bg-background'
}) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <BrandLogo size={size} priority className="mx-auto mb-4" />
        <p className="text-lg font-medium text-[#001a4d]">{message}</p>
        {submessage ? <p className="mt-1 text-sm text-slate-500">{submessage}</p> : null}
      </div>
    </div>
  )
}

/** Circle logo + title for portal top headers */
export function PortalHeaderBrand({ title, subtitle, logoSize = 44, titleClassName = '' }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <BrandLogo size={logoSize} />
      <div className="min-w-0">
        {title ? <h1 className={titleClassName || 'text-2xl font-bold truncate'}>{title}</h1> : null}
        {subtitle ? <p className="text-sm text-gray-500 truncate">{subtitle}</p> : null}
      </div>
    </div>
  )
}

/** Centered logo block for login / signup cards */
export function AuthBrandHeader({ width = 240, className = '' }) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div className="rounded-2xl bg-white px-4 py-3 shadow-md ring-1 ring-slate-200/80">
        <BrandLogoFull width={width} priority className="mx-auto" />
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {BRAND_TAGLINE}
      </p>
    </div>
  )
}

/** Logo block for dark auth backgrounds (role selection) */
export function AuthBrandHero({ width = 260, className = '' }) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div className="rounded-2xl bg-white px-5 py-4 shadow-xl shadow-black/20">
        <BrandLogoFull width={width} priority className="mx-auto" />
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-[#c9a227]">
        {BRAND_NAME}
      </p>
    </div>
  )
}
