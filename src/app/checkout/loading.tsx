import { SolarLoader } from "@/components/ui/solar-loader";

export default function CheckoutLoading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 sm:px-6">
      <SolarLoader label="Preparing checkout" />
    </div>
  );
}
