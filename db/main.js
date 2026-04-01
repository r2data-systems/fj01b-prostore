import { PrismaClient } from "@prisma/client";

import sampleData from "./sample-data.ts";
import uploadFiles from './upload-thing-sdk-v7/upload-V2.js';

const basePath = '/home/feddev/projects/fj-shopping-platform/resources';

async function main() {
	const prisma = new PrismaClient();
	await prisma.product.deleteMany();


	sampleData.products.forEach(async (prodItem) => {
		// Object data from sample data
		console.log(prodItem.slug);
		prodItem.images.forEach((imageItem, index) => {
			console.log(imageItem);
			prodItem.images[index] = `${basePath}${imageItem}`;
		})

		// images data amended with basePath
		console.log(prodItem.images);

		// upload images to uploadthing and retrieve url
		const res = await uploadFiles(prodItem.images);
		console.dir(res, { depth: null }); // uploadThing Images

		const newProduct = {...prodItem, images: res};
		console.dir(newProduct, { depth: null });

		// write product record
		await prisma.product.createMany({data: newProduct})
	});

}

main();
