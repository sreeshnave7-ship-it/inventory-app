import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export function exportMovementsToExcel(data) {
  const formatted = data.map((m) => ({
    Type: m.item_type,
    Quantity: m.quantity,
    From: m.from_location_type,
    To: m.to_location_type,
    User: m.user_name,
    Date: new Date(m.date).toLocaleString(),
    Challan: m.challan_number || '',
  }))

  const worksheet = XLSX.utils.json_to_sheet(formatted)
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Movements')

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  })

  const file = new Blob([excelBuffer], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  saveAs(file, `movements_${Date.now()}.xlsx`)
}