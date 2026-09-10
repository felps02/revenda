"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Skeleton from "@/components/ui/Skeleton";
import VehicleGrid from "@/components/vehicle/VehicleGrid";
import { siteConfig } from "@/config/site";
import { useFavorites } from "@/hooks/useFavorites";
import { formatCurrency, pluralize } from "@/lib/format";
import { vehicleFullTitle } from "@/lib/slug";
import { whatsappUrl } from "@/services/whatsapp";
import type { Vehicle } from "@/types";
import styles from "./page.module.css";

interface FavoritesListProps {
  vehicles: Vehicle[];
}

export default function FavoritesList({ vehicles }: FavoritesListProps) {
  const { ids, hydrated, clear } = useFavorites();
  const [confirming, setConfirming] = useState(false);

  const saved = useMemo(
    () => vehicles.filter((vehicle) => ids.includes(vehicle.id)),
    [vehicles, ids],
  );

  const whatsappHref = useMemo(() => {
    const lines = [
      `Olá! Separei ${saved.length} ${pluralize(saved.length, "veículo", "veículos")} no site da ${siteConfig.name}:`,
      "",
      ...saved.map(
        (vehicle) =>
          `• ${vehicleFullTitle(vehicle)} — ${formatCurrency(vehicle.price)}\n${siteConfig.url}/estoque/${vehicle.slug}`,
      ),
      "",
      "Pode me ajudar a comparar?",
    ];
    return whatsappUrl(lines.join("\n"));
  }, [saved]);

  if (!hydrated) {
    return (
      <div className={styles.skeletons}>
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} height="380px" radius="var(--r-lg)" />
        ))}
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <div className={styles.empty}>
        <Icon name="heart" size={40} />
        <h2>Você ainda não salvou nenhum carro</h2>
        <p>
          Toque no coração de qualquer veículo do estoque para guardá-lo aqui e comparar depois, sem perder o link.
        </p>
        <Button href="/estoque" size="lg" iconRight="arrow-right">
          Ver o estoque
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.actions}>
        <p className={styles.count}>
          {saved.length} {pluralize(saved.length, "veículo salvo", "veículos salvos")}
        </p>
        <div className={styles.actionButtons}>
          <Button href={whatsappHref} external variant="whatsapp">
            Enviar minha lista para um consultor
          </Button>
          {confirming ? (
            <div className={styles.confirm} role="group" aria-label="Confirmar limpeza dos favoritos">
              <span>Limpar tudo?</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clear();
                  setConfirming(false);
                }}
              >
                Sim, limpar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <Button variant="ghost" icon="trash" onClick={() => setConfirming(true)}>
              Limpar favoritos
            </Button>
          )}
        </div>
      </div>

      <VehicleGrid vehicles={saved} priorityCount={3} />
    </>
  );
}
