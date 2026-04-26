'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SplashScreen from '@/components/shared/SplashScreen'
import { getSession } from '@/lib/storage'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      const session = getSession()
      if (session) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }, 1000) // 1000ms — within 800-2000ms window

    return () => clearTimeout(timer)
  }, [router])

  return <SplashScreen />
}