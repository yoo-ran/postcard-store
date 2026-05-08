export const metadata = {
  title: "Orders — Shop",
};

export default function OrdersPage() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-[#F7F6F3]">
      <div className="text-center max-w-sm">
        <p className="text-[80px] font-bold text-[#E0DDD8] leading-none mb-4 select-none">
          📦
        </p>
        <h1 className="text-2xl font-bold text-[#1A1916] mb-3 tracking-tight">
          Your Orders
        </h1>
        <p className="text-[#8B8680] text-sm">
          Your order history will appear here. Route protection and order
          tracking are coming in Sprint 3.
        </p>
      </div>
    </main>
  );
}
