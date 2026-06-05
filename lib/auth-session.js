import { cookies } from 'next/headers'

export async function getSessionUser() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('user_session')
    if (!sessionCookie?.value) return null
    return JSON.parse(sessionCookie.value)
  } catch {
    return null
  }
}

export function getSessionUserFromRequest(request) {
  try {
    const sessionCookie = request.cookies.get('user_session')
    if (!sessionCookie?.value) return null
    return JSON.parse(sessionCookie.value)
  } catch {
    return null
  }
}
