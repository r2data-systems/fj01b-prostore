'use client';

import { Review } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { User, Calendar } from "lucide-react";
import ReviewForm from "./review-form";
import { getReviews } from "@/lib/actions/review.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import Rating from "@/components/shared/product/rating";

const ReviewList = ({userID, productID, productSlug}: {
	userID: string;
	productID: string;
	productSlug: string;
}) => {
	console.log(userID, productID, productSlug);

	const [reviews, setReviews] = useState<Review[]>([]);

	useEffect(() => {
		const loadReviews = async () => {
			const res = await getReviews({productID});
			setReviews(res.data);
		};

		loadReviews();
	}, [productID]);

	const reload = () => {
		console.log('Review Submitted');
	};

	return (
    <div className="space-y-4">
      {reviews.length === 0 && <div>No Reviews Available</div>}
      {userID ? (
        <>
          {/*REVIEW LINK HERE*/}
          <ReviewForm
            userID={userID}
            productID={productID}
            onReviewSubmitted={reload}
          />
        </>
      ) : (
        <div>
          Please
          <Link
            className="text-blue-700 px-2"
            href={`/sign-in?callbackUrl=/product/${productSlug}`}
          >
            Sign In
          </Link>
          to write a review
        </div>
      )}
      <div className="flex flex-col gap-3">
        {/* REVIEWS HERE */}
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex-between">
                <CardTitle>{review.title}</CardTitle>
              </div>
              <CardDescription>{review.description}</CardDescription>
            </CardHeader>
						<CardContent>
							<div className="flex space-x-4 text-sm text-muted-foreground">
								{/*RATINGS*/}
								<Rating value={review.rating} />
								<div className="flex items-center">
									{/*user icon*/}
									<User className="mr-1 h-3 w-3"/>
									{review.user ? review.user.name : 'User' }
								</div>
								<div className="flex items-center">
									<Calendar className="mr-1 h-3 w-3"/>
									{formatDateTime(review.createdAt).dateTime}
								</div>
							</div>
						</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
 
export default ReviewList;