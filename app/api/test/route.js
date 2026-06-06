import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function GET() {
  try {
    const { error } = await supabaseServer.from('departments').select('id').limit(1)

    if (error) throw error

    return NextResponse.json({
      database: 'Supabase PostgreSQL',
      status: 'Connected successfully',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'
    })
  } catch (error) {
    return NextResponse.json(
      {
        database: 'Supabase PostgreSQL',
        status: 'Connection failed',
        error: error.message
      },
      { status: 500 }
    )
  }
}
