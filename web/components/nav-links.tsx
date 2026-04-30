'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

const NAV = [
  { label: 'Feed',         href: '/dates'        },
  { label: 'Trending',     href: '/trending'     },
  { label: 'Places',       href: '/places'       },
  { label: 'Date Builder', href: '/date-builder' },
]

const AUTH_NAV = [
  { label: 'My Dates',    href: '/my-dates'    },
  { label: 'Collections', href: '/collections' },
  { label: 'Insights',    href: '/insights'    },
]

type Props = {
  user: User | null
  profile: { username: string; display_name: string | null; avatar_url: string | null } | null
}

export function NavLinks({ user }: Props) {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex items-center gap-1">
      {NAV.map(({ label, href }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
              active
                ? 'bg-secondary text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {label}
          </Link>
        )
      })}
      {user && (
        <>
          {AUTH_NAV.map(({ label, href }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
                  active
                    ? 'bg-secondary text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {label}
              </Link>
            )
          })}
          <Link
            href="/profile"
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
              pathname.startsWith('/u/') || pathname === '/profile'
                ? 'bg-secondary text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            Profile
          </Link>
        </>
      )}
    </nav>
  )
}
