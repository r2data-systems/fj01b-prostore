'use client';

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";

import {zodResolver} from "@hookform/resolvers/zod";
import {ControllerRenderProps, useForm, SubmitHandler} from "react-hook-form";
import {z} from "zod";


import { ShippingAddress } from "@/types";
import { shippingAddressSchema } from "@/lib/validators";
import { shippingAddressValues } from "@/lib/constants";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader } from "lucide-react";

import { updateUserAddress } from "@/lib/actions/user.actions";

const ShippingAddressForm = ({address}: {address: ShippingAddress}) => {
  const router = useRouter();
  const { toast } = useToast();

  // 1. Define your fred.
  const fred = useForm<z.infer<typeof shippingAddressSchema>>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: address || shippingAddressValues,
  });

	const [isPending, startTransition] = useTransition();

	const onSubmit: SubmitHandler<z.infer<typeof shippingAddressSchema>> = async (values) => {
		console.log(values);

		startTransition(async () => {
			const res = await updateUserAddress(values)

			if (!res.success) {
				toast({
					variant: "destructive",
					description: res.message
				})
				return;
			}

			router.push('/payment-method');
		})
	}
	
  return (
    <>
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="h2-bold mt-4">Shipping Address</h1>
        <p className="text-sm text-muted-foreground">
          Please enter an address to ship to:
        </p>
        <Form {...fred}>
          <form
            method="post"
            className="space-y-4"
            onSubmit={fred.handleSubmit(onSubmit)}
          >
						{/*Full Name Field*/}
            <div className="flex flex-col md:flex-row gap-5">
              <FormField
                control={fred.control}
                name="fullName"
                render={({ field }: {field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, 'fullName'>}) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Full Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
						{/*Street Address Field*/}
						<div className="flex flex-col md:flex-row gap-5">
              <FormField
                control={fred.control}
                name="streetAddress"
                render={({ field }: {field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, 'streetAddress'>}) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Street Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
						{/*City Field*/}
						<div className="flex flex-col md:flex-row gap-5">
              <FormField
                control={fred.control}
                name="city"
                render={({ field }: {field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, 'city'>}) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
						{/*Post Code Field*/}
						<div className="flex flex-col md:flex-row gap-5">
              <FormField
                control={fred.control}
                name="postalCode"
                render={({ field }: {field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, 'postalCode'>}) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Postal Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
						{/*Country Field*/}
						<div className="flex flex-col md:flex-row gap-5">
              <FormField
                control={fred.control}
                name="country"
                render={({ field }: {field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, 'country'>}) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
						{/*Submit Button*/}
						<div className="flex gap-2">
							<Button type="submit" disabled={isPending}>
								{ isPending ? (
									<Loader className="h-4 w-4 animate-spin"/>
								) : (
									<ArrowRight className="w-4 h-4"/>
								)}
								{' '}Continue
							</Button>
						</div>
          </form>
        </Form>
      </div>
    </>
  );
}
 
export default ShippingAddressForm;