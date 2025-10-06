import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
//import { ZodError } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// convert prisma object into JSON
export function convert2PlainObject<T> ( value: T ): T {
	return JSON.parse(JSON.stringify(value));
}

// format number with decimal places
export function formatNumberWithDecimal(num: number): string {
	const [int, decimal] = num.toString().split('.');
	return (decimal) ? `${int}.${decimal.padEnd(2,'0')}` : `${int}.00` ;
}

// format errors
// disable eslint to stop vercel from throwing errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatErrors(error: any) {
	console.log(error.name);
	console.log(error.code);
	console.log(error.errors);
	console.log(error.meta?.target);

	//if (error instanceof ZodError) {
	if (error.name === 'ZodError') {
		// Handle ZodError
		//return Object.keys(error.errors).map((field) => error.errors[field].message).join('. ');
		return JSON.parse(error.message).map((err: { message: unknown; }) => err.message).join(". ");

	} else if(error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002') {
		// Handle PrismaError

		const field = error.meta?.target ? error.meta.target[0] : 'Field';
		console.log(field);

		return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;

	} else {
		// Handle Other Errors
		return typeof error.message === 'string' ? error.message : JSON.stringify(error.message);

	}
};