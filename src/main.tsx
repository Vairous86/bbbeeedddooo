import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";
import { LocaleProvider } from "./contexts/LocaleContext";

const setMetaContent = (selector: string, content: string) => {
  const el = document.querySelector(selector) as HTMLMetaElement | null;
  if (el) el.content = content;
};

const bootSeo = () => {
  const origin = window.location.origin;
  const canonicalHref = `${origin}${window.location.pathname || "/"}`;

  const canonical = document.getElementById(
    "canonical-link"
  ) as HTMLLinkElement | null;
  if (canonical) canonical.href = canonicalHref;

  setMetaContent('meta[property="og:url"]', canonicalHref);
  setMetaContent('meta[name="twitter:url"]', canonicalHref);

  const keywords =
    "bedo elmasry, bedoelmasry, bedo elmasry تزويد متابعين, bedo elmasry زيادة متابعين, شراء متابعين bedo elmasry, دعم حسابات bedo elmasry, خدمات سوشيال ميديا bedo elmasry, تسويق إلكتروني bedo elmasry, تسويق محتوى bedo elmasry, إدارة حسابات bedo elmasry, إعلانات ممولة bedo elmasry, متابعين انستجرام bedo elmasry, زيادة متابعين انستجرام bedo elmasry, لايكات انستجرام bedo elmasry, مشاهدات ريلز bedo elmasry, دعم انستجرام bedo elmasry, قفل حساب انستجرام bedo elmasry, متابعين تيك توك bedo elmasry, زيادة تفاعل تيك توك bedo elmasry, مشاهدات تيك توك bedo elmasry, لايكات تيك توك bedo elmasry, متابعين فيسبوك bedo elmasry, ترويج صفحات فيسبوك bedo elmasry, لايكات فيسبوك bedo elmasry, حل مشاكل الابتزاز bedo elmasry, استرجاع حسابات bedo elmasry, تأمين حسابات bedo elmasry, تزويد متابعين bedoelmasry, زيادة متابعين bedoelmasry, شراء متابعين من bedoelmasry, دعم حسابات bedoelmasry, خدمات سوشيال ميديا bedoelmasry, تسويق إلكتروني bedoelmasry, تسويق محتوى bedoelmasry, إدارة حسابات bedoelmasry, إعلانات ممولة bedoelmasry, متابعين انستجرام bedoelmasry, زيادة متابعين انستجرام bedoelmasry, لايكات انستجرام bedoelmasry, مشاهدات ريلز bedoelmasry, دعم انستجرام bedoelmasry, قفل حساب انستجرام bedoelmasry, متابعين تيك توك bedoelmasry, زيادة تفاعل تيك توك bedoelmasry, مشاهدات تيك توك bedoelmasry, لايكات تيك توك bedoelmasry, متابعين فيسبوك bedoelmasry, ترويج صفحات فيسبوك bedoelmasry, لايكات فيسبوك bedoelmasry, حل مشاكل الابتزاز bedoelmasry, استرجاع حسابات bedoelmasry, تأمين حسابات bedoelmasry, تزويد متابعين, زيادة متابعين, شراء متابعين, دعم حسابات, إدارة سوشيال ميديا, تسويق إلكتروني, إعلانات ممولة, ترويج منتجات, زيادة مبيعات, تسويق بالمحتوى, خدمات نمو الحسابات, زيادة التفاعل, متابعين انستجرام, مشاهدات ريلز, لايكات انستجرام, زيادة متابعين تيك توك, مشاهدات تيك توك, لايكات تيك توك, متابعين فيسبوك, ترويج صفحات فيسبوك, لايكات فيسبوك, رفع تفاعل الحسابات, ترويج بوستات, قفل حساب انستجرام, حل مشاكل الابتزاز, تأمين حسابات التواصل, استرجاع الحسابات, حماية الحسابات من الاختراق, مكافحة الابتزاز الإلكتروني";

  const structuredDataEl = document.getElementById("structured-data");
  if (structuredDataEl) {
    const data = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          name: "bedo elmasry",
          url: origin,
          logo: "https://btimnibnsoeotkomayte.supabase.co/storage/v1/object/public/services/payment-qrs/logo.png",
          sameAs: [
            "https://www.instagram.com/bedo_elmasry_9/",
            "https://www.facebook.com/profile.php?id=61570478468069",
            "https://t.me/bedo_elmasry_9",
          ],
        },
        {
          "@type": "WebSite",
          name: "bedo elmasry",
          url: origin,
          inLanguage: ["ar", "en"],
          description:
            "تزويد متابعين وزيادة تفاعل ولايكات ومشاهدات، دعم حسابات وتسويق إلكتروني وإعلانات ممولة. الرد عبر واتساب.",
          keywords,
        },
      ],
    };
    structuredDataEl.textContent = JSON.stringify(data);
  }
};

bootSeo();

createRoot(document.getElementById("root")!).render(
  <LocaleProvider defaultLocale={"ar"}>
    {/* ThemeProvider locked to dark only (Light Mode removed) */}
    <ThemeProvider attribute="class" defaultTheme="dark">
      <App />
    </ThemeProvider>
  </LocaleProvider>
);
