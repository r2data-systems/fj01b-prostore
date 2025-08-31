import sampleData from "@/db/sample-data";
import ProductList from "@/components/product/product-list";

export const metadata = {
	title: 'Home'
};

// make fn async for delayTest1 to work
const HomePage =  () => {
	//await new Promise(resolve => setTimeout(resolve, 1000));
	console.log(sampleData.products);

	return ( 
		<>
			<ProductList data={sampleData.products} title="Newest Arrivals" limit={4}/>
		</>
	);
}
 
export default HomePage;