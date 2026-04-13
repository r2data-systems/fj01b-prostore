import ProductForm from "@/components/admin/product-form";
import { getProductByID } from "@/lib/actions/product.actions";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
	title: 'Admin Product Update',
};

const AdminProductUpdatePage = async (props: {
	params: Promise<{ id: string; }>;
}) => {
	const {id} = await props.params;
	console.log(`products/id/page.tsx ${id}`);

	const product = await getProductByID(id);

	if (!product) {return notFound()}

  return (
		<div className="space-y-8 mx-auto max-w-5xl">
			<h1 className="h2-bold">Update Product</h1>
			<ProductForm type="Update" product={product} productID={product.id}/>
		</div>
	);
};
 
export default AdminProductUpdatePage;