import '@/styles/globals.css'
import Layout from '@/components/Layout'
import { AuthProvider } from '@/lib/AuthContext'

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  )
}
