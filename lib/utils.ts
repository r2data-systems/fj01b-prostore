import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import qs from "query-string";

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
export function formatError(error: any) {
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

// Round number to 2 decimal places
export function round2(value: number | string) {
	if (typeof value === 'number') {
		return Math.round((value + Number.EPSILON) * 100) / 100;
	} else if (typeof value === 'string') {
		return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
	} else {
		throw new Error('Value is NOT a number or a string');
	};
};

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
	currency: 'USD',
	style: 'currency',
	minimumFractionDigits: 2
});

// Format currency using the formatter above
export function formatCurrency(amount: number|string|null) {
	if (typeof amount === 'number') {
		return CURRENCY_FORMATTER.format(amount);
	} else if (typeof amount === 'string') {
		return CURRENCY_FORMATTER.format(Number(amount));
	} else {
		return 'NaN';
	}
};

// Shorten UUID
export function shortenId(id: string) {
	return `...${id.substring(id.length - 6)}`;
}

//console.log(shortenId('d57dfd2d-3ae6-4276-92c4-19a0fc886475'));

// Format date and times
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // abbreviated month name (e.g., 'Oct')
    day: 'numeric', // numeric day of the month (e.g., '25')
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // numeric year (e.g., '2023')
    day: 'numeric', // numeric day of the month (e.g., '25')
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    'en-US',
    dateTimeOptions
  );
  const formattedDate: string = new Date(dateString).toLocaleString(
    'en-US',
    dateOptions
  );
  const formattedTime: string = new Date(dateString).toLocaleString(
    'en-US',
    timeOptions
  );
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

//const testDate = new Date('2023-10-25T08:30:00Z');

//const formatted = formatDateTime(testDate);

// Log the results
//console.log('Full DateTime:', formatted.dateTime);
//console.log('Date Only', formatted.dateOnly);
//console.log('Time Only', formatted.timeOnly);

// Form the pagination links
export function formURLQuery({
	params,
	key,
	value
}: {
	params: string;
	key: string;
	value: string | null;
}) {
	// turns params into an object
	const query = qs.parse(params)

	// creates a destination url
	query[key] = value;

	//console.log(query);
	console.log(qs.stringifyUrl({
		url: window.location.pathname,
		query,
	}, {
		skipNull: true
	}))

	return (qs.stringifyUrl({
		url: window.location.pathname,
		query,
	}, {
		skipNull: true
	}));
}
