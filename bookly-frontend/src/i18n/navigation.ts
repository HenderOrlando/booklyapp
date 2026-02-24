import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { i18nConfig } from "./config";

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales: i18nConfig.locales });
