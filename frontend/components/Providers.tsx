'use client'
import { AuthProvider } from '@/lib/AuthContext'
import { SiteProvider } from '@/lib/SiteContext'
import { BuildProvider } from '@/lib/BuildContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SiteProvider>
        <BuildProvider>{children}</BuildProvider>
      </SiteProvider>
    </AuthProvider>
  )
}
