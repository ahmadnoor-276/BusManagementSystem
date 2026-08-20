"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: "/", label: "Buses" },
  { href: "/routes", label: "Routes" },
  { href: "/schedules", label: "Schedules" },
];

const PHONE_NUMBERS = "0307-4527954, 0306-4621289, 0300-8874559";
const HELPLINE_TEL = "042111007008";
const ANNOUNCEMENT = "Al Noor Travels we provide you the best services in the city";

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path
        d="M2.5 5.5c0-1 .8-1.8 1.8-1.8h2c.8 0 1.5.5 1.7 1.3l.8 2.7c.2.7 0 1.4-.5 1.9l-1.2 1.2a14 14 0 0 0 5.6 5.6l1.2-1.2c.5-.5 1.2-.7 1.9-.5l2.7.8c.8.2 1.3.9 1.3 1.7v2c0 1-.8 1.8-1.8 1.8C10.5 20.5 3.5 13.5 2.5 5.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeadsetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path
        d="M4 13v-1a8 8 0 0 1 16 0v1M4 13a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1v-5H4Zm16 0h-1v5h1a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2Zm-1 5v.5a3.5 3.5 0 0 1-3.5 3.5H12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 shadow-sm">
      {/* Top utility strip */}
      <div className="bg-brand-700 text-slate-200">
        <div className="flex w-full flex-wrap items-center justify-between gap-2 px-6 py-3.5 text-sm lg:px-10">
          <div className="flex items-center gap-2">
            <PhoneIcon className="h-4 w-4 text-gold-500" />
            <span className="font-medium tracking-wide">Contact Us: {PHONE_NUMBERS}</span>
          </div>

          <p className="hidden flex-1 text-center font-medium text-gold-400 md:block">
            {ANNOUNCEMENT}
          </p>

          <Link
            href="/"
            className="rounded px-2.5 py-1.5 font-medium tracking-wide transition hover:bg-white/10 hover:text-white"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Main navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="flex w-full items-center justify-between gap-4 px-6 py-3 lg:px-10">
          <Link href="/" className="mr-auto flex items-center gap-3 font-semibold">
            <Image
              src="/android-chrome-512x512.png"
              alt="Al Noor Travels"
              width={72}
              height={72}
              priority
              className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-200 sm:h-[72px] sm:w-[72px]"
            />
            <span className="leading-tight">
              <span className="block text-xl text-slate-900 sm:text-2xl">Al Noor Travels</span>
              <span className="block text-xs font-normal uppercase tracking-widest text-gold-600">
                Bus Service
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-semibold uppercase tracking-wide transition ${
                    active
                      ? "text-brand-700 after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:bg-gold-500 after:content-['']"
                      : "text-slate-600 hover:text-brand-700"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <a
              href={`tel:${HELPLINE_TEL}`}
              aria-label="Helpline"
              className="ml-1 grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-700 transition hover:bg-brand-100"
            >
              <HeadsetIcon className="h-5 w-5" />
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
