-- CreateTable
CREATE TABLE "public"."Review" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userID" UUID NOT NULL,
    "productID" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_productID_fkey" FOREIGN KEY ("productID") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
