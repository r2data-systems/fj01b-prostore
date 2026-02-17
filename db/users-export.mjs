/*
(node:5315) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///home/feddev/projects/fj-shopping-platform/01b-prostore/db/export-users.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /home/feddev/projects/fj-shopping-platform/01b-prostore/package.json.

OR

rename export-users.ts -> export-users.mjs

*/

import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'

const prisma = new PrismaClient()

async function exportData() {
  const data = await prisma.user.findMany() // Replace 'user' with your model
  await fs.writeFile('users-data-exp.json', JSON.stringify(data, null, 2), 'utf-8')
  console.log('Data exported successfully')
}

exportData()
