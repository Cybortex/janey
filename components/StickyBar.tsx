import Link from "next/link";
import { SITE } from "@/lib/site";

// Mobile-only action bar: the fastest route to a call or booking.
export default function StickyBar() {
  const c = "py-3 text-center font-medium";
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 divide-x divide-blush/20 border-t border-gold bg-plum pb-[env(safe-area-inset-bottom)] text-blush md:hidden">
      <a href={`tel:${SITE.phones[0].tel}`} className={c}>Call</a>
      <a href={SITE.wa} target="_blank" rel="noopener noreferrer" className={c}>WhatsApp</a>
      <Link href="/book" className={`${c} bg-gold text-plum`}>Book</Link>
    </div>
  );
}
