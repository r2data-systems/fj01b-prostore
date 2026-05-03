'use client';

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";

const AdminSearch = () => {
	const pathname = usePathname();
	const formActionURL = pathname.includes('/admin/orders') ? '/admin/orders' : pathname.includes('/admin/users') ? '/admin/users' : '/admin/products';
	//let formActionURL

	// Use switch to map or change pathname
	//switch (pathname) {
  //  case '/admin/orders':
  //    formActionURL = '/admin/orders';
  //    break;
  //  case '/admin/users':
  //    formActionURL = '/admin/users';
  //    break;
  //  case '/admin/products':
  //    formActionURL = '/admin/products';
  //    break;
  //  default:
  //    formActionURL = '/404';
  //};

	const searchParams = useSearchParams();
  const [queryValue, setQueryValue] = useState(searchParams.get('query') || '');

	useEffect(() => {
		setQueryValue(searchParams.get('query') || '')
	}, [searchParams]);


	return (
		<form action={formActionURL} method="GET">
			<Input type="search" placeholder="Search..." name="query" value={queryValue} 
				onChange={(e) => setQueryValue(e.target.value)}
				className="md:w-[100px] lg:w-[300px]"
			/>
			<button className="sr-only" type="submit">
				Search
			</button>
		</form>
	);
}
 
export default AdminSearch;