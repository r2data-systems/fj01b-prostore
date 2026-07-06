import { PrismaClient } from '@prisma/client'
import { hashSync } from 'bcrypt-ts-edge'
import fs from 'fs/promises'

const prisma = new PrismaClient()

async function importData() {
  const fileContent = await fs.readFile('users-data-imp.json', 'utf-8')
  const data = JSON.parse(fileContent)

	console.log(`password:`,data[0].password)

  // Use createMany to insert data
	//await prisma.user.createMany({
  //  data: data,
  //  skipDuplicates: true, // Optional: useful if reloading
  //})

	data.map(async (user) => {
		const passwordEncrypted = hashSync(user.password, 10);
		await prisma.user.create({ data: 
			{
				...user,
				password: passwordEncrypted,
			}
		})
	});
  console.log('Data imported successfully')
}

importData()
