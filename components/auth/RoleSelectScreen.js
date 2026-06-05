'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, GraduationCap, Shield } from 'lucide-react'
import { AuthBrandHero, BRAND_NAME, BRAND_TAGLINE } from '@/components/BrandLogo'
import { AUTH_ROLES, authTheme } from '@/components/auth/auth-theme'

const ICONS = { Shield, GraduationCap, BookOpen }

export function RoleSelectScreen({
  mode = 'login',
  roles = ['admin', 'student', 'faculty'],
  footerLink
}) {
  const isLogin = mode === 'login'
  const heading = isLogin ? 'Welcome Back' : 'Create Your Account'
  const subheading = isLogin
    ? 'Select your role to sign in to the portal'
    : 'Choose how you would like to register'

  return (
    <div className={authTheme.page}>
      <div className="relative min-h-screen overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#001a4d] via-[#002d6b] to-[#001a4d]" />
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#c9a227]/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12">
          {/* Header */}
          <div className="mb-10 text-center">
            <AuthBrandHero width={280} />
            <h1 className="mt-6 font-serif text-3xl font-semibold text-white sm:text-4xl">
              {heading}
            </h1>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">{subheading}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">
              {BRAND_TAGLINE}
            </p>
          </div>

          {/* Role cards */}
          <div
            className={`grid w-full gap-4 ${
              roles.length === 2 ? 'max-w-2xl sm:grid-cols-2' : 'max-w-3xl sm:grid-cols-3'
            }`}
          >
            {roles.map((roleId) => {
              const role = AUTH_ROLES[roleId]
              if (!role) return null
              const Icon = ICONS[role.icon]
              const href = isLogin ? role.loginPath : role.signupPath

              if (!href) {
                return (
                  <div
                    key={roleId}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center opacity-60"
                  >
                    <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${role.accent}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="font-serif text-lg font-semibold text-white">{role.title}</h2>
                    <p className="mt-2 text-xs text-slate-400">
                      Admin accounts are provisioned by your institution.
                    </p>
                  </div>
                )
              }

              return (
                <Link
                  key={roleId}
                  href={href}
                  className={`group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#c9a227]/40 hover:bg-white/10 hover:shadow-xl hover:shadow-black/20 ring-1 ring-transparent ${role.ring}`}
                >
                  <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${role.accent} shadow-lg transition-transform group-hover:scale-105`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="font-serif text-xl font-semibold text-white">
                    {isLogin ? `Login as ${role.shortTitle}` : `${role.title} Sign Up`}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{role.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#c9a227] transition group-hover:gap-2.5">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Footer links */}
          <div className="mt-10 text-center text-sm text-slate-400">
            {footerLink ? (
              <p>
                {footerLink.prompt}{' '}
                <Link href={footerLink.href} className="font-semibold text-[#c9a227] hover:underline">
                  {footerLink.label}
                </Link>
              </p>
            ) : null}
            <p className="mt-3 text-xs text-slate-500">
              © {new Date().getFullYear()} {BRAND_NAME} · All rights reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
