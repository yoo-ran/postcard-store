export const metadata = {
  title: "Checkout — Shop",
};

export default function CheckoutPage() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-[#F7F6F3]">
      <div className="text-center max-w-sm">
        <p className="text-[80px] font-bold text-[#E0DDD8] leading-none mb-4 select-none">
          🛒
        </p>
        <h1 className="text-2xl font-bold text-[#1A1916] mb-3 tracking-tight">
          Checkout
        </h1>
        <p className="text-[#8B8680] text-sm">
          The full checkout flow is coming in Sprint 4. Payment, shipping, and
          order confirmation will live here.
        </p>
      </div>
    </main>
  );
}
