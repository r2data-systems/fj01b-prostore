import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'

const prisma = new PrismaClient()

async function exportData() {
  const data = await prisma.order.findMany()
  await fs.writeFile('orders-data-exp.json', JSON.stringify(data, null, 2), 'utf-8')
  console.log('Data exported successfully')
}

exportData()
