'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarBrandMark, BRAND_NAME } from '@/components/BrandLogo'
import {
  LayoutDashboard,
  Database,
  Brain,
  CalendarDays,
  Settings,
  Building2,
  Users,
  DoorOpen,
  BookOpen,
  LayoutGrid,
  UserCheck,
  SlidersHorizontal,
  AlertTriangle,
  BarChart2,
  LogOut,
  X,
  Clock
} from 'lucide-react'

const BRAND_LABEL = BRAND_NAME

const MAIN_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { id: 'data-management', label: 'Data Management', icon: Database, href: '/admin/dashboard?page=data-management' },
  { id: 'generate', label: 'Schedule Generation', icon: Brain, href: '/admin/dashboard?page=generate' },
  { id: 'view-timetable', label: 'View Schedules', icon: CalendarDays, href: '/admin/dashboard?page=view-timetable' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/dashboard?page=settings' }
]

const MANAGEMENT_ITEMS = [
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/faculty', label: 'Faculty', icon: Users },
  { href: '/admin/rooms', label: 'Rooms', icon: DoorOpen },
  { href: '/admin/subjects', label: 'Subjects', icon: BookOpen },
  { href: '/admin/sections', label: 'Sections', icon: LayoutGrid },
  { href: '/admin/student-requests', label: 'Student Requests', icon: UserCheck },
  { href: '/admin/faculty-requests', label: 'Faculty Availability', icon: Clock },
  { href: '/admin/constraints', label: 'Constraints', icon: SlidersHorizontal },
  { href: '/admin/emergency-update', label: 'Emergency Update', icon: AlertTriangle },
  { href: '/admin/reports', label: 'Reports', icon: BarChart2 }
]

function NavButton({ active, onClick, href, icon: Icon, label, onNavigate }) {
  const className = `flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
    active
      ? 'bg-[#c9a227] text-[#001a4d] shadow-md'
      : 'text-slate-300 hover:bg-white/10 hover:text-white'
  }`

  if (href) {
    return (
      <Link href={href} onClick={onNavigate} className={className}>
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{label}</span>
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  )
}

export function AdminSidebar({
  open,
  onClose,
  currentPage,
  onPageChange,
  adminName = 'Administrator',
  onLogout
}) {
  const pathname = usePathname()
  const isDashboard = pathname === '/admin/dashboard'
  const closeMobile = () => onClose?.()

  const handleInternalNav = (pageId) => {
    onPageChange?.(pageId)
    closeMobile()
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen w-[280px] min-w-[280px] flex-col border-r border-[#002d6b] bg-[#001a4d] text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand */}
      <div className="relative flex-shrink-0 border-b border-white/10 px-5 py-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <SidebarBrandMark size={72} priority />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
              {BRAND_LABEL}
            </p>
            <p className="mt-1 font-serif text-base font-semibold text-white">Admin Portal</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={closeMobile}
          className="absolute right-2 top-2 h-8 w-8 text-white hover:bg-white/10 lg:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#c9a227]">
          Main Menu
        </p>
        <nav className="space-y-1">
          {MAIN_ITEMS.map((item) => {
            const active = isDashboard && currentPage === item.id
            if (isDashboard && onPageChange) {
              return (
                <NavButton
                  key={item.id}
                  active={active}
                  onClick={() => handleInternalNav(item.id)}
                  icon={item.icon}
                  label={item.label}
                />
              )
            }
            return (
              <NavButton
                key={item.id}
                active={pathname === item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                onNavigate={closeMobile}
              />
            )
          })}
        </nav>

        <p className="mb-2 mt-5 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#c9a227]">
          Management
        </p>
        <nav className="space-y-1">
          {MANAGEMENT_ITEMS.map((item) => (
            <NavButton
              key={item.href}
              active={pathname === item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              onNavigate={closeMobile}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Footer — always visible logout */}
      <div className="flex-shrink-0 border-t border-white/10 p-4">
        <div className="mb-3 rounded-xl bg-white/10 px-3 py-2.5">
          <p className="truncate text-sm font-semibold text-white">{adminName}</p>
          <p className="truncate text-xs text-slate-400">Administrator</p>
        </div>
        <Button
          onClick={onLogout}
          variant="outline"
          className="h-10 w-full border-red-400/40 bg-transparent text-sm font-medium text-red-200 hover:bg-red-500/20 hover:text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
