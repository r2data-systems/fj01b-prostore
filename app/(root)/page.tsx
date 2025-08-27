import { Button } from "@/components/ui/button";

export const metadata = {
	title: 'Home'
};

// make fn async for delayTest1 to work
const HomePage =  () => {
	//await new Promise(resolve => setTimeout(resolve, 1000));

	return ( <Button>Prostore</Button> );
}
 
export default HomePage;