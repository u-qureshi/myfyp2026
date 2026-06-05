/** Shared university portal design tokens (Tailwind class groups) */
export const studentTheme = {
  page: 'min-h-screen bg-[#f4f6f9]',
  shell: 'min-h-screen bg-[#f4f6f9] lg:flex',
  sidebar:
    'fixed left-0 top-0 z-50 flex h-screen min-h-screen w-[320px] min-w-[320px] flex-col bg-[#001a4d] text-white transition-transform duration-300 lg:static lg:translate-x-0 lg:flex-shrink-0 border-r border-[#002d6b]',
  sidebarBrand: 'border-b border-white/10 px-6 py-6',
  sidebarNav: 'flex-1 space-y-1.5 px-4 py-5 overflow-y-auto',
  navItem:
    'flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-[15px] font-medium text-slate-200 transition hover:bg-white/10 hover:text-white',
  navItemActive: 'bg-[#c9a227] text-[#001a4d] shadow-md hover:bg-[#d4ad2e] hover:text-[#001a4d]',
  sidebarFooter: 'border-t border-white/10 p-5',
  header:
    'sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90',
  pageTitle: 'text-2xl md:text-3xl font-serif font-semibold tracking-tight text-[#001a4d]',
  pageSubtitle: 'text-sm md:text-base text-slate-500',
  card: 'border border-slate-200/80 bg-white shadow-sm rounded-xl overflow-hidden',
  cardHeader: 'border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4',
  primaryBtn: 'bg-[#001a4d] hover:bg-[#002d6b] text-white',
  accentBtn: 'bg-[#c9a227] hover:bg-[#b8921f] text-[#001a4d] font-semibold',
  statValue: 'text-3xl font-serif font-bold text-[#001a4d]',
  badgeGold: 'bg-[#c9a227]/15 text-[#8a6d12] border-[#c9a227]/30',
  badgeNavy: 'bg-[#001a4d]/10 text-[#001a4d] border-[#001a4d]/20'
}

export const APP_NAME = 'SmartScheduler'
export const PORTAL_NAME = 'Student Portal'
