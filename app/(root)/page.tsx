import { Button } from "@/components/ui/button";
import { resolve } from "path";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const metadata = {
	title: 'Home'
};

const HomePage = async () => {
	await delay(3000);
	return ( <Button>Prostore</Button> );
}
 
export default HomePage;