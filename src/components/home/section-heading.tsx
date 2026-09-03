export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      {eyebrow && <p className="text-sm font-medium text-brand-400">{eyebrow}</p>}
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-base leading-relaxed text-muted">{description}</p>}
    </div>
  );
}
