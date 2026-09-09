import Image from "next/image";
import { cn } from "@/lib/cn";
import { siteMedia } from "@/data/media";
import Icon, { type IconName } from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import styles from "./AboutStory.module.css";

/**
 * Historia da revenda: texto a esquerda, foto do patio com moldura bronze
 * deslocada atras. Fecha com missao/visao/valores e o bloco de procedencia
 * (ancora #procedencia, usada pelo rodape).
 */

interface Pillar {
  icon: IconName;
  label: string;
  title: string;
  text: string;
}

const PILLARS: Pillar[] = [
  {
    icon: "shield",
    label: "Missão",
    title: "Seminovo com segurança de zero",
    text: "Entregar carro usado com laudo cautelar em mãos, histórico de manutenção conferido e garantia por escrito — para ninguém assinar torcendo para dar certo.",
  },
  {
    icon: "users",
    label: "Visão",
    title: "O segundo carro na mesma loja",
    text: "Ser a revenda de Curitiba em que o cliente volta para trocar de carro e indica para o cunhado. Hoje quase metade das vendas do mês nasce de indicação.",
  },
  {
    icon: "wallet",
    label: "Valores",
    title: "Preço explicado, conta aberta",
    text: "Preço formado na tabela FIPE com o histórico na mesa, nenhuma taxa que aparece só na assinatura e pós-venda que atende no dia 89 da garantia como no dia 1.",
  },
];

export interface AboutStoryProps {
  className?: string;
}

export function AboutStory({ className }: AboutStoryProps) {
  const photo = siteMedia.about.story;

  return (
    <section className={cn("section", styles.section, className)} aria-labelledby="sobre-historia">
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.text}>
            <SectionHeading
              id="sobre-historia"
              eyebrow="A revenda"
              title={
                <>
                  Desde 2009 no Batel, com o mesmo <span className={styles.accent}>sobrenome na porta</span>
                </>
              }
              description="A Marchetti Motors nasceu de uma família que trabalha com carro há três gerações — e continua atendendo cliente por cliente, com o dono dentro da loja."
            />

            <div className={styles.body}>
              <p>
                Começamos com 12 vagas em um pátio alugado na Av. do Batel, um compressor emprestado
                e uma regra que segue valendo: só entra no estoque o carro que a gente colocaria na
                garagem de casa. O avô vendia caminhão no interior do Paraná, o pai abriu a primeira
                oficina em Curitiba nos anos 1980 e os filhos cresceram entre elevador e ficha de
                revisão.
              </p>
              <p>
                Hoje são 60 vagas, showroom coberto para você olhar o carro no seco em pleno julho
                curitibano, oficina própria de revisão nos fundos e um time de 18 pessoas — sete
                delas cuidando só de preparação e documentação, que é onde a compra costuma travar.
                Ninguém aqui recebe comissão por empurrar seguro ou financiamento.
              </p>
            </div>

            <div className={styles.procedencia} id="procedencia">
              <span className={styles.procedenciaLabel}>Como escolhemos cada carro</span>
              <h3 className={styles.procedenciaTitle}>Procedência não é discurso, é documento</h3>
              <p className={styles.procedenciaText}>
                Todo veículo que entra passa por laudo cautelar em empresa independente, consulta de
                leilão, sinistro e débitos, e uma checagem de 120 itens na nossa oficina. O laudo
                fica no anúncio e vai para o seu WhatsApp antes de você sair de casa. Se o carro teve
                retoque de pintura ou peça substituída, está escrito na ficha e o preço já considera
                isso. Reprovamos cerca de 3 a cada 10 carros avaliados: o que não passa não vira
                anúncio.
              </p>
            </div>
          </div>

          <figure className={styles.figure}>
            <span className={styles.frame} aria-hidden="true" />
            <div className={styles.photo}>
              <Image
                src={photo.url}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 46vw, (min-width: 640px) 88vw, 100vw"
                className={styles.image}
              />
            </div>
            <figcaption className={styles.caption}>
              <span className={styles.captionValue}>Av. do Batel, 1868</span>
              <span className={styles.captionText}>
                Pátio, showroom coberto e oficina de revisão no mesmo endereço desde 2009
              </span>
            </figcaption>
          </figure>
        </div>

        <ul className={styles.pillars}>
          {PILLARS.map((pillar) => (
            <li key={pillar.label} className={styles.pillar}>
              <span className={styles.pillarIcon}>
                <Icon name={pillar.icon} size={20} />
              </span>
              <span className={styles.pillarLabel}>{pillar.label}</span>
              <h3 className={styles.pillarTitle}>{pillar.title}</h3>
              <p className={styles.pillarText}>{pillar.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default AboutStory;
