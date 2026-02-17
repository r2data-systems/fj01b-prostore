import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'

const prisma = new PrismaClient()

async function importData() {
  const fileContent = await fs.readFile('orders-data-imp.json', 'utf-8')
  const data = JSON.parse(fileContent)

	data.map(async (order) => {
		await prisma.order.create({ data: 
			{
				...order,
			}
		})
	});
  console.log('Data imported successfully')
}

importData()
