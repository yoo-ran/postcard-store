import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-[#F7F6F3]">
      <div className="text-center max-w-sm">
        <p className="text-[80px] font-bold text-[#E0DDD8] leading-none mb-4 select-none">
          404
        </p>
        <h1 className="text-2xl font-bold text-[#1A1916] mb-3 tracking-tight">
          Product not found
        </h1>
        <p className="text-[#8B8680] text-sm mb-8">
          The product you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-[#1A1916] text-white text-sm font-semibold px-6 py-3 rounded-2xl hover:bg-[#2D2C2A] transition-colors"
        >
          ← Back to Products
        </Link>
      </div>
    </main>
  );
}
