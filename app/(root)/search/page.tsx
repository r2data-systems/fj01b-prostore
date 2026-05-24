import ProductCard from '@/components/shared/product/product-card';
import { getAllProducts, getAllCategories } from '@/lib/actions/product.actions';
import Link from 'next/link';

const prices = [
	{name: '$1 to $50', value: '1-50'},
	{name: '$51 to $100', value: '51-100'},
	{name: '$101 to $200', value: '101-200'},
	{name: '$201 to $500', value: '201-500'},
	{name: '$501 to $999', value: '501-999'},
]

const SearchPage = async (props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>;
}) => {
  const {
    q = 'all',
    category = 'all',
    price = 'all',
    rating = 'all',
    sort = 'newest',
    page = '1',
  } = await props.searchParams;

  console.log(q, category, price, rating, sort, page);

  const getFilterURL = ({
    c,
    p,
    r,
    s,
    pg,
  }: {
    c?: string;
		p?: string;
    r?: string;
    s?: string;
    pg?: string;
  }) => {
		const params = {q, category, price, rating, sort, page};

		if (c) params.category = c;
		if (p) params.price = p;
		if (r) params.rating = r;
		if (s) params.sort = s;
		if (pg) params.page = pg;

		return `/search?${new URLSearchParams(params).toString()}`
	};

  const products = await getAllProducts({
    query: q,
    category,
    price,
    rating,
    sort,
    page: Number(page),
  });

	const categories = await getAllCategories();

  return (
    <div className="grid md:grid-cols-5 md:gap-5">
      <div className="filter-links">
				{/*URL: {getFilterURL({c: 'Mens Sweat Shirts'})}*/}
				{/*Category Links*/}
				<div className="text-xl mb-2 mt-3">Category</div>
				<div>
					<ul className="space-y-1">
						<li>
							<Link className={`${(category === 'all' || category === '') && 'font-bold'}`} href={getFilterURL({c: 'all'})}>All</Link>
						</li>
						{ categories.map((c) => (
							<li key={c.category}>
								<Link className={`${(category === c.category) && 'font-bold'}`} href={getFilterURL({c: c.category})}>{c.category}</Link>
							</li>
						))}
					</ul>
				</div>
				{/*Price Links*/}
				<div className="text-xl mb-2 mt-8">Prices</div>
				<div>
					<ul className="space-y-1">
						<li>
							<Link className={`${(price === 'all') && 'font-bold'}`} href={getFilterURL({p: 'all'})}>All</Link>
						</li>
						{ prices.map((p) => (
							<li key={p.value}>
								<Link className={`${(price === p.value) && 'font-bold'}`} href={getFilterURL({p: p.value})}>{p.name}</Link>
							</li>
						))}
					</ul>
				</div>
			
			</div>
      <div className="md:col-span-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {products.data.length === 0 && <div>No Products Found</div>}
          {products.data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
