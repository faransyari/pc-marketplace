export function requireAuth(context) {
  const token = context.req?.headers.cookie?.match(/access=([^;]+)/)?.[1]
  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }
  return { props: {} }
}
