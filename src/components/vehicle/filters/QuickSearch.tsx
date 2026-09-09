"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Field, { SelectInput, TextInput } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { formatNumber, maskCurrencyInput, parseCurrencyInput } from "@/lib/format";
import { filtersToSearchParams } from "@/lib/vehicleQuery";
import type { BodyType, VehicleFacets, VehicleFilters as Filters } from "@/types";
import styles from "./QuickSearch.module.css";

/**
 * Busca rápida da home. Não guarda estado na URL: monta a querystring do
 * estoque no envio e navega para /estoque com os mesmos parâmetros dos filtros.
 */

export interface QuickSearchProps {
  facets: VehicleFacets;
  variant?: "hero" | "inline";
}

interface Shortcut {
  label: string;
  filters: Filters;
}

const SHORTCUTS: Shortcut[] = [
  { label: "SUVs até 150 mil", filters: { bodies: ["SUV"], priceMax: 150_000 } },
  { label: "Sedãs automáticos", filters: { bodies: ["Sedã"], transmissions: ["Automático"] } },
  { label: "Até 60 mil km", filters: { mileageMax: 60_000 } },
  { label: "Com financiamento", filters: { onlyFinancing: true } },
];

function estoqueHref(filters: Filters): string {
  const query = filtersToSearchParams(filters).toString();
  return query ? `/estoque?${query}` : "/estoque";
}

export default function QuickSearch({ facets, variant = "hero" }: QuickSearchProps) {
  const router = useRouter();
  const brandId = useId();
  const modelId = useId();
  const yearId = useId();
  const priceMinId = useId();
  const priceMaxId = useId();
  const bodyId = useId();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [body, setBody] = useState("");

  const modelOptions = useMemo(
    () => (brand ? facets.modelsByBrand[brand] ?? [] : []),
    [brand, facets.modelsByBrand],
  );

  const yearOptions = useMemo(() => {
    const years: string[] = [];
    for (let value = facets.year.max; value >= facets.year.min; value -= 1) {
      years.push(String(value));
    }
    return years.map((value) => ({ value, label: value }));
  }, [facets.year.max, facets.year.min]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const min = parseCurrencyInput(priceMin) || undefined;
    const max = parseCurrencyInput(priceMax) || undefined;
    const inverted = Boolean(min && max && min > max);

    const filters: Filters = {
      brands: brand ? [brand] : undefined,
      models: model ? [model] : undefined,
      bodies: body ? [body as BodyType] : undefined,
      yearMin: Number(year) || undefined,
      priceMin: inverted ? max : min,
      priceMax: inverted ? min : max,
    };

    router.push(estoqueHref(filters));
  };

  return (
    <section
      className={cn(styles.root, variant === "hero" ? styles.hero : styles.inline)}
      aria-label="Busca rápida de veículos"
    >
      {variant === "hero" ? (
        <div className={styles.head}>
          <span className="eyebrow">Busca rápida</span>
          <span className={styles.total}>
            <strong className="tnum">{formatNumber(facets.total)}</strong> veículos disponíveis hoje
          </span>
        </div>
      ) : null}

      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.grid}>
          <Field label="Marca" htmlFor={brandId} className={styles.cell}>
            <SelectInput
              placeholder="Todas as marcas"
              options={facets.brands.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              value={brand}
              onChange={(event) => {
                setBrand(event.target.value);
                setModel("");
              }}
            />
          </Field>

          <Field label="Modelo" htmlFor={modelId} className={styles.cell}>
            <SelectInput
              placeholder={brand ? "Todos os modelos" : "Escolha a marca"}
              options={modelOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              value={model}
              disabled={modelOptions.length === 0}
              onChange={(event) => setModel(event.target.value)}
            />
          </Field>

          <Field label="Ano a partir de" htmlFor={yearId} className={styles.cell}>
            <SelectInput
              placeholder="Qualquer ano"
              options={yearOptions}
              value={year}
              onChange={(event) => setYear(event.target.value)}
            />
          </Field>

          <Field label="Preço mínimo" htmlFor={priceMinId} className={styles.cell}>
            <TextInput
              inputMode="numeric"
              autoComplete="off"
              placeholder="R$ 0"
              value={priceMin}
              className="tnum"
              onChange={(event) => setPriceMin(maskCurrencyInput(event.target.value))}
            />
          </Field>

          <Field label="Preço máximo" htmlFor={priceMaxId} className={styles.cell}>
            <TextInput
              inputMode="numeric"
              autoComplete="off"
              placeholder="Sem limite"
              value={priceMax}
              className="tnum"
              onChange={(event) => setPriceMax(maskCurrencyInput(event.target.value))}
            />
          </Field>

          <Field label="Carroceria" htmlFor={bodyId} className={styles.cell}>
            <SelectInput
              placeholder="Todas"
              options={facets.bodies.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </Field>

          <div className={styles.submit}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon="search"
              fullWidth
              className={styles.submitButton}
            >
              Buscar veículos
            </Button>
          </div>
        </div>
      </form>

      <div className={styles.shortcuts}>
        <span className={styles.shortcutsLabel}>Atalhos</span>
        <ul className={styles.shortcutsList}>
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.label}>
              <Link href={estoqueHref(shortcut.filters)} className={styles.shortcut}>
                {shortcut.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
