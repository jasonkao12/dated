'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, BookHeart, MapPin, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'Plan a Date',   href: '/ideas',        icon: Sparkles   },
  { label: 'My Dates',      href: '/my-dates',     icon: BookHeart  },
  { label: 'My Locations',  href: '/my-locations', icon: MapPin     },
  { label: 'Profile',       href: '/profile',      icon: User       },
]

export function BottomNav() {
  const pathname = usePathname()

  // Hide on auth pages
  if (['/login', '/signup', '/verify-email'].some(p => pathname.startsWith(p))) return null

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="grid grid-cols-4 h-16">
        {TABS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
