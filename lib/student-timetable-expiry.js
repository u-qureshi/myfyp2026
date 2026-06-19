export const TIMETABLE_VALIDITY_MONTHS = 4

export function computeTimetableExpiry(fromDate = new Date()) {
  const d = new Date(fromDate)
  d.setMonth(d.getMonth() + TIMETABLE_VALIDITY_MONTHS)
  return d.toISOString()
}

export function getRowExpiry(row, { expiresField, fallbackDateField }) {
  if (row[expiresField]) return row[expiresField]
  if (row[fallbackDateField]) return computeTimetableExpiry(row[fallbackDateField])
  return computeTimetableExpiry()
}

export function isExpiredRow(row, { expiresField, fallbackDateField }) {
  const expiry = getRowExpiry(row, { expiresField, fallbackDateField })
  return new Date(expiry) < new Date()
}
