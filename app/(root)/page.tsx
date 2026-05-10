//import sampleData from "@/db/sample-data";
import { getFeaturedProducts, getLatestProducts } from "@/lib/actions/product.actions";
import ProductList from "@/components/shared/product/product-list";
import ProductCarousel from "@/components/shared/product/product-carousel";

export const metadata = {
	title: 'Home'
};

// make fn async for delayTest1 to work
const HomePage =  async () => {
	//await new Promise(resolve => setTimeout(resolve, 1000));
	console.log('sampleData.products');
	const latestProducts = await getLatestProducts();
	const featuredProducts = await getFeaturedProducts();

	return ( 
		<>
			{ featuredProducts.length > 0 && <ProductCarousel data={featuredProducts}/>}
			<ProductList data={latestProducts} title="Newest Arrivals" limit={4}/>
		</>
	);
}
 
export default HomePage;