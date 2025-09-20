1) webserver
		$> npm run dev
2) prisma server
		$> npx prisma dev

Prisma Studio
  	$> npx prisma studio

Re-seed
		$> npx tsx ./db/seed

Migrate - create ORM fn from schema
		$> npx prisma migrate dev --name init
  
From scratch
$> npm run clean
$> npx prisma dev // separate window
$> npx prisma migrate reset --force
$> npx prisma migrate dev --name init // name like msg in commit; needs to be informative
$> npx prisma generate
$> npx next build
