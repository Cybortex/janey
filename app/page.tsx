import Link from "next/link";
import Photo from "@/components/Photo";
import Divider from "@/components/Divider";
import { HOURS, OFFERS, REVIEWS, SITE } from "@/lib/site";
import { btn, btnLine, btnPlum, card, wrap } from "@/lib/ui";

export default function Home() {
  return (
    <>
      {/* Hero: one headline, one action, one beautiful image in a gold arch */}
      <section className="bg-pink text-white">
        <div className={`${wrap} grid items-center gap-10 py-10 md:grid-cols-2 md:py-16`}>
          <div>
            <p className="mb-3 font-medium tracking-wide text-plum">{SITE.tagline}</p>
            <h1 className="font-display text-5xl leading-[1.05] font-semibold md:text-7xl">Get to glow differently in <em className="text-plum">Yaba, Lagos.</em></h1>
            <p className="mt-5 max-w-md text-lg text-plum">Braids, haircuts, nails, facials, waxing, body smoothing and massage, for women and men.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/book" className={btn}>Book Now</Link>
              <a href={`tel:${SITE.phones[0].tel}`} className={btnLine}>Call {SITE.phones[0].label}</a>
            </div>
          </div>
          <Photo src="hero-salon.jpg" alt="Janey Radiance Salon & Spa" priority sizes="(min-width:768px) 50vw, 100vw"
            className="mx-auto aspect-[4/5] w-full max-w-md rounded-t-[999px] rounded-b-3xl border-2 border-gold shadow-[0_0_0_6px_var(--color-pink),0_0_0_7px_var(--color-gold)]" />
        </div>
      </section>

      <div className={`${wrap} flex flex-wrap gap-x-8 gap-y-1 border-b border-gold/40 py-5 text-sm text-plum/75`}>
        <span>Open Mon–Sat, Sunday by booking</span><span>Women &amp; men welcome</span><span>164 Herbert Macaulay Way, Yaba</span>
      </div>

      <section className={`${wrap} reveal py-14`}>
        <h2 className="rule font-display text-4xl font-semibold md:text-5xl">Pick what you need</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(OFFERS).map(([slug, o]) => (
            <Link key={slug} href={`/offers/${slug}`} className={`${card} group overflow-hidden transition hover:-translate-y-1`}>
              <Photo src={`offer-${slug}.jpg`} alt={o.title} sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="aspect-[4/3]" />
              <div className="p-4"><h3 className="font-display text-2xl font-semibold">{o.title}</h3><p className="mt-1 text-gold-deep">See more</p></div>
            </Link>
          ))}
        </div>
      </section>

      {/* The 20%: a clear door for men */}
      <section className="reveal bg-plum text-blush">
        <div className={`${wrap} grid items-center gap-8 py-12 md:grid-cols-2`}>
          <Photo src="men-feature.jpg" alt="Men's haircut and plaiting" sizes="(min-width:768px) 50vw, 100vw" className="aspect-[3/2] rounded-2xl border border-gold" />
          <div>
            <h2 className="rule font-display text-4xl font-semibold">Fresh cuts and neat plaits for men</h2>
            <p className="mt-4 text-blush/85">Haircuts, plaiting and dreadlocks care in a clean, relaxed space.</p>
            <Link href="/offers/men" className={`${btn} mt-6`}>See men&apos;s services</Link>
          </div>
        </div>
      </section>

      <section className={`${wrap} reveal py-14 text-center`}>
        <Divider />
        <h2 className="rule rule-c mt-3 font-display text-4xl font-semibold md:text-5xl">Recent work</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => <Photo key={n} src={`gallery-${n}.jpg`} alt={`Recent work ${n}`} sizes="(min-width:768px) 33vw, 50vw" className="aspect-square rounded-xl border border-gold/60" />)}
        </div>
      </section>

      {REVIEWS.length > 0 && (
        <section className={`${wrap} reveal pb-14`}>
          <h2 className="rule font-display text-4xl font-semibold">What clients say</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {REVIEWS.map((r) => <blockquote key={r.name} className={`${card} p-5`}><p className="font-display text-xl italic">“{r.text}”</p><footer className="mt-3 text-sm text-plum/70">{r.name}</footer></blockquote>)}
          </div>
        </section>
      )}

      <section className={`${wrap} reveal grid gap-8 pb-14 md:grid-cols-2`}>
        <div className={`${card} p-6`}>
          <h2 className="rule font-display text-3xl font-semibold">Hours</h2>
          <dl className="mt-4 grid gap-2">{HOURS.map(([d, h]) => <div key={d} className="flex justify-between border-b border-line pb-2"><dt>{d}</dt><dd>{h}</dd></div>)}</dl>
        </div>
        <div className={`${card} p-6`}>
          <h2 className="rule font-display text-3xl font-semibold">Find us</h2>
          <p className="mt-4 text-lg">{SITE.address}</p>
          <div className="mt-5 flex flex-wrap gap-3"><a href={SITE.map} target="_blank" rel="noopener noreferrer" className={btnPlum}>Get directions</a><Link href="/contact" className={btnLine}>Call or WhatsApp</Link></div>
        </div>
      </section>

      <section className="bg-pink py-14 text-center text-white">
        <h2 className="font-display text-4xl font-semibold md:text-5xl">{SITE.slogan}</h2>
        <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/book" className={btn}>Book Now</Link><a href={`tel:${SITE.phones[0].tel}`} className={btnLine}>Call {SITE.phones[0].label}</a></div>
      </section>
    </>
  );
}
