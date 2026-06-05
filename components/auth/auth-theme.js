export const authTheme = {
  page: 'min-h-screen bg-[#f4f6f9]',
  split: 'min-h-screen lg:grid lg:grid-cols-2',
  brandPanel:
    'relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#001a4d] px-12 py-12 text-white',
  brandGlow:
    'pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#c9a227]/20 blur-3xl',
  brandGlow2:
    'pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl',
  formPanel: 'flex min-h-screen flex-col justify-center px-6 py-10 sm:px-10 lg:px-16',
  card: 'mx-auto w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/60',
  cardWide: 'mx-auto w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/60',
  title: 'font-serif text-2xl font-semibold tracking-tight text-[#001a4d] sm:text-3xl',
  subtitle: 'mt-2 text-sm text-slate-500 sm:text-base',
  label: 'text-sm font-medium text-slate-700',
  input:
    'h-11 border-slate-200 bg-slate-50/50 focus:border-[#001a4d] focus:bg-white focus:ring-[#001a4d]/20',
  primaryBtn:
    'h-11 w-full bg-[#001a4d] text-white hover:bg-[#002d6b] font-semibold shadow-md shadow-[#001a4d]/20',
  accentBtn:
    'h-11 w-full bg-[#c9a227] text-[#001a4d] hover:bg-[#b8921f] font-semibold shadow-md shadow-[#c9a227]/30',
  backLink: 'inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#001a4d] transition',
  footer: 'mt-8 text-center text-xs text-slate-400'
}

export const AUTH_ROLES = {
  admin: {
    id: 'admin',
    title: 'Administrator',
    shortTitle: 'Admin',
    description: 'Manage timetables, departments, faculty, and system settings.',
    loginPath: '/login/admin',
    signupPath: null,
    dashboardPath: '/admin/dashboard',
    icon: 'Shield',
    accent: 'from-[#001a4d] to-[#003580]',
    ring: 'ring-[#001a4d]/20 hover:ring-[#001a4d]/40'
  },
  student: {
    id: 'student',
    title: 'Student',
    shortTitle: 'Student',
    description: 'Submit constraints, pick your timetable, and view your schedule.',
    loginPath: '/login/student',
    signupPath: '/signup/student',
    dashboardPath: '/student/dashboard',
    icon: 'GraduationCap',
    accent: 'from-teal-600 to-emerald-600',
    ring: 'ring-teal-500/20 hover:ring-teal-500/40'
  },
  faculty: {
    id: 'faculty',
    title: 'Faculty',
    shortTitle: 'Faculty',
    description: 'View your timetable, set availability, and manage your profile.',
    loginPath: '/login/faculty',
    signupPath: '/signup/faculty',
    dashboardPath: '/faculty/dashboard',
    icon: 'BookOpen',
    accent: 'from-violet-600 to-purple-700',
    ring: 'ring-violet-500/20 hover:ring-violet-500/40'
  }
}
