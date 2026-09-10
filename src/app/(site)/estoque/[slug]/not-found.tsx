import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { waMessage, whatsappUrl } from "@/services/whatsapp";

export default function VeiculoNaoEncontrado() {
  return (
    <div className="container-narrow section" style={{ paddingTop: "calc(var(--header-h) + 4rem)", textAlign: "center" }}>
      <Icon name="car" size={48} />
      <h1 style={{ marginTop: "var(--sp-5)" }}>Esse anúncio saiu do ar</h1>
      <p className="lead" style={{ margin: "var(--sp-4) auto 0" }}>
        O veículo pode ter sido vendido ou o endereço mudou. Temos outros carros com a mesma proposta no pátio — e, se
        você disser o que procura, um consultor localiza para você.
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--sp-3)",
          justifyContent: "center",
          marginTop: "var(--sp-8)",
        }}
      >
        <Button href="/estoque" size="lg" iconRight="arrow-right">
          Ver todo o estoque
        </Button>
        <Button href={whatsappUrl(waMessage.stock())} external variant="whatsapp" size="lg">
          Procurar com um consultor
        </Button>
      </div>
    </div>
  );
}
