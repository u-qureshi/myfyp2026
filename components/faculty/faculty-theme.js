/** Shared faculty portal design tokens (Tailwind class groups) */
export const facultyTheme = {
  page: 'min-h-screen bg-[#f4f6f9]',
  shell: 'min-h-screen bg-[#f4f6f9] lg:flex',
  sidebar:
    'fixed left-0 top-0 z-50 flex h-screen min-h-screen w-[280px] min-w-[280px] flex-col bg-[#001a4d] text-white transition-transform duration-300 lg:static lg:translate-x-0 lg:flex-shrink-0 border-r border-[#002d6b]',
  sidebarBrand: 'relative border-b border-white/10 px-5 py-5',
  sidebarNav: 'flex-1 space-y-1 px-3 py-4 overflow-y-auto',
  navItem:
    'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white',
  navItemActive: 'bg-[#c9a227] text-[#001a4d] shadow-md hover:bg-[#d4ad2e] hover:text-[#001a4d]',
  sidebarFooter: 'flex-shrink-0 border-t border-white/10 p-4',
  header:
    'sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90',
  pageTitle: 'text-2xl md:text-3xl font-serif font-semibold tracking-tight text-[#001a4d]',
  pageSubtitle: 'text-sm text-slate-500',
  primaryBtn: 'bg-[#001a4d] hover:bg-[#002d6b] text-white',
  accentBtn: 'bg-[#c9a227] hover:bg-[#b8921f] text-[#001a4d] font-semibold',
  statValue: 'text-3xl font-serif font-bold text-[#001a4d]',
  welcomeCard: 'border-0 shadow-md bg-gradient-to-r from-[#001a4d]/5 to-[#002d6b]/10 border-l-4 border-l-[#001a4d]',
  timetableCell: 'bg-[#001a4d]/10 p-2 rounded text-xs',
  timetableCellTitle: 'font-semibold text-[#001a4d]',
  timetableCellSub: 'text-[#002d6b]'
}

export const APP_NAME = 'SmartScheduler'
export const PORTAL_NAME = 'Faculty Portal'
