'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Toaster } from 'sonner'
import {
  LayoutDashboard,
  Settings2,
  ListChecks,
  CalendarDays,
  Bell,
  User,
  LogOut,
  Menu,
  ChevronRight
} from 'lucide-react'
import { studentTheme, APP_NAME, PORTAL_NAME } from '@/components/student/student-theme'
import { BrandLogo, SidebarBrandMark, BrandLoadingScreen, AuthBrandHero } from '@/components/BrandLogo'
import { useStudentSession } from '@/hooks/useStudentSession'

const NAV_LINKS = [
  { id: 'dashboard', label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { id: 'constraints', label: 'My Constraints', href: '/student/constraints', icon: Settings2 },
  { id: 'pick', label: 'Pick Timetable', href: '/student/pick-timetable', icon: ListChecks },
  { id: 'timetable', label: 'My Timetable', href: '/student/dashboard', icon: CalendarDays, hash: 'timetable' },
  { id: 'notifications', label: 'Notifications', href: '/student/dashboard', icon: Bell, hash: 'notifications', badge: true },
  { id: 'profile', label: 'My Profile', href: '/student/dashboard', icon: User, hash: 'profile' }
]

function LoadingScreen() {
  return (
    <BrandLoadingScreen
      message="Loading portal..."
      submessage={`${APP_NAME} · ${PORTAL_NAME}`}
      className={`min-h-screen ${studentTheme.page}`}
    />
  )
}

export function StudentPortalShell({
  children,
  title,
  subtitle,
  breadcrumbs = [],
  activeNav,
  unreadCount = 0,
  user: userProp,
  loading: loadingProp,
  onLogout,
  maxWidth = 'w-full'
}) {
  const pathname = usePathname()
  const session = useStudentSession()
  const user = userProp ?? session.user
  const loading = loadingProp ?? session.loading
  const logout = onLogout ?? session.logout
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) return <LoadingScreen />
  if (!user) return null

  const resolvedActive =
    activeNav ||
    NAV_LINKS.find((item) => item.href === pathname && !item.hash)?.id ||
    'dashboard'

  return (
    <>
      <Toaster position="top-right" />
      <div className={studentTheme.shell}>
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        <aside
          className={`${studentTheme.sidebar} ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className={studentTheme.sidebarBrand}>
            <div className="flex flex-col items-center text-center gap-3">
              <SidebarBrandMark size={72} priority />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#c9a227]">
                  {APP_NAME}
                </p>
                <p className="font-serif text-xl font-semibold leading-tight mt-1.5">{PORTAL_NAME}</p>
                <p className="text-xs text-slate-400 mt-1 leading-snug">Intelligent Academic Scheduling</p>
              </div>
            </div>
          </div>

          <nav className={studentTheme.sidebarNav}>
            {NAV_LINKS.map((item) => {
              const Icon = item.icon
              const isActive = resolvedActive === item.id
              const href = item.hash ? `${item.href}#${item.hash}` : item.href

              return (
                <Link
                  key={item.id}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`${studentTheme.navItem} ${isActive ? studentTheme.navItemActive : ''}`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1 leading-snug">{item.label}</span>
                  {item.badge && unreadCount > 0 && (
                    <Badge className="h-5 min-w-5 rounded-full bg-red-500 px-1.5 text-[10px] text-white">
                      {unreadCount}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className={studentTheme.sidebarFooter}>
            <div className="mb-4 rounded-xl bg-white/10 px-4 py-3">
              <p className="truncate text-base font-semibold text-white">{user.name}</p>
              <p className="truncate text-sm text-slate-400 mt-0.5">{user.email}</p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="h-11 w-full border-red-400/40 bg-transparent text-base text-red-200 hover:bg-red-500/20 hover:text-white"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className={studentTheme.header}>
            <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden shrink-0"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <BrandLogo size={40} className="hidden md:block shrink-0" />
                <div className="min-w-0">
                  {breadcrumbs.length > 0 && (
                    <div className="mb-1 flex flex-wrap items-center gap-1 text-xs text-slate-500">
                      {breadcrumbs.map((crumb, i) => (
                        <span key={crumb} className="flex items-center gap-1">
                          {i > 0 && <ChevronRight className="h-3 w-3" />}
                          <span>{crumb}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  <h1 className={studentTheme.pageTitle}>{title}</h1>
                  {subtitle && <p className={studentTheme.pageSubtitle}>{subtitle}</p>}
                </div>
              </div>
              <div className="hidden items-center gap-3 sm:flex shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#001a4d]">{user.name}</p>
                  <p className="text-xs text-slate-500">Student</p>
                </div>
                <BrandLogo size={44} />
              </div>
            </div>
          </header>

          <main className={`flex-1 px-5 py-6 md:px-10 md:py-8 ${maxWidth}`}>
            {children}
          </main>

          <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500 md:px-8">
            © {new Date().getFullYear()} {APP_NAME} · Academic Scheduling System
          </footer>
        </div>
      </div>
    </>
  )
}

export function StudentAuthShell({ children, title, subtitle, step, totalSteps }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#001a4d]">
      <Toaster position="top-right" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-[#c9a227] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-500 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
        <div className="mb-8 text-center text-white">
          <AuthBrandHero width={240} className="mx-auto mb-5" />
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c9a227]">
            {APP_NAME}
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-2 text-slate-300">{subtitle}</p>}
          {step && totalSteps && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-12 rounded-full ${i + 1 <= step ? 'bg-[#c9a227]' : 'bg-white/20'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-full max-w-lg rounded-2xl border border-slate-200/20 bg-white p-6 shadow-2xl md:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
