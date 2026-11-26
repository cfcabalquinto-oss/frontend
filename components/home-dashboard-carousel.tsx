"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const classSchedule = [
  {
    time: "8:00",
    course: "Mathematics · Grade 7-A",
    details: "Room 204 · Ms. Reyes",
    note: "Now",
    current: true,
  },
  {
    time: "9:30",
    course: "Science · Grade 8-B",
    details: "Lab 1 · Mr. Santos",
    note: "32 students",
  },
  {
    time: "11:00",
    course: "English · Grade 7-A",
    details: "Room 204 · Ms. Cruz",
    note: "30 students",
  },
];

const slides = [
  { id: "schedule", title: "Today’s schedule" },
  { id: "attendance", title: "Attendance tracking" },
  { id: "performance", title: "Academic performance" },
] as const;

type SlideId = (typeof slides)[number]["id"];

function ProgressBar({ value, color = "bg-[#d9470a]" }: { value: number; color?: string }) {
  return (
    <div aria-hidden="true" className="h-1.5 rounded-full bg-[#29292c]">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function DashboardCard({
  id,
  title,
  badge,
  children,
}: {
  id: SlideId;
  title: string;
  badge: string;
  children: ReactNode;
}) {
  return (
    <article
      aria-labelledby={`preview-${id}-title`}
      className="h-full rounded-[2rem] bg-[#190a04] p-3 shadow-[0_30px_90px_rgba(144,49,8,0.22)] sm:rounded-[2.25rem] sm:p-4"
    >
      <div className="flex h-full min-h-[25.5rem] flex-col overflow-hidden rounded-[1.35rem] border border-[#2a2a2d] bg-[#0a0a0b] sm:rounded-[1.5rem]">
        <header className="flex items-center justify-between gap-3 border-b border-[#262629] px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <p className="text-[10px] text-[#92929a] sm:text-xs">Tuesday, 24 November</p>
            <h2
              id={`preview-${id}-title`}
              className="mt-0.5 text-[15px] font-bold tracking-[-0.025em] text-white sm:text-lg"
            >
              {title}
            </h2>
          </div>
          <span className="shrink-0 rounded-full bg-[#351709] px-3 py-1 text-[10px] font-semibold text-[#ff8c45] sm:text-xs">
            {badge}
          </span>
        </header>
        {children}
      </div>
    </article>
  );
}

function ScheduleCard() {
  return (
    <DashboardCard id="schedule" title="Today’s schedule" badge="4 classes">
      <ul aria-label="Sample classes" className="flex-1 space-y-1 px-3 py-2 sm:px-3 sm:py-2">
        {classSchedule.map((item) => (
          <li
            key={item.time}
            className={`grid grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-2 rounded-xl px-2.5 py-3.5 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:gap-3 sm:px-3.5 ${
              item.current ? "bg-[#26130c]" : ""
            }`}
          >
            <time className={`text-[10px] font-semibold sm:text-xs ${item.current ? "text-[#ff8c45]" : "text-[#9b9ba2]"}`}>
              {item.time}
            </time>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold leading-snug text-[#f2f2f3] sm:text-sm">
                {item.course}
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-[#92929a] sm:text-xs">
                {item.details}
              </p>
            </div>
            {item.current ? (
              <span className="rounded-full bg-[#d9470a] px-2.5 py-1 text-[9px] font-bold text-white sm:px-3 sm:text-xs">
                {item.note}
              </span>
            ) : (
              <span className="whitespace-nowrap text-[8px] font-medium text-[#9999a1] sm:text-[11px]">
                {item.note}
              </span>
            )}
          </li>
        ))}
      </ul>

      <dl className="grid grid-cols-2 border-t border-[#262629] bg-[#101011]">
        <div className="border-r border-[#262629] px-4 py-4 sm:px-6 sm:py-5">
          <dt className="text-[10px] font-medium text-[#96969e] sm:text-xs">Attendance</dt>
          <dd className="mt-1 text-[1.65rem] font-bold leading-none tracking-[-0.04em] text-white sm:text-[1.9rem]">
            96%
          </dd>
          <div className="mt-3">
            <ProgressBar value={96} />
          </div>
        </div>
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <dt className="text-[10px] font-medium text-[#96969e] sm:text-xs">Fees collected</dt>
          <dd className="mt-1 text-[1.65rem] font-bold leading-none tracking-[-0.04em] text-white sm:text-[1.9rem]">
            88%
          </dd>
          <div className="mt-3">
            <ProgressBar value={88} />
          </div>
        </div>
      </dl>
    </DashboardCard>
  );
}

function AttendanceCard() {
  const week = [
    { day: "M", value: 82 },
    { day: "T", value: 96 },
    { day: "W", value: 89 },
    { day: "T", value: 100 },
    { day: "F", value: 92 },
  ];

  return (
    <DashboardCard id="attendance" title="Attendance tracking" badge="Today · 30">
      <div className="flex flex-1 flex-col gap-3 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-end justify-between gap-3 rounded-2xl border border-[#242427] bg-[#101011] px-4 py-3.5">
          <div>
            <p className="text-[10px] font-medium text-[#96969e] sm:text-xs">Students present</p>
            <p className="mt-1 text-4xl font-bold leading-none tracking-[-0.055em] text-white">96%</p>
          </div>
          <span className="mb-0.5 rounded-full bg-[#123029] px-2.5 py-1 text-[10px] font-semibold text-[#54d6bd] sm:text-xs">
            +3.2% this week
          </span>
        </div>

        <div className="flex min-h-[6rem] flex-1 items-end justify-between gap-3 rounded-2xl border border-[#242427] bg-[#0e0e0f] px-4 pb-3 pt-4">
          {week.map(({ day, value }, index) => (
            <div key={`${day}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div className="flex h-14 w-full items-end justify-center">
                <div
                  aria-hidden="true"
                  className={`w-full max-w-8 rounded-t-md ${index === 3 ? "bg-[#e45513]" : "bg-[#773519]"}`}
                  style={{ height: `${value * 0.55}px` }}
                />
              </div>
              <span className="text-[10px] font-medium text-[#92929a]">{day}</span>
            </div>
          ))}
        </div>

        <dl className="grid grid-cols-3 divide-x divide-[#28282b] rounded-2xl border border-[#242427] bg-[#101011] py-3">
          <div className="px-3 text-center">
            <dt className="text-[10px] text-[#92929a] sm:text-xs">Present</dt>
            <dd className="mt-1 text-lg font-bold text-white">28</dd>
          </div>
          <div className="px-3 text-center">
            <dt className="text-[10px] text-[#92929a] sm:text-xs">Late</dt>
            <dd className="mt-1 text-lg font-bold text-[#ffb454]">1</dd>
          </div>
          <div className="px-3 text-center">
            <dt className="text-[10px] text-[#92929a] sm:text-xs">Absent</dt>
            <dd className="mt-1 text-lg font-bold text-[#ff765f]">1</dd>
          </div>
        </dl>
      </div>
    </DashboardCard>
  );
}

function PerformanceCard() {
  const subjects = [
    { name: "Mathematics", value: 92, color: "bg-[#e45513]" },
    { name: "Science", value: 86, color: "bg-[#ffad55]" },
    { name: "English", value: 82, color: "bg-[#37b8ad]" },
  ];

  return (
    <DashboardCard id="performance" title="Academic performance" badge="Term 1">
      <div className="flex flex-1 flex-col gap-3 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-end justify-between gap-3 rounded-2xl border border-[#242427] bg-[#101011] px-4 py-3.5">
          <div>
            <p className="text-[10px] font-medium text-[#96969e] sm:text-xs">Class average</p>
            <p className="mt-1 text-4xl font-bold leading-none tracking-[-0.055em] text-white">87%</p>
          </div>
          <span className="mb-0.5 rounded-full bg-[#351709] px-2.5 py-1 text-[10px] font-semibold text-[#ff9a55] sm:text-xs">
            +6% this term
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-4 rounded-2xl border border-[#242427] bg-[#0e0e0f] px-4 py-4">
          {subjects.map((subject) => (
            <div key={subject.name}>
              <div className="mb-2 flex items-center justify-between gap-4 text-xs">
                <span className="font-medium text-[#dadadd]">{subject.name}</span>
                <span className="font-semibold text-white">{subject.value}%</span>
              </div>
              <ProgressBar value={subject.value} color={subject.color} />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#33251d] bg-[#17100c] px-4 py-3">
          <div>
            <p className="text-[10px] font-medium text-[#9999a1]">Top improvement</p>
            <p className="mt-0.5 text-xs font-semibold text-white">Science · Grade 8-B</p>
          </div>
          <span className="text-sm font-bold text-[#ff9a55]">+8 pts</span>
        </div>
      </div>
    </DashboardCard>
  );
}

function SlideContent({ id }: { id: SlideId }) {
  if (id === "schedule") return <ScheduleCard />;
  if (id === "attendance") return <AttendanceCard />;
  return <PerformanceCard />;
}

export default function HomeDashboardCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);
  const isPaused = isFocused || isHovered || prefersReducedMotion;

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(reducedMotion.matches);

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    reducedMotion.addEventListener("change", handleMotionPreference);
    return () => reducedMotion.removeEventListener("change", handleMotionPreference);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isPaused, activeIndex]);

  const changeSlide = (index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  const activeSlide = slides[activeIndex];

  return (
    <figure className="mx-auto w-full max-w-[36rem] lg:justify-self-end">
      <figcaption className="sr-only">
        Rotating previews of Adali’s class schedule, attendance tracking, and academic performance dashboards.
      </figcaption>

      <div
        id="adali-dashboard-carousel"
        role="region"
        aria-label="Adali dashboard previews"
        aria-roledescription="carousel"
        className="relative w-full [perspective:1400px]"
        onFocusCapture={() => setIsFocused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsFocused(false);
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="relative min-h-[28rem] [transform-style:preserve-3d] [transform:rotateX(2deg)_rotateY(-4deg)] transition-transform duration-700 hover:[transform:rotateX(0deg)_rotateY(0deg)] motion-reduce:transition-none sm:min-h-[29rem]"
        >
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={slide.id}
                id={`adali-dashboard-slide-${slide.id}`}
                aria-hidden={!isActive}
                aria-label={`Slide ${index + 1} of ${slides.length}: ${slide.title}`}
                aria-roledescription="slide"
                className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
                  isActive
                    ? "z-10 opacity-100 [transform:translateX(0)_rotateY(0deg)_scale(1)]"
                    : "pointer-events-none opacity-0 [transform:translateX(1.5rem)_rotateY(7deg)_scale(.98)]"
                }`}
                role="group"
              >
                <SlideContent id={slide.id} />
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 px-1 sm:px-2">
          <div aria-hidden="true" className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#77777f]">Dashboard preview</p>
            <p className="mt-1 truncate text-sm font-semibold text-[#e4e4e7]">{activeSlide.title}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label="Previous dashboard preview"
              aria-controls="adali-dashboard-carousel"
              className="grid size-10 place-items-center rounded-full border border-[#29292d] bg-[#101011] text-[#c2c2c7] transition hover:border-[#48484d] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8c45]"
              onClick={() => changeSlide(activeIndex - 1)}
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next dashboard preview"
              aria-controls="adali-dashboard-carousel"
              className="grid size-10 place-items-center rounded-full border border-[#29292d] bg-[#101011] text-[#c2c2c7] transition hover:border-[#48484d] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8c45]"
              onClick={() => changeSlide(activeIndex + 1)}
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex justify-center gap-1">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show ${slide.title} preview`}
              aria-controls={`adali-dashboard-slide-${slide.id}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className="grid min-h-10 min-w-10 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#ff8c45]"
              onClick={() => changeSlide(index)}
            >
              <span
                aria-hidden="true"
                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                  index === activeIndex ? "w-6 bg-[#e45513]" : "w-1.5 bg-[#4a4a50]"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="sr-only" aria-live={isPaused ? "polite" : "off"} aria-atomic="true">
          Showing {activeSlide.title}, slide {activeIndex + 1} of {slides.length}.
        </p>
      </div>
    </figure>
  );
}
