import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { isValidDataType, replaceUploadedData } from '@/lib/legacy-store'

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

async function parseExcelFile(buffer, type) {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

  return data.map((row, index) => ({
    id: uuidv4(),
    ...row,
    uploadedAt: new Date().toISOString(),
    type,
    order: index
  }))
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const type = formData.get('type')

    if (!file) {
      return handleCORS(NextResponse.json({ error: 'No file provided' }, { status: 400 }))
    }

    if (!type) {
      return handleCORS(NextResponse.json({ error: 'File type is required' }, { status: 400 }))
    }

    if (!isValidDataType(type)) {
      return handleCORS(
        NextResponse.json(
          { error: 'Invalid file type. Allowed types: students, faculty, rooms' },
          { status: 400 }
        )
      )
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return handleCORS(NextResponse.json({ error: 'File size too large. Maximum size is 10MB' }, { status: 400 }))
    }

    const allowedExtensions = ['.xlsx', '.xls', '.csv']
    const fileExtension = file.name.split('.').pop().toLowerCase()
    if (!allowedExtensions.includes(`.${fileExtension}`)) {
      return handleCORS(
        NextResponse.json(
          { error: 'Invalid file format. Allowed formats: .xlsx, .xls, .csv' },
          { status: 400 }
        )
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const parsedData = await parseExcelFile(buffer, type)

    if (!parsedData.length) {
      return handleCORS(NextResponse.json({ error: 'No data found in the uploaded file' }, { status: 400 }))
    }

    await replaceUploadedData(type, parsedData)
    console.log(`Saved ${parsedData.length} ${type} records to Supabase`)

    return handleCORS(
      NextResponse.json({
        message: `${type} data uploaded successfully`,
        data: parsedData,
        count: parsedData.length
      })
    )
  } catch (error) {
    console.error('Upload error:', error)
    return handleCORS(NextResponse.json({ error: 'Failed to process file' }, { status: 500 }))
  }
}
