1) webserver
		$> npm run dev
2) prisma server
		$> npx prisma dev

Prisma Studio loclahost:5555
  	$> npx prisma studio

Re-seed
		$> npx tsx ./db/seed

Migrate - create ORM fn from schema
		$> npx prisma migrate dev --name init

Re-build after changes to schema.prism
  $> npx prisma generate
	$> npx prisma migrate dev --name refactore OrderItem

From scratch
$> npm run clean
$> npx prisma dev // separate window
$> npx prisma migrate reset --force
$> npx prisma migrate dev --name init // name like msg in commit; needs to be informative
$> npx prisma generate
$> npx next build

Changes to Prisma 
1. Change prisma schema
2. Run the Migration Command
-   npx prisma migrate dev --name your_migration_name
3. Generate the Prisma Client
-   npx prisma generate
4. Check the Output
5. Reset Prisma Studio
-   npx prisma studio
