import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'

const prisma = new PrismaClient()

async function importData() {
  const fileContent = await fs.readFile('users-data-imp.json', 'utf-8')
  const data = JSON.parse(fileContent)

	console.log(`password:`,data[0].password)

  // Use createMany to insert data
	
  await prisma.user.createMany({
    data: data,
    skipDuplicates: true, // Optional: useful if reloading
  })
  console.log('Data imported successfully')
}

importData()
