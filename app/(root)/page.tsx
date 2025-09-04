//import sampleData from "@/db/sample-data";
import { getLatestProducts } from "@/lib/actions/product.actions";
import ProductList from "@/components/product/product-list";

export const metadata = {
	title: 'Home'
};

// make fn async for delayTest1 to work
const HomePage =  async () => {
	//await new Promise(resolve => setTimeout(resolve, 1000));
	console.log('sampleData.products');
	const latestProducts = await getLatestProducts();

	return ( 
		<>
			<ProductList data={latestProducts} title="Newest Arrivals" limit={4}/>
		</>
	);
}
 
export default HomePage;