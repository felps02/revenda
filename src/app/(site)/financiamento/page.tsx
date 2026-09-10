import Image from "next/image";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Faq from "@/components/institucional/Faq";
import FinancingSimulator from "@/components/forms/FinancingSimulator";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { siteMedia } from "@/data/media";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { FINANCING_DISCLAIMER } from "@/services/financing";
import { waMessage, whatsappUrl } from "@/services/whatsapp";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Financiamento de seminovos",
  description:
    "Simule a parcela do seu próximo carro, veja a entrada mínima e envie a documentação. Aprovação em até 24 horas com cinco bancos parceiros.",
  path: "/financiamento",
  keywords: ["financiamento de carros", "simulador de parcelas", "crédito veicular curitiba"],
});

const STEPS = [
  {
    title: "Envie seus dados",
    text: "Nome, CPF e renda. Leva dois minutos pelo WhatsApp ou aqui pelo site.",
    icon: "users" as const,
  },
  {
    title: "Análise em até 24h",
    text: "Enviamos sua proposta para os cinco bancos parceiros ao mesmo tempo.",
    icon: "clock" as const,
  },
  {
    title: "Escolha a melhor proposta",
    text: "Mostramos taxa, prazo e custo total de cada banco. Você decide com os números na mão.",
    icon: "wallet" as const,
  },
  {
    title: "Retire o carro",
    text: "Assinatura digital, transferência por nossa conta e entrega em até 3 dias úteis.",
    icon: "key" as const,
  },
];

const REQUIREMENTS = [
  "CNH ou RG com CPF",
  "Comprovante de residência dos últimos 90 dias",
  "Comprovante de renda (holerite, extrato ou declaração)",
  "Dados bancários para o débito das parcelas",
];

const INFLUENCES = [
  "Score de crédito e histórico de pagamentos",
  "Renda comprovada e tempo de vínculo empregatício",
  "Valor da entrada — quanto maior, menor a taxa",
  "Prazo escolhido: prazos curtos costumam ter juros menores",
];

const FAQ_ITEMS = [
  {
    id: "restricao",
    question: "Consigo financiar com restrição no nome?",
    answer:
      "Com restrição ativa, os bancos não aprovam. Mas trabalhamos com correspondentes que aceitam score baixo mediante entrada maior — a partir de 40%. Vale enviar seus dados: a consulta é gratuita e não afeta seu score.",
  },
  {
    id: "carro-entrada",
    question: "Posso usar meu carro atual como entrada?",
    answer:
      "Sim, e é o caminho mais comum aqui. Avaliamos seu usado no mesmo dia, abatemos o valor como entrada e, se ele ainda estiver financiado, quitamos o saldo devedor direto com o banco.",
  },
  {
    id: "prazo-maximo",
    question: "Qual é o prazo máximo?",
    answer:
      "60 meses para veículos com até 8 anos de uso. Acima disso, os bancos costumam limitar a 48 meses. A entrada mínima é de 20% do valor do veículo em qualquer prazo.",
  },
  {
    id: "taxa-cadastro",
    question: "Existe taxa de cadastro?",
    answer:
      `Sim, os bancos cobram tarifa de cadastro e registro do contrato — hoje algo em torno de R$ ${siteConfig.financing.fees.toLocaleString("pt-BR")}. Ela já entra na nossa simulação, para você não ser surpreendido na assinatura.`,
  },
  {
    id: "antecipar",
    question: "Posso antecipar parcelas ou quitar antes?",
    answer:
      "Pode, a qualquer momento, com desconto proporcional dos juros — é direito garantido por lei. Ajudamos você a pedir o cálculo de quitação ao banco quando quiser.",
  },
];

