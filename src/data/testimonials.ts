import { avatarPool } from "@/data/media";

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  avatar: string;
  rating: number;
  /** Data da avaliação em ISO. */
  date: string;
  vehicle: string;
  text: string;
  /** Origem da avaliação, exibida como selo de credibilidade. */
  source: "Google" | "Instagram" | "Indicação";
}

export const testimonials: Testimonial[] = [
  {
    id: "dep-01",
    name: "Rafael Andrade",
    city: "Curitiba, PR",
    avatar: avatarPool[0],
    rating: 5,
    date: "2026-07-18",
    vehicle: "Jeep Compass Longitude 2022",
    text:
      "Pedi o laudo cautelar antes de ir na loja e mandaram por WhatsApp em dez minutos, sem enrolação. O carro estava exatamente como no anúncio, inclusive a quilometragem. Fechei no mesmo dia e a transferência saiu em uma semana.",
    source: "Google",
  },
  {
    id: "dep-02",
    name: "Juliana Prado",
    city: "São José dos Pinhais, PR",
    avatar: avatarPool[1],
    rating: 5,
    date: "2026-06-29",
    vehicle: "Volkswagen T-Cross Highline 2023",
    text:
      "Entrei na loja achando que ia sofrer com vendedor em cima. Foi o contrário: me deixaram olhar, testar e pensar. Deram um valor justo no meu Onix e a diferença coube na parcela que eu queria.",
    source: "Google",
  },
  {
    id: "dep-03",
    name: "Marcelo Tanaka",
    city: "Curitiba, PR",
    avatar: avatarPool[2],
    rating: 5,
    date: "2026-06-11",
    vehicle: "Toyota Corolla XEi 2021",
    text:
      "Comprei de outro estado, tudo por vídeo chamada. Mostraram cada risco do para-choque, o pneu e até o histórico de revisões. Chegou de cegonha do jeito que combinamos. Confiança total.",
    source: "Indicação",
  },
  {
    id: "dep-04",
    name: "Patrícia Lemos",
    city: "Pinhais, PR",
    avatar: avatarPool[3],
    rating: 5,
    date: "2026-05-30",
    vehicle: "Hyundai Creta Platinum 2022",
    text:
      "Meu primeiro financiamento e eu estava perdida. O consultor simulou três bancos na minha frente, explicou o custo real e não empurrou seguro nenhum. Aprovaram no dia seguinte com a parcela que eu tinha pedido.",
    source: "Google",
  },
  {
    id: "dep-05",
    name: "Eduardo Nunes",
    city: "Colombo, PR",
    avatar: avatarPool[4],
    rating: 4,
    date: "2026-05-08",
    vehicle: "Fiat Toro Volcano 2021",
    text:
      "A picape veio impecável e o preço estava abaixo da tabela. Demorou um pouco mais que o combinado para sair o documento por causa do banco, mas me avisaram de cada etapa sem eu precisar cobrar.",
    source: "Google",
  },
  {
    id: "dep-06",
    name: "Camila Reis",
    city: "Curitiba, PR",
    avatar: avatarPool[5],
    rating: 5,
    date: "2026-04-22",
    vehicle: "Honda Civic Touring 2020",
    text:
      "Três meses depois da compra apareceu um ruído na suspensão. Levei na loja e resolveram na garantia, sem discussão e com carro reserva. É aí que dá para saber se a revenda é séria.",
    source: "Instagram",
  },
  {
    id: "dep-07",
    name: "Anderson Vieira",
    city: "Araucária, PR",
    avatar: avatarPool[6],
    rating: 5,
    date: "2026-04-03",
    vehicle: "Chevrolet Tracker Premier 2022",
    text:
      "Vendi meu carro para eles sem comprar nada. Avaliaram na hora, pagaram o valor combinado por transferência no mesmo dia e assumiram toda a papelada. Nunca foi tão simples.",
    source: "Google",
  },
  {
    id: "dep-08",
    name: "Fernanda Correia",
    city: "Curitiba, PR",
    avatar: avatarPool[7],
    rating: 5,
    date: "2026-03-19",
    vehicle: "BMW 320i Sport GP 2021",
    text:
      "Procurei um 320i por meses e todos tinham algum detalhe escondido. Aqui recebi o histórico completo de manutenção na concessionária e as notas fiscais. Paguei o preço de um carro bem cuidado — e era.",
    source: "Google",
  },
  {
    id: "dep-09",
    name: "Luiz Henrique Barros",
    city: "Campo Largo, PR",
    avatar: avatarPool[8],
    rating: 5,
    date: "2026-02-27",
    vehicle: "Renault Duster Iconic 2021",
    text:
      "Fui atendido por WhatsApp num domingo à noite e agendaram o test drive para segunda cedo. O carro estava lavado, com tanque cheio e a documentação separada. Detalhe faz diferença.",
    source: "Instagram",
  },
  {
    id: "dep-10",
    name: "Simone Fagundes",
    city: "Curitiba, PR",
    avatar: avatarPool[9],
    rating: 5,
    date: "2026-02-05",
    vehicle: "Volkswagen Nivus Highline 2022",
    text:
      "Comprei o carro da minha filha aqui. Levaram o veículo até minha casa para eu ver com calma e ainda emplacaram para mim. Atendimento de concessionária com preço de revenda.",
    source: "Google",
  },
];

export const averageRating =
  Math.round((testimonials.reduce((sum, item) => sum + item.rating, 0) / testimonials.length) * 10) / 10;
