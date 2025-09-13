// prisma-V6.ts
// or relative, like '../../generated/prisma'
//import { PrismaClient } from '@/lib/generated/prisma'; 
import { PrismaClient } from '@prisma/client'; 
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