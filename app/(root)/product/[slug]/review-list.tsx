'use client';

import { Review } from "@/types";
import Link from "next/link";
import { useState } from "react";
import ReviewForm from "./review-form";

const ReviewList = ({userID, productID, productSlug}: {
	userID: string;
	productID: string;
	productSlug: string;
}) => {
	console.log(userID, productID, productSlug);

	const [reviews, setReviews] = useState<Review[]>([])

	return (
		<div className="space-y-4">
			{reviews.length === 0 && <div>No Reviews Available</div>}
			{userID ? (
					<>
						{/*REVIEW LINK HERE*/}
						<ReviewForm userID={userID} productID={productID}/>
					</>
				) : (
					<div>
						Please
						<Link className="text-blue-700 px-2" href={`/sign-in?callbackUrl=/product/${productSlug}`}>Sign In</Link>
						to write a review
					</div>
				)
			}
			<div className="flex flex-col gap-3">{/* REVIEWS HERE */}</div>
		</div>
	);
}
 
export default ReviewList;