export default function FinanciamentoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQ_ITEMS)) }}
      />

      <header className={styles.hero}>
        <Image
          src={siteMedia.financing.url}
          alt={siteMedia.financing.alt}
          fill
          priority
          quality={85}
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={`container ${styles.heroContent}`}>
          <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Financiamento" }]} tone="dark" />
          <p className="eyebrow">Crédito sem enrolação</p>
          <h1>Financiamento explicado antes de você assinar</h1>
          <p className={styles.heroLead}>
            Mandamos sua proposta para {siteConfig.financing.partners.length} bancos ao mesmo tempo e mostramos o custo
            real de cada um. Entrada a partir de 20%, prazo de até 60 meses e resposta em até 24 horas.
          </p>
          <div className={styles.heroActions}>
            <Button href="#simulador" variant="light" size="lg" iconRight="calculator">
              Simular agora
            </Button>
            <Button href={whatsappUrl(waMessage.generic())} external variant="whatsapp" size="lg">
              Falar com um consultor
            </Button>
          </div>
        </div>
      </header>

      <section className="section" aria-labelledby="como-funciona">
        <div className="container">
          <SectionHeading
            as="h2"
            id="como-funciona"
            eyebrow="Passo a passo"
            title="Como funciona o financiamento aqui"
            align="center"
          />
          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <span className={styles.stepNumber}>{String(index + 1).padStart(2, "0")}</span>
                <Icon name={step.icon} size={24} />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section band-alt" id="simulador" aria-labelledby="simulador-titulo">
        <div className="container">
          <SectionHeading
            as="h2"
            id="simulador-titulo"
            eyebrow="Simulador"
            title="Quanto fica a parcela?"
            description="Ajuste o valor do carro, a entrada e o prazo. O cálculo usa a taxa média praticada pelos nossos parceiros."
          />
          <div className={styles.simulator}>
            <FinancingSimulator variant="page" />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="condicoes">
        <div className="container">
          <div className={styles.conditions}>
            <div>
              <SectionHeading as="h2" id="condicoes" eyebrow="Condições" title="As regras, sem letra miúda" />
              <ul className={styles.conditionList}>
                <li>
                  <strong>Entrada mínima</strong>
                  <span>20% do valor do veículo</span>
                </li>
                <li>
                  <strong>Prazos</strong>
                  <span>de 12 a 60 meses</span>
                </li>
                <li>
                  <strong>Taxa média hoje</strong>
                  <span className="tnum">
                    {(siteConfig.financing.defaultMonthlyRate * 100).toFixed(2).replace(".", ",")}% ao mês
                  </span>
                </li>
                <li>
                  <strong>Tarifas</strong>
                  <span className="tnum">
                    cadastro e registro de R$ {siteConfig.financing.fees.toLocaleString("pt-BR")}
                  </span>
                </li>
              </ul>
              <p className={styles.disclaimer}>
                <Icon name="info" size={18} />
                <span>{FINANCING_DISCLAIMER}</span>
              </p>
            </div>

            <div className={styles.lists}>
              <div className={styles.listCard}>
                <h3>
                  <Icon name="check-circle" size={20} /> O que você precisa levar
                </h3>
                <ul>
                  {REQUIREMENTS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.listCard}>
                <h3>
                  <Icon name="sparkles" size={20} /> O que pesa na aprovação
                </h3>
                <ul>
                  {INFLUENCES.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.partners}>
            <p className="eyebrow">Bancos parceiros</p>
            <ul>
              {siteConfig.financing.partners.map((partner) => (
                <li key={partner}>
                  <Badge tone="outline" size="md">
                    {partner}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Faq items={FAQ_ITEMS} className="band-alt" />

      <section className={`band-dark ${styles.cta}`}>
        <div className="container-narrow">
          <h2>Prefere que a gente simule para você?</h2>
          <p className="lead">
            Manda uma mensagem com o carro que você quer e quanto pode dar de entrada. Devolvemos as propostas dos
            bancos no mesmo dia, com o custo total de cada uma.
          </p>
          <Button href={whatsappUrl(waMessage.generic())} external variant="whatsapp" size="lg">
            Falar com um consultor agora
          </Button>
        </div>
      </section>
    </>
  );
}
