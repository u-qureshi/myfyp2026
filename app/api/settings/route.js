import { NextResponse } from 'next/server'
import {
  DEFAULT_SETTINGS,
  getAppSettings,
  patchAppSettings,
  saveAppSettings
} from '@/lib/legacy-store'

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

export async function GET() {
  try {
    const settings = await getAppSettings('admin')
    return handleCORS(NextResponse.json(settings))
  } catch (error) {
    console.error('Settings GET error:', error)
    return handleCORS(NextResponse.json(DEFAULT_SETTINGS))
  }
}

export async function PUT(request) {
  try {
    const payload = await request.json()
    await saveAppSettings(payload, 'admin')
    return handleCORS(NextResponse.json({ success: true }))
  } catch (error) {
    console.error('Settings PUT error:', error)
    return handleCORS(NextResponse.json({ error: 'Invalid payload' }, { status: 400 }))
  }
}

export async function PATCH(request) {
  try {
    const updates = await request.json()
    await patchAppSettings(updates, 'admin')
    return handleCORS(NextResponse.json({ success: true }))
  } catch (error) {
    console.error('Settings PATCH error:', error)
    return handleCORS(NextResponse.json({ error: 'Invalid payload' }, { status: 400 }))
  }
}
