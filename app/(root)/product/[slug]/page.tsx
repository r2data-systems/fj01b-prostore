import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";

const ProductDetailsPage = async (props: {
	params: Promise<{slug: string }>
}) => {
	const {slug} = await props.params;
	const product = await getProductBySlug(slug);
	if (!product) notFound();

  return (
    <>
      <h1>{product.name}</h1>
      <p>{slug}</p>
    </>
  );
};

export default ProductDetailsPage;
