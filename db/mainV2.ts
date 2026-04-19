import { PrismaClient, Prisma } from '@prisma/client';
import sampleData from "./sample-data.js";
import uploadFiles, { uploadBannerV2 } from './upload-thing-sdk-v7/upload-V2.ts';

const prisma = new PrismaClient();

type SampleProduct = {
  slug: string;
  images: string[];
  banner?: string | null;
  // add other fields from your schema here
};

async function processProducts(sampleData: { products: SampleProduct[] }, basePath: string) {
  for (const prodItem of sampleData.products) {
    console.log(prodItem.slug);

    // Clone to avoid mutating original input
    const updatedImages: string[] = prodItem.images.map((imageItem) => {
      const fullPath = `${basePath}${imageItem}`;
      console.log(fullPath);
      return fullPath;
    });

    console.log(updatedImages);

    // Upload images
    const resImages = await uploadFiles(updatedImages);
    console.dir(resImages, { depth: null });

    let resBanner: string | null = null;

    if (prodItem.banner) {
      const bannerFilePath = `${basePath}/images/${prodItem.banner}`;
      console.log(`bannerFilePath: ${bannerFilePath}`);

      resBanner = await uploadBannerV2(bannerFilePath);
      console.dir(resBanner, { depth: null });
    }

    const newProduct: Prisma.ProductCreateInput = {
      ...prodItem,
      images: resImages,
      banner: resBanner,
    };

    console.dir(newProduct, { depth: null });

    // Transaction per product
    await prisma.$transaction(async (tx) => {
      await tx.product.create({
        data: newProduct,
      });

      // If you had related inserts, they'd go here
      // e.g.:
      // await tx.productImage.createMany({ data: ... })
    });
  }
}