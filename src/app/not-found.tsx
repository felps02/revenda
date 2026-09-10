import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { waMessage, whatsappUrl } from "@/services/whatsapp";
import styles from "./not-found.module.css";

/**
 * 404 global. Renderiza o próprio cabeçalho e rodapé porque fica fora do
 * grupo (site), que é quem normalmente monta essa moldura.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <main className={styles.wrapper}>
        <div className="container-narrow">
          <p className={styles.code}>404</p>
          <h1>Essa página saiu do pátio</h1>
          <p className="lead">
            O endereço não existe mais ou foi digitado errado. Mas o estoque continua no lugar — e um consultor pode
            achar o carro que você procura em minutos.
          </p>

          <div className={styles.actions}>
            <Button href="/" variant="outline" size="lg">
              Voltar ao início
            </Button>
            <Button href="/estoque" size="lg" iconRight="arrow-right">
              Ver o estoque
            </Button>
            <Button href={whatsappUrl(waMessage.generic())} external variant="whatsapp" size="lg">
              Falar no WhatsApp
            </Button>
          </div>

          <ul className={styles.links}>
            <li>
              <a href="/financiamento">
                <Icon name="calculator" size={18} /> Simular financiamento
              </a>
            </li>
            <li>
              <a href="/avaliacao">
                <Icon name="wallet" size={18} /> Vender ou trocar meu carro
              </a>
            </li>
            <li>
              <a href="/contato">
                <Icon name="map-pin" size={18} /> Onde estamos
              </a>
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
