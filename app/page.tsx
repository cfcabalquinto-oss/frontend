import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import HomeDashboardCarousel from "@/components/home-dashboard-carousel";
import TypingDescription from "@/components/typing-description";

const navLinkClass =
  "inline-flex min-h-10 items-center px-3 text-sm font-semibold text-[#85858d] transition-colors hover:text-white focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8c45] sm:px-4";

export default function Home() {
  return (
    <main
      className="relative flex min-h-[100dvh] flex-col overflow-x-clip bg-[#050506] font-sans text-white [font-size-adjust:from-font]"
    >
      <header className="relative z-10 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-5 py-5 sm:px-8 lg:py-6">
        <Link href="/" aria-label="Adali home" className="flex shrink-0 items-center gap-2.5">
          <span aria-hidden="true" className="grid size-8 grid-cols-2 place-content-center gap-1 rounded-[0.65rem] bg-[#d9470a] p-2">
            <span className="size-1.5 rounded-full bg-white" />
            <span className="size-1.5 rounded-full bg-white/75" />
            <span className="size-1.5 rounded-full bg-white/75" />
            <span className="size-1.5 rounded-full bg-white" />
          </span>
          <span className="text-base font-extrabold tracking-[-0.04em] text-white">Adali</span>
        </Link>

        <nav aria-label="Primary" className="flex flex-wrap items-center gap-1">
          <Link
            aria-current="page"
            className="inline-flex min-h-10 items-center px-3 text-sm font-semibold text-white focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8c45] sm:px-4"
            href="/"
          >
            Home
          </Link>
          <Link className={navLinkClass} href="/dashboard">
            Schedule
          </Link>
          <Link className={navLinkClass} href="/dashboard/records">
            Record
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3 sm:gap-6">
          <Link
            className="inline-flex min-h-10 items-center px-2 text-sm font-semibold text-[#85858d] transition-colors hover:text-white focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8c45]"
            href="/login"
          >
            Log in
          </Link>
          <Link
            className="inline-flex min-h-10 items-center rounded-xl bg-[#c93e08] px-4 text-sm font-bold text-white shadow-[0_8px_22px_rgba(201,62,8,0.2)] transition hover:bg-[#e24a10] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff8c45] sm:px-5"
            href="/register"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-12 px-5 pb-16 pt-10 sm:px-8 lg:min-h-[calc(100dvh-5rem)] lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:px-0 lg:pb-24 lg:pt-4">
        <div className="mx-auto w-full max-w-[28rem] lg:mx-0">
          <h1 className="text-[clamp(3.2rem,5.2vw,4.5rem)] font-black leading-[0.99] tracking-[-0.07em] text-white">
            <span className="block">Where school</span>
            <span className="block">stays,</span>
            <span className="block text-[#ff873e]">in sync.</span>
          </h1>

          <TypingDescription />

          <div className="mt-9">
            <Link
              className="group inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-[#c93e08] px-6 text-sm font-bold text-white shadow-[0_12px_28px_rgba(201,62,8,0.2)] transition hover:-translate-y-0.5 hover:bg-[#e24a10] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff8c45]"
              href="/register"
            >
              Get started
              <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        <HomeDashboardCarousel />
      </section>
    </main>
  );
}
