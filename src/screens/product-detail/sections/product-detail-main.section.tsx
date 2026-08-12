import { Link } from "@/i18n/navigation";
import { Picture } from "@/shared/components/ui/picture";
import { VARIETIES } from "@/shared/constants/shop.constant";

export function ProductDetailMainSection({ handle }: { handle: string }) {
  const product = VARIETIES.find((item) => item.handle === handle) ?? VARIETIES[1];

  return (
    <section data-plumb-id="frame-2085667045" className="flex h-[5080px] flex-col items-center gap-[200px] pb-[200px] pt-[100px]">
      <div data-plumb-id="frame-2085667197" className="h-[2776px] w-full max-w-[1000px] px-6 lg:px-0">
        <p className="font-sans text-sm text-muted-ink"><Link href="/products" className="underline underline-offset-4">Shop</Link> &gt; {product.title}</p>
        <div className="mt-14 grid gap-[54px] lg:grid-cols-2">
          <div>
            <div className="relative bg-warm p-10"><span className="absolute left-4 top-4 bg-navy-dark px-4 py-2 font-sans text-xs text-canvas">Best Seller</span><Picture basePath={product.imageBasePath} fallbackExtension="png" alt={product.imageAlt} priority width={600} height={600} sizes="(max-width:1023px) 100vw, 470px" pictureClassName="block aspect-square" className="size-full object-contain" /></div>
            <div className="mt-4 grid grid-cols-3 gap-4">{[product.imageBasePath,"/images/about-product/species-amur","/images/about-product/product-sturgeon"].map((image,index)=><Picture key={image} basePath={image} fallbackExtension="png" alt={index===0?product.imageAlt:"Product detail"} width={600} height={600} sizes="100px" pictureClassName="block border border-line" className="aspect-square size-full object-contain p-2" />)}</div>
          </div>
          <div>
            <p className="font-sans text-sm">{product.eyebrow}</p><h1 className="mt-2 font-display text-[32px] font-bold leading-none">{product.title}</h1><p className="mt-2 font-display text-sm">{product.species}</p>
            <div className="mt-8 border-t border-line pt-6"><p className="font-display text-sm font-bold uppercase">Size</p><div className="mt-4 grid grid-cols-4 gap-4">{["30g","50g","125g","250g"].map((size,index)=><button key={size} className={`min-h-12 border ${index===0?"border-navy-dark bg-navy-dark text-canvas":"border-line"}`}>{size}</button>)}</div></div>
            <div className="mt-8"><p className="font-display text-sm font-bold uppercase">Packaging</p>{["Standard","Premium","Luxury"].map((name,index)=><label key={name} className="mt-3 flex min-h-14 items-center gap-4 border border-line px-4"><input type="radio" name="packaging" defaultChecked={index===0} /> <span className="font-sans text-sm">{name}</span></label>)}</div>
            <div className="mt-8"><p className="font-display text-sm font-bold uppercase">Per box</p><div className="mt-4 grid grid-cols-4 gap-4">{[1,2,3,4].map(value=><button key={value} className="min-h-12 border border-line">{value}</button>)}</div></div>
            <p className="mt-10 font-display text-[32px] font-bold">€599.00</p><div className="mt-5 grid grid-cols-[120px_1fr] gap-4"><button className="min-h-12 border border-line">− 2 +</button><button className="min-h-12 bg-navy-dark text-canvas">Add to cart</button></div>
          </div>
        </div>
        <div className="ml-auto mt-24 max-w-[500px] space-y-14 font-sans text-sm leading-[1.43]"><div><h2 className="font-display text-base font-bold uppercase">Specification</h2><p className="mt-5">{product.description} Selected for a generous grain, polished texture and a long, clean finish.</p></div>{["Serving info","Delivery info","Gifting"].map(title=><div key={title} className="border-t border-line pt-8"><h2 className="font-display text-base font-bold uppercase">{title}</h2><p className="mt-5 text-muted-ink">Serve well chilled. Perishable shipping is handled with insulated packaging and careful temperature control.</p></div>)}</div>
      </div>

      <div data-plumb-id="component-7-2" className="flex h-[908px] w-full max-w-[1000px] flex-col items-center text-center"><h2 className="font-display text-[32px]">Require more assistance?</h2><p className="mt-5 max-w-[520px] font-sans text-sm text-muted-ink">Our caviar specialists can help with selection, quantities and gifting.</p><Link href="/about-the-brand" className="mt-6 min-h-11 font-sans text-xs underline underline-offset-4">Contact Us</Link><Picture basePath="/images/about-product/sturgeon-journey" fallbackExtension="jpg" alt="Maison Rocheval sourcing landscape" width={2000} height={1400} sizes="(max-width:1000px) 100vw, 1000px" pictureClassName="mt-10 block w-full" className="aspect-[10/7] size-full object-cover" /></div>

      <div data-plumb-id="frame-2085667092" className="h-[696px] w-full max-w-[1000px] text-center"><h2 className="font-display text-2xl">You may also like</h2><div className="mt-12 grid gap-8 md:grid-cols-3">{VARIETIES.slice(0,3).map(item=><Link key={item.id} href={`/products/${item.handle}`} className="border border-line p-6"><Picture basePath={item.imageBasePath} fallbackExtension="png" alt={item.imageAlt} width={600} height={600} sizes="300px" pictureClassName="block aspect-square" className="size-full object-contain" /><h3 className="mt-4 font-display text-xl font-bold">{item.title}</h3></Link>)}</div><Link href="/products" className="mt-8 inline-flex min-h-11 font-sans text-xs uppercase underline underline-offset-4">Go to shop</Link></div>
    </section>
  );
}
