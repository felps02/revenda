import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import RevealRoot from "@/components/layout/RevealRoot";

/** Moldura do site público. O painel administrativo tem a sua própria. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>
      <Header />
      <RevealRoot>
        <main id="conteudo">{children}</main>
      </RevealRoot>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
