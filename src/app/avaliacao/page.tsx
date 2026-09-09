import Breadcrumbs from "@/components/layout/Breadcrumbs";
import TradeInForm from "@/components/forms/TradeInForm";
import Faq from "@/components/institucional/Faq";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { waMessage, whatsappUrl } from "@/services/whatsapp";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Venda ou troque seu carro",
  description:
    "Avaliamos seu veículo em até 24 horas, pagamos à vista ou abatemos na troca e cuidamos de toda a documentação. Envie os dados e receba a proposta.",
  path: "/avaliacao",
  keywords: ["vender meu carro", "avaliação de veículo", "troca de carro curitiba"],
});

const STEPS = [
  {
    title: "Você preenche o formulário",
    text: "Marca, modelo, ano, quilometragem e o que for relevante sobre o estado do carro.",
  },
  {
    title: "Avaliamos e enviamos a proposta",
    text: "Cruzamos a tabela FIPE com o preço real de venda na região. Resposta em até 24 horas úteis.",
  },
  {
    title: "Você fecha na loja",
    text: "Conferimos o carro pessoalmente, pagamos à vista por transferência ou abatemos na troca.",
  },
];

const VALUED = [
  "Revisões em dia, com histórico documentado",
  "Único dono e baixa quilometragem",
  "Sem passagem por sinistro, leilão ou enchente",
  "Pintura original e pneus em bom estado",
  "IPVA quitado e sem multas pendentes",
];

const PROOFS = [
  {
    icon: "wallet" as const,
    title: "Avaliação gratuita e sem compromisso",
    text: "Você recebe o valor e decide depois. Não cobramos nada e não insistimos.",
  },
  {
    icon: "shield" as const,
    title: "Quitamos o financiamento do seu carro",
    text: "Se ainda houver saldo devedor, falamos direto com o banco e resolvemos a baixa do gravame.",
  },
  {
    icon: "key" as const,
    title: "Documentação por nossa conta",
    text: "Transferência, despachante e comunicação de venda ao Detran ficam com a gente.",
  },
];

const FAQ_ITEMS = [
  {
    id: "compra-direta",
    question: "Vocês compram carro sem eu comprar outro?",
    answer:
      "Compramos, sim. Boa parte do nosso estoque vem de compra direta: avaliamos, pagamos por transferência no mesmo dia e assumimos toda a papelada.",
  },
  {
    id: "como-avaliam",
    question: "Como vocês chegam ao valor?",
    answer:
      "Partimos da tabela FIPE e ajustamos pelo que o modelo realmente vende na região, pela quilometragem, pelo estado de pintura e pneus e pelo histórico de manutenção. Mostramos essa conta para você.",
  },
  {
    id: "carro-financiado",
    question: "Meu carro está financiado. Dá para trocar?",
    answer:
      "Dá. Consultamos o saldo devedor no banco, quitamos o contrato e o que sobrar entra como entrada no carro novo. Se o saldo for maior que o valor do carro, mostramos a diferença antes de qualquer decisão.",
  },
  {
    id: "levar-ate-loja",
    question: "Preciso levar o carro até a loja?",
    answer:
      "Só na hora de fechar. A avaliação inicial é feita pelas fotos e pelos dados do formulário. Em Curitiba e região metropolitana, também buscamos o veículo para a conferência final.",
  },
];

export default function AvaliacaoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQ_ITEMS)) }}
      />

      <header className={styles.header}>
        <div className="container">
          <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Vender ou trocar" }]} />
          <p className="eyebrow">Avaliação em até 24 horas</p>
          <h1>Quer trocar ou vender seu carro?</h1>
          <p className="lead">
            Faça a avaliação sem sair de casa. Você envia os dados, a gente devolve uma proposta real — com pagamento à
            vista ou abatimento na troca por qualquer veículo do nosso estoque.
          </p>
        </div>
      </header>

      <div className={`container ${styles.layout}`}>
        <div className={styles.formColumn}>
          <div className={styles.formCard}>
            <TradeInForm />
          </div>
        </div>

        <aside className={styles.aside}>
          <div className={styles.asideCard}>
            <h2>Como funciona</h2>
            <ol className={styles.steps}>
              {STEPS.map((step, index) => (
                <li key={step.title}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.asideCard}>
            <h2>O que valorizamos na avaliação</h2>
            <ul className={styles.valued}>
              {VALUED.map((item) => (
                <li key={item}>
                  <Icon name="check" size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.whatsCard}>
            <h2>Prefere resolver pelo WhatsApp?</h2>
            <p>Manda as fotos e os dados por lá. Um avaliador responde na hora, em horário comercial.</p>
            <Button
              href={whatsappUrl(
                waMessage.tradeIn({ brand: "", model: "", year: "", mileage: "" }),
              )}
              external
              variant="whatsapp"
              size="lg"
              fullWidth
            >
              Avaliar pelo WhatsApp
            </Button>
          </div>
        </aside>
      </div>

      <section className="section band-alt" aria-labelledby="garantias-avaliacao">
        <div className="container">
          <SectionHeading
            as="h2"
            id="garantias-avaliacao"
            eyebrow="Sem pegadinha"
            title="O que está incluído"
            align="center"
          />
          <ul className={styles.proofs}>
            {PROOFS.map((proof) => (
              <li key={proof.title}>
                <Icon name={proof.icon} size={26} />
                <h3>{proof.title}</h3>
                <p>{proof.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Faq items={FAQ_ITEMS} />
    </>
  );
}
