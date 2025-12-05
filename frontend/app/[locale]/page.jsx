import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("Homepage");
  return (
    <div className="h-screen max-w-7xl mx-auto">
      <p className="py-20 text-4xl text-center ">{t("title")}</p>
    </div>
  );
}
