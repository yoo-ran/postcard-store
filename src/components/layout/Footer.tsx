import Link from "next/link";

const NAV_LINKS = [
  { label: "Shop", href: "/" },
  { label: "Cart", href: "/cart" },
  { label: "Login", href: "/login" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#EBEBEB] bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Store name */}
        <span className="text-base font-bold tracking-tight text-[#1A1916]">
          shop.
        </span>

        {/* Nav links */}
        <nav className="flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[#8B8680] hover:text-[#1A1916] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-xs text-[#C9C5BF]">
          © {year} shop. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
