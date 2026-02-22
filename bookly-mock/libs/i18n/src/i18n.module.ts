import { Global, Module } from "@nestjs/common";
import { AcceptLanguageResolver, HeaderResolver, I18nModule as NestI18nModule, QueryResolver } from "nestjs-i18n";
import * as path from "path";

@Global()
@Module({
  imports: [
    NestI18nModule.forRoot({
      fallbackLanguage: "es",
      loaderOptions: {
        path: path.join(process.cwd(), "libs/i18n/src/translations/"),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ["lang"] },
        AcceptLanguageResolver,
        new HeaderResolver(["x-custom-lang"]),
      ],
    }),
  ],
  exports: [NestI18nModule],
})
export class I18nModule {}
