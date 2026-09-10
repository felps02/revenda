"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import { formatCurrency, formatMileageShort, formatYearPair } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/vehicleForm";
import type { Vehicle, VehicleStatus } from "@/types";
import styles from "./painel.module.css";

interface VehicleTableProps {
  vehicles: Vehicle[];
}

const FILTERS: { value: VehicleStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "disponivel", label: "Disponíveis" },
  { value: "reservado", label: "Reservados" },
  { value: "vendido", label: "Vendidos" },
];

export default function VehicleTable({ vehicles }: VehicleTableProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<VehicleStatus | "todos">("todos");
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      if (status !== "todos" && vehicle.status !== status) return false;
      if (!term) return true;
      return `${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.id}`
        .toLowerCase()
        .includes(term);
    });
  }, [vehicles, search, status]);

  async function patch(id: string, body: { status?: VehicleStatus; featured?: boolean }) {
    setBusy(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/vehicles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(data?.message ?? "Não foi possível atualizar.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Sem conexão com o servidor.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    setBusy(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/vehicles/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(data?.message ?? "Não foi possível excluir.");
      } else {
        setConfirming(null);
        router.refresh();
      }
    } catch {
      setError("Sem conexão com o servidor.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section aria-label="Veículos cadastrados">
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Icon name="search" size={18} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por marca, modelo ou código"
            aria-label="Buscar veículo"
          />
        </div>

        <div className={styles.statusFilter} role="group" aria-label="Filtrar por status">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={filter.value === status ? styles.statusActive : undefined}
              aria-pressed={filter.value === status}
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          <Icon name="alert" size={18} />
          <span>{error}</span>
        </p>
      ) : null}

      <ul className={styles.list}>
        {visible.map((vehicle) => (
          <li key={vehicle.id} className={busy === vehicle.id ? styles.rowBusy : undefined}>
            <div className={styles.thumb}>
              {vehicle.images[0] ? (
                <Image
                  src={vehicle.images[0].url}
                  alt={vehicle.images[0].alt}
                  fill
                  sizes="96px"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <Icon name="camera" size={20} />
              )}
            </div>

            <div className={styles.info}>
              <Link href={`/admin/veiculos/${vehicle.id}`} className={styles.name}>
                {vehicle.brand} {vehicle.model}
              </Link>
              <span className={styles.version}>{vehicle.version}</span>
              <span className={styles.meta}>
                <span className="tnum">{formatYearPair(vehicle.manufactureYear, vehicle.year)}</span> ·{" "}
                <span className="tnum">{formatMileageShort(vehicle.mileage)}</span> · código{" "}
                {vehicle.id.toUpperCase()}
              </span>
            </div>

            <div className={styles.price}>
              <strong className="tnum">{formatCurrency(vehicle.price)}</strong>
              <Badge
                tone={
                  vehicle.status === "disponivel"
                    ? "success"
                    : vehicle.status === "reservado"
                      ? "alert"
                      : "dark"
                }
                size="sm"
              >
                {STATUS_LABELS[vehicle.status]}
              </Badge>
            </div>

            <div className={styles.actions}>
              <label className={styles.statusSelect}>
                <span className="sr-only">Status de {vehicle.model}</span>
                <select
                  value={vehicle.status}
                  disabled={busy === vehicle.id}
                  onChange={(event) => patch(vehicle.id, { status: event.target.value as VehicleStatus })}
                >
                  <option value="disponivel">Disponível</option>
                  <option value="reservado">Reservado</option>
                  <option value="vendido">Vendido</option>
                </select>
              </label>

              <button
                type="button"
                className={vehicle.featured ? styles.starOn : styles.star}
                aria-pressed={vehicle.featured}
                aria-label={vehicle.featured ? "Remover dos destaques" : "Colocar em destaque"}
                disabled={busy === vehicle.id}
                onClick={() => patch(vehicle.id, { featured: !vehicle.featured })}
              >
                <Icon name={vehicle.featured ? "star-filled" : "star"} size={18} />
              </button>

              <Link
                href={`/admin/veiculos/${vehicle.id}`}
                className={styles.iconLink}
                aria-label={`Editar ${vehicle.brand} ${vehicle.model}`}
              >
                <Icon name="sliders" size={18} />
              </Link>

              <Link
                href={`/estoque/${vehicle.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.iconLink}
                aria-label={`Ver ${vehicle.brand} ${vehicle.model} no site`}
              >
                <Icon name="arrow-up-right" size={18} />
              </Link>

              {confirming === vehicle.id ? (
                <span className={styles.confirm}>
                  <button type="button" onClick={() => remove(vehicle.id)} disabled={busy === vehicle.id}>
                    Excluir
                  </button>
                  <button type="button" onClick={() => setConfirming(null)}>
                    Cancelar
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  className={styles.iconLink}
                  aria-label={`Excluir ${vehicle.brand} ${vehicle.model}`}
                  onClick={() => setConfirming(vehicle.id)}
                >
                  <Icon name="trash" size={18} />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {visible.length === 0 ? (
        <p className={styles.noResults}>Nenhum veículo encontrado com esse filtro.</p>
      ) : null}
    </section>
  );
}
