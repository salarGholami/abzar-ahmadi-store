"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpLeft,
  BadgeCheck,
  ChevronLeft,
  CircleCheck,
  Headphones,
  Package,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";

/* ==========================================================================
   MOTION
   ========================================================================== */

const easeOut = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: easeOut,
    },
  },
};

const fadeLeft: Variants = {
  hidden: {
    opacity: 0,
    x: 40,
  },

  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: easeOut,
    },
  },
};

const fadeRight: Variants = {
  hidden: {
    opacity: 0,
    x: -40,
  },

  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: easeOut,
    },
  },
};

const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
  },

  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: easeOut,
    },
  },
};

const stagger: Variants = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const item: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeOut,
    },
  },
};

/* ==========================================================================
   TYPES
   ========================================================================== */

interface RevealProps {
  children: ReactNode;
  variants?: Variants;
  className?: string;
}

/* ==========================================================================
   REVEAL
   ========================================================================== */

function Reveal({ children, variants = fadeUp, className }: RevealProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={variants}
      initial={reducedMotion ? false : "hidden"}
      whileInView={reducedMotion ? undefined : "visible"}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ==========================================================================
   SECTION EYEBROW
   ========================================================================== */

function SectionEyebrow({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <div
      className={[
        "mb-5 inline-flex items-center gap-2 text-[11px] font-black tracking-[0.18em]",
        light ? "text-white/50" : "text-[var(--muted)]",
      ].join(" ")}
    >
      <span className="size-1.5 rounded-full bg-primary-500" />

      <span>{children}</span>
    </div>
  );
}

/* ==========================================================================
   HERO
   ========================================================================== */

function AboutHero() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[var(--bg)]">
      {/* ------------------------------------------------------------------
         DESKTOP
         ------------------------------------------------------------------ */}

      <div className="hidden md:block">
        <motion.div
          initial={
            reducedMotion
              ? false
              : {
                  opacity: 0,
                  scale: 1.015,
                }
          }
          animate={
            reducedMotion
              ? undefined
              : {
                  opacity: 1,
                  scale: 1,
                }
          }
          transition={{
            duration: 1.1,
            ease: easeOut,
          }}
        >
          <Image
            src="/images/banners/about/2.webp"
            alt="ابزار احمدی - فروشگاه تخصصی ابزار و تجهیزات ساختمانی"
            width={1200}
            height={800}
            priority
            quality={95}
            sizes="100vw"
            className="block h-auto w-full"
          />
        </motion.div>
      </div>

      {/* ------------------------------------------------------------------
         MOBILE
         ------------------------------------------------------------------ */}

      <div className="block md:hidden">
        <motion.div
          initial={
            reducedMotion
              ? false
              : {
                  opacity: 0,
                  scale: 1.04,
                }
          }
          animate={
            reducedMotion
              ? undefined
              : {
                  opacity: 1,
                  scale: 1,
                }
          }
          transition={{
            duration: 0.9,
            ease: easeOut,
          }}
          className="relative aspect-[4/5] w-full overflow-hidden"
        >
          <Image
            src="/images/banners/about/2.webp"
            alt="ابزار احمدی - فروشگاه تخصصی ابزار و تجهیزات ساختمانی"
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-cover object-center"
          />

          {/* Mobile overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/[0.03] via-transparent to-black/20" />

          {/* Bottom depth */}
          <motion.div
            initial={
              reducedMotion
                ? false
                : {
                    opacity: 0,
                  }
            }
            animate={
              reducedMotion
                ? undefined
                : {
                    opacity: 1,
                  }
            }
            transition={{
              duration: 1.2,
              delay: 0.2,
            }}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/25 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ==========================================================================
   TRUST STRIP
   ========================================================================== */

const trustItems = [
  {
    icon: ShieldCheck,
    title: "اصالت کالا",
    description: "تضمین کیفیت و اصالت محصولات",
  },
  {
    icon: Package,
    title: "موجودی دقیق",
    description: "اطلاعات واقعی و به‌روز",
  },
  {
    icon: BadgeCheck,
    title: "قیمت شفاف",
    description: "قیمت‌گذاری روشن و قابل اعتماد",
  },
  {
    icon: Headphones,
    title: "پشتیبانی",
    description: "همراهی قبل و بعد از خرید",
  },
];

function TrustStrip() {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[var(--border)] px-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-8 lg:grid-cols-4">
        {trustItems.map((itemData, index) => {
          const Icon = itemData.icon;

          return (
            <motion.div
              key={itemData.title}
              initial={{
                opacity: 0,
                y: 18,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.55,
                delay: index * 0.06,
              }}
              whileHover={{
                y: -3,
              }}
              className="group flex items-center gap-4 px-2 py-6 sm:px-6 sm:py-7"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 transition-all duration-300 group-hover:bg-primary-100 group-hover:text-primary-800 dark:bg-primary-900/40 dark:text-primary-300 dark:group-hover:bg-primary-900/60">
                <Icon className="size-5" strokeWidth={1.8} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-black text-[var(--text)]">
                  {itemData.title}
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  {itemData.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ==========================================================================
   INTRO
   ========================================================================== */

function IntroSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg)] py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute -left-40 top-20 size-96 rounded-full bg-primary-500/[0.035] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 sm:gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <Reveal variants={fadeRight}>
            <SectionEyebrow>ABOUT AHMADI</SectionEyebrow>

            <h2 className="max-w-md text-3xl font-black leading-[1.35] tracking-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
              ابزار فقط یک محصول نیست؛
              <span className="mt-2 block text-[var(--muted)]">
                بخشی از یک کار حرفه‌ای است.
              </span>
            </h2>
          </Reveal>

          <Reveal variants={fadeLeft}>
            <div className="max-w-3xl lg:mr-auto">
              <p className="text-lg font-bold leading-9 text-[var(--text)] sm:text-2xl sm:leading-[2.1]">
                ابزار احمدی با هدف ایجاد یک تجربه ساده، مطمئن و حرفه‌ای برای
                خرید ابزار و تجهیزات ساختمانی شکل گرفته است.
              </p>

              <p className="mt-6 max-w-2xl text-sm leading-8 text-[var(--muted)] sm:mt-7 sm:text-base">
                ما تلاش می‌کنیم انتخاب ابزار، بررسی مشخصات، مقایسه محصولات و ثبت
                سفارش تا حد ممکن شفاف و بدون پیچیدگی باشد؛ تا مشتری بتواند با
                اطمینان بیشتری برای پروژه خود تصمیم بگیرد.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   VALUES
   ========================================================================== */

const values = [
  {
    number: "01",
    icon: ShieldCheck,
    title: "اعتماد",
    description:
      "اطلاعات محصول، قیمت و وضعیت موجودی باید برای مشتری شفاف و قابل اتکا باشد.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "کیفیت",
    description:
      "تمرکز ما روی ارائه ابزار و تجهیزاتی است که برای استفاده واقعی در پروژه‌ها انتخاب شده‌اند.",
  },
  {
    number: "03",
    icon: Wrench,
    title: "کاربرد",
    description:
      "محصول خوب زمانی ارزشمند است که بتواند یک نیاز واقعی را درست و مطمئن برطرف کند.",
  },
];

function ValuesSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--surface-2)] py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute -right-40 top-0 size-[500px] rounded-full bg-primary-500/[0.045] blur-3xl" />

      <div className="pointer-events-none absolute -left-40 bottom-0 size-[400px] rounded-full bg-primary-500/[0.025] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10 max-w-2xl sm:mb-14">
          <Reveal>
            <SectionEyebrow>OUR PRINCIPLES</SectionEyebrow>

            <h2 className="text-3xl font-black leading-tight tracking-tight text-[var(--text)] sm:text-5xl">
              سه اصل ساده،
              <br />
              <span className="text-[var(--muted)]">برای یک تجربه بهتر.</span>
            </h2>
          </Reveal>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.15,
          }}
          className="grid gap-3 sm:gap-4 md:grid-cols-3"
        >
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <motion.article
                key={value.number}
                variants={item}
                whileHover={{
                  y: -5,
                }}
                className="group relative min-h-[270px] overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-shadow duration-500 hover:shadow-xl sm:min-h-[320px] sm:p-10"
              >
                <div className="pointer-events-none absolute -left-16 -top-16 size-40 rounded-full bg-primary-500/[0.035] blur-2xl transition-all duration-500 group-hover:bg-primary-500/[0.08]" />

                <div className="relative flex items-start justify-between">
                  <span className="text-xs font-black tracking-[0.2em] text-[var(--muted)]/50">
                    {value.number}
                  </span>

                  <div className="flex size-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] text-primary-600 transition-all duration-300 group-hover:border-primary-200 group-hover:bg-primary-50 dark:text-primary-400 dark:group-hover:border-primary-800 dark:group-hover:bg-primary-900/30">
                    <Icon className="size-5" strokeWidth={1.7} />
                  </div>
                </div>

                <div className="relative mt-20 sm:mt-24">
                  <h3 className="text-xl font-black text-[var(--text)] sm:text-2xl">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:mt-4 sm:leading-8">
                    {value.description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ==========================================================================
   CATEGORIES
   ========================================================================== */

const categories = [
  "ابزار برقی",
  "ابزار دستی",
  "ابزار اندازه‌گیری",
  "تجهیزات کارگاهی",
  "ابزار ساختمانی",
  "لوازم جانبی و مصرفی",
];

function CategoriesSection() {
  return (
    <section className="bg-[var(--bg)] py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 sm:gap-16 lg:grid-cols-[0.75fr_1.25fr]">
          <Reveal
            variants={fadeRight}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <SectionEyebrow>PRODUCT WORLD</SectionEyebrow>

            <h2 className="text-3xl font-black leading-tight tracking-tight text-[var(--text)] sm:text-5xl">
              هر پروژه،
              <br />
              <span className="text-[var(--muted)]">ابزار خودش را دارد.</span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-8 text-[var(--muted)] sm:mt-6 sm:text-base">
              از ابزارهای روزمره تا تجهیزات تخصصی‌تر، دسته‌بندی محصولات طوری
              طراحی شده تا پیدا کردن ابزار موردنیاز سریع‌تر و ساده‌تر باشد.
            </p>

            <Link
              href="/products"
              className="group mt-7 inline-flex items-center gap-3 text-sm font-black text-[var(--text)] sm:mt-8"
            >
              مشاهده محصولات
              <span className="flex size-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] transition-all duration-300 group-hover:-translate-x-1 group-hover:border-primary-500 group-hover:bg-primary-500 group-hover:text-white">
                <ArrowLeft className="size-4" />
              </span>
            </Link>
          </Reveal>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
            className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]"
          >
            {categories.map((category, index) => (
              <motion.div
                key={category}
                variants={item}
                whileHover={{
                  x: -5,
                }}
                className="group flex items-center justify-between border-b border-[var(--border)] px-5 py-6 transition-colors duration-300 last:border-b-0 hover:bg-[var(--surface-2)] sm:px-8 sm:py-8"
              >
                <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                  <span className="shrink-0 text-xs font-black text-[var(--muted)]/45">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="text-base font-black text-[var(--text)] transition-colors duration-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 sm:text-xl">
                    {category}
                  </span>
                </div>

                <ChevronLeft className="size-5 shrink-0 text-[var(--muted)]/35 transition-all duration-300 group-hover:-translate-x-1 group-hover:text-primary-500" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   EXPERIENCE
   ========================================================================== */

const steps = [
  {
    number: "01",
    title: "انتخاب محصول",
    description:
      "محصول موردنیاز خود را از میان دسته‌بندی‌ها و محصولات فروشگاه پیدا کنید.",
  },
  {
    number: "02",
    title: "بررسی و مقایسه",
    description:
      "مشخصات و اطلاعات محصول را بررسی کنید و مناسب‌ترین گزینه را انتخاب کنید.",
  },
  {
    number: "03",
    title: "ثبت سفارش",
    description:
      "سفارش خود را ثبت کنید تا فرآیند بررسی و آماده‌سازی آن انجام شود.",
  },
  {
    number: "04",
    title: "دریافت سفارش",
    description:
      "پس از تکمیل فرآیند سفارش، محصول برای شما آماده و ارسال خواهد شد.",
  },
];

function ExperienceSection() {
  return (
    <section className="bg-[var(--surface-2)] py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionEyebrow>HOW IT WORKS</SectionEyebrow>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <h2 className="max-w-2xl text-3xl font-black leading-tight tracking-tight text-[var(--text)] sm:text-5xl">
              خرید ابزار،
              <br />
              <span className="text-[var(--muted)]">بدون مسیرهای پیچیده.</span>
            </h2>

            <p className="max-w-md text-sm leading-8 text-[var(--muted)] sm:text-base">
              تلاش کرده‌ایم مسیر خرید از انتخاب محصول تا دریافت سفارش، ساده و
              قابل فهم باشد.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-8 sm:mt-16 lg:grid-cols-[1.4fr_0.6fr]">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.1,
            }}
            className="grid gap-x-8 sm:grid-cols-2"
          >
            {steps.map((step) => (
              <motion.div
                key={step.number}
                variants={item}
                className="border-t border-[var(--border)] py-7 sm:py-8"
              >
                <span className="text-xs font-black tracking-[0.15em] text-[var(--muted)]/45">
                  {step.number}
                </span>

                <h3 className="mt-4 text-lg font-black text-[var(--text)] sm:mt-5">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <Reveal variants={fadeLeft}>
            <div className="relative min-h-[300px] overflow-hidden rounded-[var(--radius)] border border-primary-800 bg-dark-800 p-7 text-white shadow-xl sm:min-h-[330px] sm:p-10">
              <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-primary-500/[0.14] blur-3xl" />

              <div className="pointer-events-none absolute -bottom-24 -left-16 size-52 rounded-full bg-primary-500/[0.08] blur-3xl" />

              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-primary-400/20 bg-primary-500/10 text-primary-400">
                    <CircleCheck className="size-5" strokeWidth={1.6} />
                  </div>

                  <h3 className="mt-7 text-2xl font-black leading-tight sm:mt-8">
                    انتخاب مطمئن،
                    <br />
                    از اولین قدم.
                  </h3>
                </div>

                <p className="mt-10 text-sm leading-7 text-white/45 sm:mt-12">
                  اگر برای انتخاب ابزار مناسب نیاز به راهنمایی دارید، می‌توانید
                  قبل از خرید با ما در ارتباط باشید.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   WHY AHMADI
   ========================================================================== */

const reasons = [
  {
    icon: BadgeCheck,
    title: "اطلاعات شفاف",
    description:
      "تلاش می‌کنیم مشخصات و اطلاعات محصولات واضح و قابل استفاده باشد.",
  },
  {
    icon: ShieldCheck,
    title: "تمرکز روی اعتماد",
    description:
      "هدف ما ایجاد رابطه‌ای بلندمدت با مشتریان و ارائه تجربه‌ای مطمئن است.",
  },
  {
    icon: Package,
    title: "تنوع کاربردی",
    description:
      "دسته‌بندی محصولات بر اساس نیازهای واقعی کاربران و پروژه‌ها شکل گرفته است.",
  },
  {
    icon: Headphones,
    title: "پشتیبانی انسانی",
    description:
      "در مسیر انتخاب و خرید، ارتباط با تیم فروش و پشتیبانی در دسترس است.",
  },
];

function WhyAhmadiSection() {
  return (
    <section className="bg-[var(--bg)] py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 sm:gap-16 lg:grid-cols-[0.7fr_1.3fr]">
          <Reveal variants={fadeRight}>
            <SectionEyebrow>WHY AHMADI</SectionEyebrow>

            <h2 className="text-3xl font-black leading-tight tracking-tight text-[var(--text)] sm:text-5xl">
              چرا
              <br />
              <span className="text-primary-600 dark:text-primary-400">
                ابزار احمدی؟
              </span>
            </h2>
          </Reveal>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.1,
            }}
            className="grid gap-x-10 md:grid-cols-2"
          >
            {reasons.map((reason) => {
              const Icon = reason.icon;

              return (
                <motion.article
                  key={reason.title}
                  variants={item}
                  className="group border-t border-[var(--border)] py-7 sm:py-8"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <h3 className="text-lg font-black text-[var(--text)]">
                        {reason.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                        {reason.description}
                      </p>
                    </div>

                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-primary-600 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary-200 group-hover:bg-primary-50 dark:text-primary-400 dark:group-hover:border-primary-800 dark:group-hover:bg-primary-900/30">
                      <Icon className="size-4" strokeWidth={1.7} />
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   FINAL CTA
   ========================================================================== */

function FinalCTA() {
  return (
    <section className="bg-[var(--bg)] px-4 pb-6 sm:px-8 sm:pb-10">
      <Reveal variants={scaleIn}>
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[var(--radius)] border border-primary-800 bg-dark-800 px-6 py-12 text-white shadow-2xl sm:rounded-[calc(var(--radius)*1.5)] sm:px-12 sm:py-20 lg:px-16">
          <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-primary-500/[0.14] blur-3xl" />

          <div className="pointer-events-none absolute -bottom-40 left-10 size-80 rounded-full bg-primary-500/[0.08] blur-3xl" />

          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute right-1/2 top-1/2 size-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-500/10 blur-2xl"
          />

          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <SectionEyebrow light>START SHOPPING</SectionEyebrow>

              <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                ابزار مناسب پروژه‌ات
                <br />
                <span className="text-primary-400">را پیدا کن.</span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-8 text-white/45 sm:mt-6 sm:text-base">
                محصولات ابزار احمدی را ببین و برای شروع، دسته‌بندی موردنظر خودت
                را انتخاب کن.
              </p>
            </div>

            <Link
              href="/products"
              className="group inline-flex min-h-11 shrink-0 items-center gap-3 rounded-xl bg-primary-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1 hover:bg-primary-600 hover:shadow-primary-500/30 sm:px-6 sm:py-3.5"
            >
              مشاهده محصولات
              <ArrowUpLeft className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ==========================================================================
   PAGE
   ========================================================================== */

export function AboutPage() {
  return (
    <main
      dir="rtl"
      className="overflow-hidden bg-[var(--bg)] text-[var(--text)]"
    >
      <AboutHero />

      <TrustStrip />

      <IntroSection />

      <ValuesSection />

      <CategoriesSection />

      <ExperienceSection />

      <WhyAhmadiSection />

      <FinalCTA />
    </main>
  );
}
