import { StarRating } from "@/components/ui/star-rating";
import { SectionHeading } from "./section-heading";

const REVIEWS = [
  {
    name: "Adaeze O.",
    role: "Homeowner, Lekki",
    quote:
      "Installed the 5kW kit in a weekend. Two months in and we haven't touched the generator once — the app makes it easy to see exactly what's charging and what's running.",
    rating: 5,
  },
  {
    name: "Tunde B.",
    role: "Facility Manager, Ibadan",
    quote:
      "We compared three suppliers before choosing NovaSunHub. The specs on the product pages actually matched what arrived, and support answered every question before we paid.",
    rating: 5,
  },
  {
    name: "Chiamaka N.",
    role: "Small business owner, Enugu",
    quote:
      "The portable power station keeps our POS terminals and freezer running through outages. Solid build quality and it charges fast from the wall or the sun.",
    rating: 4,
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Customers" title="Trusted by homes and businesses nationwide" align="center" />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {REVIEWS.map((r) => (
          <figure key={r.name} className="flex flex-col rounded-2xl border border-border bg-surface p-6">
            <StarRating rating={r.rating} size={15} />
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-text">"{r.quote}"</blockquote>
            <figcaption className="mt-5 border-t border-border pt-4 text-sm">
              <span className="font-medium text-text">{r.name}</span>
              <span className="block text-xs text-muted">{r.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
