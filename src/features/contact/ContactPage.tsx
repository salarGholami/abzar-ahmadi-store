
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
  Clock3,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
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

function Reveal({
  children,
  variants = fadeUp,
  className,
}: RevealProps) {
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

function ContactHero() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[var(--bg)]">
      {/* DESKTOP */}

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
            src="/images/banners/contact/2.webp"
            alt="تماس با ابزار احمدی"
            width={1200}
            height={800}
            priority
            quality={95}
            sizes="100vw"
            className="block h-auto w-full"
          />
        </motion.div>
      </div>

      {/* MOBILE */}

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
            src="/images/banners/contact/2.webp"
            alt="تماس با ابزار احمدی"
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-cover object-center"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/[0.03] via-transparent to-black/20" />

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
   CONTACT TRUST STRIP
   ========================================================================== */

const contactTrustItems = [
  {
    icon: Headphones,
    title: "پشتیبانی مستقیم",
    description: "برای انتخاب و خرید در کنار شما هستیم",
  },
  {
    icon: Phone,
    title: "ارتباط سریع",
    description: "راه‌های ارتباطی ساده و در دسترس",
  },
  {
    icon: Clock3,
    title: "پاسخ‌گویی",
    description: "در ساعات کاری پاسخ‌گوی شما هستیم",
  },
  {
    icon: ShieldCheck,
    title: "ارتباط مطمئن",
    description: "پاسخ‌گویی توسط تیم ابزار احمدی",
  },
];

function ContactTrustStrip() {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[var(--border)] px-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-8 lg:grid-cols-4">
        {contactTrustItems.map((itemData, index) => {
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

function ContactIntroSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg)] py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute -left-40 top-20 size-96 rounded-full bg-primary-500/[0.035] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 sm:gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <Reveal variants={fadeRight}>
            <SectionEyebrow>CONTACT AHMADI</SectionEyebrow>

            <h2 className="max-w-md text-3xl font-black leading-[1.35] tracking-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
              همیشه یک راه
              <span className="mt-2 block text-[var(--muted)]">
                برای ارتباط هست.
              </span>
            </h2>
          </Reveal>

          <Reveal variants={fadeLeft}>
            <div className="max-w-3xl lg:mr-auto">
              <p className="text-lg font-bold leading-9 text-[var(--text)] sm:text-2xl sm:leading-[2.1]">
                اگر درباره محصولات، ثبت سفارش یا انتخاب ابزار مناسب سؤال دارید،
                تیم ابزار احمدی آماده پاسخ‌گویی به شماست.
              </p>

              <p className="mt-6 max-w-2xl text-sm leading-8 text-[var(--muted)] sm:mt-7 sm:text-base">
                هدف ما این است که قبل و بعد از خرید، مسیر ارتباطی ساده و
                قابل اعتمادی در اختیار شما باشد تا بتوانید با خیال راحت
                سؤالات خود را مطرح کنید و راهنمایی بگیرید.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   CONTACT METHODS
   ========================================================================== */

const contactMethods = [
  {
    number: "01",
    icon: Phone,
    title: "تماس تلفنی",
    description:
      "برای دریافت مشاوره، پیگیری سفارش یا پرسش درباره محصولات می‌توانید با ما تماس بگیرید.",
    label: "تماس با ما",
    href: "tel:+982100000000",
  },
  {
    number: "02",
    icon: MessageCircle,
    title: "پشتیبانی و مشاوره",
    description:
      "اگر برای انتخاب ابزار مناسب پروژه خود نیاز به راهنمایی دارید، با تیم ما در ارتباط باشید.",
    label: "دریافت راهنمایی",
    href: "/products",
  },
  {
    number: "03",
    icon: Mail,
    title: "ارتباط از طریق ایمیل",
    description:
      "برای ارسال درخواست‌ها، پیشنهادها و پیام‌های کاری می‌توانید از ایمیل مجموعه استفاده کنید.",
    label: "ارسال ایمیل",
    href: "mailto:info@abzar-ahmadi.ir",
  },
];

function ContactMethodsSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--surface-2)] py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute -right-40 top-0 size-[500px] rounded-full bg-primary-500/[0.045] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10 max-w-2xl sm:mb-14">
          <Reveal>
            <SectionEyebrow>CONTACT CHANNELS</SectionEyebrow>

            <h2 className="text-3xl font-black leading-tight tracking-tight text-[var(--text)] sm:text-5xl">
              راه‌های ارتباطی،
              <br />
              <span className="text-[var(--muted)]">
                ساده و در دسترس.
              </span>
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
          {contactMethods.map((method) => {
            const Icon = method.icon;

            return (
              <motion.article
                key={method.number}
                variants={item}
                whileHover={{
                  y: -5,
                }}
                className="group relative min-h-[300px] overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-shadow duration-500 hover:shadow-xl sm:min-h-[340px] sm:p-10"
              >
                <div className="pointer-events-none absolute -left-16 -top-16 size-40 rounded-full bg-primary-500/[0.035] blur-2xl transition-all duration-500 group-hover:bg-primary-500/[0.08]" />

                <div className="relative flex items-start justify-between">
                  <span className="text-xs font-black tracking-[0.2em] text-[var(--muted)]/50">
                    {method.number}
                  </span>

                  <div className="flex size-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] text-primary-600 transition-all duration-300 group-hover:border-primary-200 group-hover:bg-primary-50 dark:text-primary-400 dark:group-hover:border-primary-800 dark:group-hover:bg-primary-900/30">
                    <Icon className="size-5" strokeWidth={1.7} />
                  </div>
                </div>

                <div className="relative mt-16 sm:mt-20">
                  <h3 className="text-xl font-black text-[var(--text)] sm:text-2xl">
                    {method.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:mt-4 sm:leading-8">
                    {method.description}
                  </p>

                  <Link
                    href={method.href}
                    className="group/link mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--text)]"
                  >
                    {method.label}

                    <span className="flex size-8 items-center justify-center rounded-full border border-[var(--border)] transition-all duration-300 group-hover/link:-translate-x-1 group-hover/link:border-primary-500 group-hover/link:bg-primary-500 group-hover/link:text-white">
                      <ArrowLeft className="size-3.5" />
                    </span>
                  </Link>
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
   ADDRESS
   ========================================================================== */

function AddressSection() {
  return (
    <section className="bg-[var(--bg)] py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 sm:gap-16 lg:grid-cols-[0.75fr_1.25fr]">
          <Reveal variants={fadeRight}>
            <SectionEyebrow>OUR LOCATION</SectionEyebrow>

            <h2 className="text-3xl font-black leading-tight tracking-tight text-[var(--text)] sm:text-5xl">
              ما را
              <br />
              <span className="text-primary-600 dark:text-primary-400">
                پیدا کنید.
              </span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-8 text-[var(--muted)] sm:mt-6 sm:text-base">
              برای مراجعه حضوری یا دریافت اطلاعات بیشتر درباره موقعیت مجموعه،
              می‌توانید از اطلاعات زیر استفاده کنید.
            </p>
          </Reveal>

          <Reveal variants={fadeLeft}>
            <div className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-10">
              <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-primary-500/[0.045] blur-3xl" />

              <div className="relative grid gap-8 sm:grid-cols-2">
                <div>
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] text-primary-600 dark:text-primary-400">
                    <MapPin className="size-5" strokeWidth={1.7} />
                  </div>

                  <h3 className="mt-6 text-lg font-black text-[var(--text)]">
                    آدرس فروشگاه
                  </h3>

                  <p className="mt-3 text-sm leading-8 text-[var(--muted)]">
                    آدرس فروشگاه ابزار احمدی در این بخش قرار می‌گیرد.
                  </p>
                </div>

                <div>
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] text-primary-600 dark:text-primary-400">
                    <Clock3 className="size-5" strokeWidth={1.7} />
                  </div>

                  <h3 className="mt-6 text-lg font-black text-[var(--text)]">
                    ساعات کاری
                  </h3>

                  <p className="mt-3 text-sm leading-8 text-[var(--muted)]">
                    شنبه تا پنجشنبه
                    <br />
                    در ساعات کاری مجموعه پاسخ‌گوی شما هستیم.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   EXPERIENCE
   ========================================================================== */

const supportSteps = [
  {
    number: "01",
    title: "سؤال خود را مطرح کنید",
    description:
      "موضوع موردنظر خود را درباره محصول، سفارش یا خدمات فروشگاه با ما در میان بگذارید.",
  },
  {
    number: "02",
    title: "راهنمایی دریافت کنید",
    description:
      "تیم ابزار احمدی اطلاعات لازم را بررسی کرده و راهنمایی مناسب را در اختیار شما قرار می‌دهد.",
  },
  {
    number: "03",
    title: "تصمیم مطمئن بگیرید",
    description:
      "با اطلاعات دقیق‌تر، محصول یا راهکار مناسب پروژه خود را انتخاب کنید.",
  },
  {
    number: "04",
    title: "در ارتباط بمانید",
    description:
      "پس از خرید نیز در صورت نیاز می‌توانید برای پیگیری و پشتیبانی با ما ارتباط داشته باشید.",
  },
];

function SupportExperienceSection() {
  return (
    <section className="bg-[var(--surface-2)] py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionEyebrow>SUPPORT EXPERIENCE</SectionEyebrow>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <h2 className="max-w-2xl text-3xl font-black leading-tight tracking-tight text-[var(--text)] sm:text-5xl">
              ارتباط با ما،
              <br />
              <span className="text-[var(--muted)]">
                بخشی از تجربه خرید است.
              </span>
            </h2>

            <p className="max-w-md text-sm leading-8 text-[var(--muted)] sm:text-base">
              هدف ما این است که مشتری در هیچ مرحله‌ای از خرید احساس سردرگمی
              نداشته باشد.
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
            {supportSteps.map((step) => (
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
                    <CircleCheck
                      className="size-5"
                      strokeWidth={1.6}
                    />
                  </div>

                  <h3 className="mt-7 text-2xl font-black leading-tight sm:mt-8">
                    سوالی دارید؟
                    <br />
                    با ما در تماس باشید.
                  </h3>
                </div>

                <p className="mt-10 text-sm leading-7 text-white/45 sm:mt-12">
                  از انتخاب ابزار مناسب تا پیگیری سفارش، می‌توانید روی
                  راهنمایی و پشتیبانی ابزار احمدی حساب کنید.
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
   WHY CONTACT
   ========================================================================== */

const reasons = [
  {
    icon: BadgeCheck,
    title: "پاسخ‌گویی شفاف",
    description:
      "تلاش می‌کنیم پاسخ‌ها و اطلاعات موردنیاز شما روشن، دقیق و قابل استفاده باشند.",
  },
  {
    icon: ShieldCheck,
    title: "اعتماد در ارتباط",
    description:
      "هدف ما ایجاد یک ارتباط حرفه‌ای و بلندمدت با مشتریان ابزار احمدی است.",
  },
  {
    icon: Package,
    title: "پیگیری سفارش",
    description:
      "برای پیگیری وضعیت سفارش و دریافت اطلاعات لازم می‌توانید با ما ارتباط بگیرید.",
  },
  {
    icon: Wrench,
    title: "مشاوره محصول",
    description:
      "اگر بین چند ابزار مردد هستید، برای انتخاب گزینه مناسب پروژه خود راهنمایی بگیرید.",
  },
];

function WhyContactSection() {
  return (
    <section className="bg-[var(--bg)] py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 sm:gap-16 lg:grid-cols-[0.7fr_1.3fr]">
          <Reveal variants={fadeRight}>
            <SectionEyebrow>WHY CONTACT US</SectionEyebrow>

            <h2 className="text-3xl font-black leading-tight tracking-tight text-[var(--text)] sm:text-5xl">
              چرا با
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
              <SectionEyebrow light>
                CONTACT AHMADI
              </SectionEyebrow>

              <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                برای انتخاب ابزار
                <br />
                <span className="text-primary-400">
                  همراه شما هستیم.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-8 text-white/45 sm:mt-6 sm:text-base">
                اگر درباره محصولات، سفارش یا انتخاب ابزار مناسب پروژه خود
                سؤالی دارید، با ابزار احمدی در ارتباط باشید.
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

export function ContactPage() {
  return (
    <main
      dir="rtl"
      className="overflow-hidden bg-[var(--bg)] text-[var(--text)]"
    >
      <ContactHero />

      <ContactTrustStrip />

      <ContactIntroSection />

      <ContactMethodsSection />

      <AddressSection />

      <SupportExperienceSection />

      <WhyContactSection />

      <FinalCTA />
    </main>
  );
}

