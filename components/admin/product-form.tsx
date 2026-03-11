'use client';

import { useToast } from "@/hooks/use-toast";
import { insertProductSchema, testProductSchema, updateProductSchema } from "@/lib/validators";
import { Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ControllerRenderProps, SubmitHandler, useForm } from 'react-hook-form';
import { productDefaultValues, bradsDefaultValues } from '@/lib/constants';
import { z } from 'zod';
import { Form } from "../ui/form";
import { Button } from "../ui/button";

const ProductForm = ({
  type,
  product,
  productID,
}: {
  type: 'Create' | 'Update';
  product?: Product;
  productID?: string;
}) => {
	const router = useRouter();
	const {toast} = useToast();

	// original
	//const form = useForm<z.infer<typeof insertProductSchema>>({
	//	resolver: type === 'Update' ? zodResolver(updateProductSchema) : zodResolver(insertProductSchema),
	//	defaultValues: product && type === 'Update' ? product : productDefaultValues ,
	//});

	// from questions
	//let defaultValues = productDefaultValues;
	let schemaToUse = insertProductSchema;
	if (type === "Update") schemaToUse = updateProductSchema;
	//if (product && type === "Update") defaultValues = product;
	 
	const form = useForm<z.infer<typeof schemaToUse>>({
		resolver: zodResolver(schemaToUse),
		defaultValues: product && type === 'Update' ? product : productDefaultValues ,
	});

	return (
		<Form {...form}>
			<form className="space-y-8">
				<div className="flex flex-col md:flex-row gap-5">
					{/*Name*/}
					{/*Slug*/}
				</div>
				<div className="flex flex-col md:flex-row gap-5">
					{/*Category*/}
					{/*Brand*/}
				</div>
				<div className="flex flex-col md:flex-row gap-5">
					{/*Price*/}
					{/*Stock*/}
				</div>
				<div className="upload-field flex flex-col md:flex-row gap-5">
					{/*Images*/}
				</div>
				<div className="upload-field">
					{/*isFeatured*/}
				</div>
				<div>
					{/*description*/}
				</div>
				<div>
					<Button>Submit</Button>
				</div>
			</form>
		</Form>
	);
};
 
export default ProductForm;