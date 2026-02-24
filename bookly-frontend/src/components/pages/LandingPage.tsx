"use client";

import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { i18nConfig } from "@/i18n/config";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
  LayoutDashboard,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && i18nConfig.locales.includes(segments[0] as "es" | "en")) {
    return segments[0];
  }
  return i18nConfig.defaultLocale;
}

function getAlternateLocale(current: string): string {
  return current === "es" ? "en" : "es";
}

export function LandingPage() {
  const t = useTranslations("landing");
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const alternateLocale = getAlternateLocale(currentLocale);

  const features = [
    { key: "resources", icon: BookOpen, gradient: "from-blue-500 to-blue-600" },
    { key: "reservations", icon: Calendar, gradient: "from-teal-500 to-teal-600" },
    { key: "approvals", icon: CheckCircle2, gradient: "from-orange-500 to-orange-600" },
    { key: "reports", icon: LayoutDashboard, gradient: "from-purple-500 to-purple-600" },
    { key: "calendar", icon: Clock, gradient: "from-indigo-500 to-indigo-600" },
    { key: "security", icon: Shield, gradient: "from-emerald-500 to-emerald-600" },
  ];

  const stats = [
    { valueKey: "stat1_value", labelKey: "stat1_label" },
    { valueKey: "stat2_value", labelKey: "stat2_label" },
    { valueKey: "stat3_value", labelKey: "stat3_label" },
    { valueKey: "stat4_value", labelKey: "stat4_label" },
  ];

  const benefitCards = [
    { titleKey: "card1_title", descKey: "card1_desc", icon: GraduationCap, color: "text-blue-500" },
    { titleKey: "card2_title", descKey: "card2_desc", icon: Users, color: "text-teal-500" },
    { titleKey: "card3_title", descKey: "card3_desc", icon: LayoutDashboard, color: "text-purple-500" },
  ];


  return (
    <div className="min-h-screen bg-app">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 z-50 w-full border-b border-line-subtle bg-surface/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={`/${currentLocale}`} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary-500 to-brand-primary-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-content-primary">Bookly</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-content-secondary transition-colors hover:text-content-primary">
              {t("nav.features")}
            </a>
            <a href="#benefits" className="text-sm font-medium text-content-secondary transition-colors hover:text-content-primary">
              {t("nav.benefits")}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle testId="landing-theme-toggle" />

            <Link
              href={`/${alternateLocale}`}
              className="rounded-md px-2.5 py-1.5 text-xs font-semibold uppercase text-content-secondary transition-colors hover:bg-action-ghost-hover hover:text-content-primary"
            >
              {alternateLocale}
            </Link>

            <Link
              href={`/${currentLocale}/login`}
              className="hidden rounded-lg bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-primary-500/25 transition-all hover:from-brand-primary-600 hover:to-brand-primary-700 hover:shadow-lg hover:shadow-brand-primary-500/30 sm:inline-flex"
            >
              {t("nav.cta")}
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pt-16">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-brand-primary-500/10 blur-3xl" />
          <div className="absolute -bottom-40 left-0 h-[500px] w-[500px] rounded-full bg-brand-secondary-500/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary-500/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-primary-200 bg-brand-primary-50 px-4 py-1.5 text-sm font-medium text-brand-primary-600 dark:border-brand-primary-800 dark:bg-brand-primary-900/30 dark:text-brand-primary-400">
              <Sparkles className="h-3.5 w-3.5" />
              {t("hero.badge")}
            </div>

            {/* Title */}
            <h1 className="text-4xl font-extrabold tracking-tight text-content-primary sm:text-5xl lg:text-6xl">
              {t("hero.title_line1")}{" "}
              <span className="bg-gradient-to-r from-brand-primary-500 to-brand-secondary-500 bg-clip-text text-transparent">
                {t("hero.title_highlight")}
              </span>
              <br />
              {t("hero.title_line2")}
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-content-secondary sm:text-xl">
              {t("hero.subtitle")}
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href={`/${currentLocale}/login`}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-primary-500/25 transition-all hover:from-brand-primary-600 hover:to-brand-primary-700 hover:shadow-xl hover:shadow-brand-primary-500/30"
              >
                {t("hero.cta_primary")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={`/${currentLocale}/register`}
                className="group inline-flex items-center gap-2 rounded-xl border-2 border-brand-primary-200 bg-surface px-8 py-3.5 text-base font-semibold text-brand-primary-600 transition-all hover:border-brand-primary-300 hover:bg-brand-primary-50 dark:border-brand-primary-700 dark:text-brand-primary-400 dark:hover:border-brand-primary-600 dark:hover:bg-brand-primary-900/30"
              >
                {t("hero.cta_secondary")}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Trust indicator */}
            <p className="mt-8 text-sm text-content-tertiary">
              {t("hero.trusted_by")}
            </p>
          </div>
        </div>

        {/* Gradient separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-line-subtle to-transparent" />
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-content-primary sm:text-4xl">
              {t("features.title")}
            </h2>
            <p className="mt-4 text-lg text-content-secondary">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.key}
                  className="group relative overflow-hidden rounded-2xl border border-line-subtle bg-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary-200 hover:shadow-xl hover:shadow-brand-primary-500/5 dark:hover:border-brand-primary-700"
                >
                  <div className={`mb-5 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3 shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-content-primary">
                    {t(`features.${feature.key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-content-secondary">
                    {t(`features.${feature.key}.description`)}
                  </p>
                  {/* Hover decoration */}
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-brand-primary-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gradient separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-line-subtle to-transparent" />

      {/* ─── Benefits / Stats Section ─── */}
      <section id="benefits" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-content-primary sm:text-4xl">
              {t("benefits.title")}
            </h2>
            <p className="mt-4 text-lg text-content-secondary">
              {t("benefits.subtitle")}
            </p>
          </div>

          {/* Stats grid */}
          <div className="mt-16 grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.valueKey} className="text-center">
                <div className="text-4xl font-extrabold text-brand-primary-500 sm:text-5xl">
                  {t(`benefits.${stat.valueKey}`)}
                </div>
                <p className="mt-2 text-sm font-medium text-content-secondary">
                  {t(`benefits.${stat.labelKey}`)}
                </p>
              </div>
            ))}
          </div>

          {/* Benefit cards */}
          <div className="mt-20 grid gap-8 md:grid-cols-3">
            {benefitCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.titleKey}
                  className="rounded-2xl border border-line-subtle bg-surface p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-primary-500/5"
                >
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary-50 dark:bg-brand-primary-900/30">
                    <Icon className={`h-7 w-7 ${card.color}`} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-content-primary">
                    {t(`benefits.${card.titleKey}`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-content-secondary">
                    {t(`benefits.${card.descKey}`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Final CTA Section ─── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary-600 via-brand-primary-500 to-brand-secondary-500 p-12 text-center shadow-2xl sm:p-16">
            {/* Decorations */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
            </div>

            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                {t("cta_section.title")}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
                {t("cta_section.subtitle")}
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href={`/${currentLocale}/register`}
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-brand-primary-600 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl"
                >
                  {t("cta_section.button")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <p className="mt-6 text-sm text-blue-200">
                {t("cta_section.login_text")}{" "}
                <Link
                  href={`/${currentLocale}/login`}
                  className="font-semibold text-white underline decoration-white/50 underline-offset-2 transition-colors hover:decoration-white"
                >
                  {t("cta_section.login_link")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-line-subtle py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-4">
            {/* Brand column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary-500 to-brand-primary-600">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-content-primary">Bookly</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-content-secondary">
                {t("footer.brand_desc")}
              </p>
            </div>

            {/* Product links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-content-primary">
                {t("footer.product")}
              </h4>
              <ul className="space-y-3 text-sm text-content-secondary">
                <li>
                  <a href="#features" className="transition-colors hover:text-content-primary">
                    {t("footer.resources_link")}
                  </a>
                </li>
                <li>
                  <a href="#features" className="transition-colors hover:text-content-primary">
                    {t("footer.reservations_link")}
                  </a>
                </li>
                <li>
                  <a href="#features" className="transition-colors hover:text-content-primary">
                    {t("footer.approvals_link")}
                  </a>
                </li>
                <li>
                  <a href="#features" className="transition-colors hover:text-content-primary">
                    {t("footer.reports_link")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Support links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-content-primary">
                {t("footer.support")}
              </h4>
              <ul className="space-y-3 text-sm text-content-secondary">
                <li>
                  <span className="transition-colors hover:text-content-primary">
                    {t("footer.help_center")}
                  </span>
                </li>
                <li>
                  <span className="transition-colors hover:text-content-primary">
                    {t("footer.contact")}
                  </span>
                </li>
                <li>
                  <span className="transition-colors hover:text-content-primary">
                    {t("footer.documentation")}
                  </span>
                </li>
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-content-primary">
                {t("footer.legal")}
              </h4>
              <ul className="space-y-3 text-sm text-content-secondary">
                <li>
                  <span className="transition-colors hover:text-content-primary">
                    {t("footer.privacy")}
                  </span>
                </li>
                <li>
                  <span className="transition-colors hover:text-content-primary">
                    {t("footer.terms")}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line-subtle pt-8 sm:flex-row">
            <p className="text-xs text-content-tertiary">
              &copy; {new Date().getFullYear()} {t("footer.copyright")}
            </p>
            <p className="text-xs text-content-tertiary">
              {t("footer.university")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
