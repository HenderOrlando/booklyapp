import { useTranslations } from "next-intl";
import Link from "next/link";

export default function HomePage() {
  const t = useTranslations("landing");
  const tAuth = useTranslations("auth");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          {t("title")}
        </h1>
        <p className="text-center text-lg mb-4">
          {t("subtitle")}
        </p>

        {/* Botón de Login */}
        <div className="flex justify-center gap-4 mt-6 mb-8">
          <Link
            href="/login"
            className="px-6 py-3 bg-brand-primary-500 text-white rounded-lg font-semibold hover:bg-brand-primary-600 transition-colors"
          >
            {tAuth("login")}
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 border border-brand-primary-500 text-brand-primary-500 rounded-lg font-semibold hover:bg-brand-primary-50 transition-colors"
          >
            {tAuth("register")}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">{t("sections.resources_title")}</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">{t("sections.resources_desc")}</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">{t("sections.reservations_title")}</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {t("sections.reservations_desc")}
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">{t("sections.approvals_title")}</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {t("sections.approvals_desc")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
