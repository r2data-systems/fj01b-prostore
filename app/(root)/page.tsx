import { Button } from "@/components/ui/button";

const delayTest1 = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const metadata = {
	title: 'Home'
};

// make fn async for delayTest1 to work
const HomePage = async () => {
	//await delayTest1(3000);
	await new Promise(resolve => setTimeout(resolve, 1000));

	return ( <Button>Prostore</Button> );
}
 
export default HomePage;