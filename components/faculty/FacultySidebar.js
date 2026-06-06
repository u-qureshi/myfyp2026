'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarBrandMark, BRAND_NAME } from '@/components/BrandLogo'
import { facultyTheme } from '@/components/faculty/faculty-theme'
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Bell,
  User,
  LogOut,
  X
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'timetable', label: 'My Timetable', icon: CalendarDays },
  { id: 'availability', label: 'My Availability', icon: Clock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'My Profile', icon: User }
]

function NavButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${facultyTheme.navItem} ${active ? facultyTheme.navItemActive : ''}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  )
}

export function FacultySidebar({
  open,
  onClose,
  currentPage,
  onPageChange,
  facultyName = 'Faculty Member',
  designation = 'Faculty',
  onLogout
}) {
  const closeMobile = () => onClose?.()

  const handleNav = (pageId) => {
    onPageChange?.(pageId)
    closeMobile()
  }

  return (
    <aside
      className={`${facultyTheme.sidebar} ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      <div className={facultyTheme.sidebarBrand}>
        <div className="flex flex-col items-center gap-2 text-center">
          <SidebarBrandMark size={72} priority />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
              {BRAND_NAME}
            </p>
            <p className="mt-1 font-serif text-base font-semibold text-white">Faculty Portal</p>
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

      <ScrollArea className="flex-1 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#c9a227]">
          Main Menu
        </p>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              active={currentPage === item.id}
              onClick={() => handleNav(item.id)}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </nav>
      </ScrollArea>

      <div className={facultyTheme.sidebarFooter}>
        <div className="mb-3 rounded-xl bg-white/10 px-3 py-2.5">
          <p className="truncate text-sm font-semibold text-white">{facultyName}</p>
          <p className="truncate text-xs text-slate-400">{designation}</p>
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
