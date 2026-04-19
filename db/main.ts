import { PrismaClient, Prisma } from '@prisma/client';

import sampleData from "./sample-data.js";
import { uploadImagesV2 as uploadFiles, uploadBannerV2 } from './upload-thing-sdk-v7/upload-V2.ts';

//type Product = z.infer<typeof insertProductSchema>;
type Product = {
	name: string;
	slug: string;
	category: string;
	brand: string;
	description: string;
	stock: number;
	numReviews: number;
	images: string[];
	isFeatured: boolean;
	banner: string | null;
	price: string | number;
}

const basePath = '/home/feddev/projects/fj-shopping-platform/resources';

async function main(newProducts: Product[]) {
	console.log('START');
	const prisma = new PrismaClient();
	await prisma.product.deleteMany();

	for (const prodItem of newProducts) {
		// Object data from sample data
		console.log(prodItem.slug);

		// Clone to avoid mutating original input
		const updatedImages: string[] = prodItem.images.map((imageItem) => {
			const fullPath = `${basePath}${imageItem}`;
			//console.log(fullPath);
			return fullPath;
		});

		// images data amended with basePath
		console.log('updatedImages', updatedImages);

		// upload images to uploadthing and retrieve url
		const resImages = await uploadFiles(updatedImages);
		console.log('### resImages ###')
		console.dir(resImages, { depth: null }); // uploadThing Images

		// add /home/feddev/projects/fj-shopping-platform/resources/images to ./banner-1.jpg
    let resBanner: string | null = null;

    if (prodItem.banner) {
      const bannerFilePath = `${basePath}/images/${prodItem.banner}`;
      console.log(`bannerFilePath: ${bannerFilePath}`);

      resBanner = await uploadBannerV2(bannerFilePath);
			console.log('### resBanner ###')
      console.dir(resBanner, { depth: null });
    }

		const newProduct: Prisma.ProductCreateInput = {
      ...prodItem,
      images: resImages,
      banner: resBanner,
    };
		console.dir(newProduct, { depth: null });

		// write product record
		await prisma.product.create({data: newProduct})
	//});
	};

}

main(sampleData.products);
