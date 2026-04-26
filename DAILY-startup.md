1) webserver
		$> npm run dev
2) prisma server
		$> npx prisma dev

Prisma Studio loclahost:5555
  	$> npx prisma studio

Note: webserver must be running beforehand.

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

uploadThing

Image Location from db =     https://utfs.io/f/5lVCzAkG5YUHNrHzKZs4v2gX6RoUi5S9IGcYBADCzukaQjTp
from upload-V2.js data.url = https://utfs.io/f/5lVCzAkG5YUHtsAR36ier4WlpNkxfJqHU3OZ06avMYG29Kng

Git; Update Branch merge into main
----------------------------------
git branch -a
git checkout upload-thing-sdk-v7 

Stage changes
--------------
cd db
git add .
cd ..

clear; git log -n 4

Commit changes
--------------
git commit -m 'UP02-05; added banner and Typescript changes'

Revert to target branch and merge from upload-thing-sdk-v7
-----------------------------------------------------------
git checkout main
git merge upload-thing-sdk-v7 -m '115b; Bulk loading with TS and banner added'

Import Data

e.g. Users edit import file

$> cd db
$> node users-import2.mjs