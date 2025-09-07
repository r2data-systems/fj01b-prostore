// prisma-V6.ts
import { PrismaClient } from '@/lib/generated/prisma'; // or relative, like '../../generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon';
 
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
export const prisma = new PrismaClient({ adapter }).$extends({
  result: {
    product: {
      price: {
        compute(product) {
          return product.price.toString();
        },
      },
      rating: {
        compute(product) {
          return product.rating.toString();
        },
      },
    },
  },
});