'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Toaster } from 'sonner'
import { Menu, LogOut } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { BrandLogo } from '@/components/BrandLogo'
import { adminTheme } from '@/components/admin/admin-theme'

export function AdminPortalShell({
  children,
  title,
  subtitle,
  adminName = 'Administrator',
  currentPage,
  onPageChange,
  maxWidth = 'w-full'
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <>
      <Toaster />
      <div className={adminTheme.shell}>
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        <AdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPage={currentPage}
          onPageChange={onPageChange}
          adminName={adminName}
          onLogout={handleLogout}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className={adminTheme.header}>
            <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
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
                  <h1 className={adminTheme.pageTitle}>{title}</h1>
                  {subtitle && <p className={adminTheme.pageSubtitle}>{subtitle}</p>}
                </div>
              </div>
              <div className="hidden items-center gap-3 sm:flex shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#001a4d]">{adminName}</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <main className={`flex-1 p-4 md:p-6 lg:p-8 ${maxWidth}`}>
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
