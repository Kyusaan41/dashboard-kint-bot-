'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'

export default function BanGuard() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const isPublic = pathname === '/login' || pathname === '/banned'
    if (status !== 'authenticated' || !session?.user?.id || isPublic) {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = null
      return
    }

    let stop = false
    const check = async () => {
      try {
        const res = await fetch(`/api/ban-check?userId=${encodeURIComponent(session.user.id)}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (data?.banned) {
          stop = true
          if (timerRef.current) clearInterval(timerRef.current)
          timerRef.current = null
          router.replace('/banned')
        }
      } catch {}
    }

    // Initial check and fast interval for responsiveness
    check()
    timerRef.current = setInterval(() => {
      if (!stop) check()
    }, 3000)

    const onFocus = () => { if (!stop) check() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = null
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [status, session?.user?.id, pathname, router])

  return null
}
