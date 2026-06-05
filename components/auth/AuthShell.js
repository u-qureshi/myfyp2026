'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BrandLogoFull, AuthBrandHero, BRAND_NAME, BRAND_TAGLINE } from '@/components/BrandLogo'
import { authTheme } from '@/components/auth/auth-theme'

export function AuthShell({
  children,
  title,
  subtitle,
  backHref = '/login',
  backLabel = 'Back to role selection',
  wide = false,
  step,
  totalSteps
}) {
  return (
    <div className={authTheme.page}>
      <div className={authTheme.split}>
        {/* Brand panel — desktop */}
        <div className={authTheme.brandPanel}>
          <div className={authTheme.brandGlow} />
          <div className={authTheme.brandGlow2} />

          <div className="relative z-10">
            <div className="rounded-2xl bg-white px-5 py-4 shadow-xl inline-block">
              <BrandLogoFull width={240} priority />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#c9a227]">
              {BRAND_NAME}
            </p>
            <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight">
              Intelligent Academic Scheduling
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
              {BRAND_TAGLINE}. Plan smarter, schedule faster, and deliver a seamless
              university experience for every stakeholder.
            </p>
          </div>

          <ul className="relative z-10 space-y-4 text-sm text-slate-300">
            {[
              'AI-powered timetable generation',
              'Role-based portals for all users',
              'Constraint-aware scheduling for students'
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9a227]" />
                {item}
              </li>
            ))}
          </ul>

          <p className="relative z-10 text-xs text-slate-500">
            © {new Date().getFullYear()} {BRAND_NAME}
          </p>
        </div>

        {/* Form panel */}
        <div className={authTheme.formPanel}>
          <div className="mx-auto w-full max-w-md lg:max-w-lg">
            {/* Mobile logo */}
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <AuthBrandHero width={220} />
            </div>

            <Link href={backHref} className={`${authTheme.backLink} mb-6`}>
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>

            {(title || subtitle) && (
              <div className="mb-6">
                {step && totalSteps && (
                  <div className="mb-4 flex gap-2">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i + 1 <= step ? 'bg-[#c9a227]' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                )}
                {title && <h1 className={authTheme.title}>{title}</h1>}
                {subtitle && <p className={authTheme.subtitle}>{subtitle}</p>}
              </div>
            )}

            <div className={wide ? authTheme.cardWide : authTheme.card}>{children}</div>

            <p className={authTheme.footer}>
              Secure access · {BRAND_NAME} Academic Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
