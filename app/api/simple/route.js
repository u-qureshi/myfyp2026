import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function GET() {
  try {
    await supabaseServer.from('departments').select('id').limit(1)
    return NextResponse.json({ message: 'SmartScheduler.AI Backend Ready', database: 'Supabase' })
  } catch (error) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    return NextResponse.json({ message: 'POST request received', data: body })
  } catch (error) {
    return NextResponse.json({ error: 'Request processing failed' }, { status: 500 })
  }
}
