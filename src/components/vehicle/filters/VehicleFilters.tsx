"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Field, { Checkbox, SelectInput, TextInput } from "@/components/ui/Field";
import { HIGHLIGHT_FEATURES } from "@/data/taxonomy";
import {
  useDebouncedValue,
  useEscapeKey,
  useLockBodyScroll,
  useMediaQuery,
} from "@/hooks/useUi";
import { cn } from "@/lib/cn";
import {
  formatMileageShort,
  maskCurrencyInput,
  parseCurrencyInput,
  pluralize,
} from "@/lib/format";
import {
  countActiveFilters,
  filtersFromSearchParams,
  filtersToSearchParams,
  sortFromSearchParams,
} from "@/lib/vehicleQuery";
import type {
  BodyType,
  FacetOption,
  FuelType,
  TransmissionType,
  VehicleCategory,
  VehicleFacets,
  VehicleFilters as Filters,
} from "@/types";
import styles from "./VehicleFilters.module.css";

/**
 * Filtros do estoque.
 *
 * O estado mora inteiro na URL: nada aqui guarda cópia de filtro que se perca
 * ao voltar no navegador. No desktop cada clique já reescreve a querystring;
 * no celular o drawer mantém um rascunho e só aplica no "Ver N veículos".
 */

export interface VehicleFiltersProps {
  facets: VehicleFacets;
  resultCount: number;
}

type FiltersUpdater = (prev: Filters) => Filters;

interface PriceShortcut {
  label: string;
  min?: number;
  max?: number;
}

const PRICE_SHORTCUTS: PriceShortcut[] = [
  { label: "Até 80 mil", max: 80_000 },
  { label: "80 a 150 mil", min: 80_000, max: 150_000 },
  { label: "150 a 250 mil", min: 150_000, max: 250_000 },
  { label: "Acima de 250 mil", min: 250_000 },
];

const MILEAGE_STEPS = [20_000, 40_000, 60_000, 80_000, 100_000];

/** Liga/desliga um valor da lista; lista vazia vira undefined (some da URL). */
function toggleValue<T extends string>(list: T[] | undefined, value: T): T[] | undefined {
  const current = list ?? [];
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
  return next.length > 0 ? next : undefined;
}

/* ------------------------------------------------------------------ blocos */

interface BlockProps {
  title: string;
  count?: number;
  hint?: string;
  disabled?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}

function Block({
  title,
  count = 0,
  hint,
  disabled = false,
  defaultOpen = false,
  children,
}: BlockProps) {
  const panelId = useId();
  const [open, setOpen] = useState(defaultOpen);
  const expanded = open && !disabled;

  return (
    <section className={cn(styles.block, disabled && styles.blockOff)}>
      <h3 className={styles.blockHeading}>
        <button
          type="button"
          className={styles.blockToggle}
          aria-expanded={expanded}
          aria-controls={panelId}
          disabled={disabled}
          onClick={() => setOpen((value) => !value)}
        >
          <span className={styles.blockTitle}>{title}</span>
          {count > 0 ? <span className={cn(styles.blockCount, "tnum")}>{count}</span> : null}
          <Icon
            name="chevron-down"
            size={18}
            className={cn(styles.blockChevron, expanded && styles.blockChevronOpen)}
          />
        </button>
      </h3>
      {hint ? <p className={styles.blockHint}>{hint}</p> : null}
      <div id={panelId} className={styles.blockBody} hidden={!expanded}>
        {children}
      </div>
    </section>
  );
}

interface SearchFieldProps {
  value: string;
  onCommit: (value: string) => void;
}

function SearchField({ value, onCommit }: SearchFieldProps) {
  const inputId = useId();
  const [text, setText] = useState(value);
  const debounced = useDebouncedValue(text, 400);
  // Último valor que já está na URL - evita reescrever a rota à toa.
  const committed = useRef(value);

  useEffect(() => {
    if (value === committed.current) return;
    committed.current = value;
    setText(value);
  }, [value]);

  useEffect(() => {
    if (debounced === committed.current) return;
    committed.current = debounced;
    onCommit(debounced);
  }, [debounced, onCommit]);

  return (
    <div className={styles.search}>
      <label htmlFor={inputId} className="sr-only">
        Buscar por marca, modelo, versão ou opcional
      </label>
      <Icon name="search" size={18} className={styles.searchIcon} />
      <TextInput
        id={inputId}
        type="search"
        value={text}
        autoComplete="off"
        placeholder="Marca, modelo ou versão"
        className={styles.searchInput}
        onChange={(event) => setText(event.target.value)}
      />
      {text ? (
        <button
          type="button"
          className={styles.searchClear}
          aria-label="Limpar a busca por texto"
          onClick={() => setText("")}
        >
          <Icon name="close" size={16} />
        </button>
      ) : null}
    </div>
  );
}

interface ChipGroupProps {
  options: FacetOption[];
  selected: string[];
  onToggle: (value: string) => void;
}

function ChipGroup({ options, selected, onToggle }: ChipGroupProps) {
  return (
    <div className={styles.chips}>
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            className={cn(styles.chip, active && styles.chipOn)}
            aria-pressed={active}
            onClick={() => onToggle(option.value)}
          >
            <span>{option.label}</span>
            <span className={cn(styles.chipCount, "tnum")}>{option.count}</span>
          </button>
        );
      })}
    </div>
  );
}

interface OptionListProps {
  name: string;
  options: FacetOption[];
  selected: string[];
  onToggle: (value: string) => void;
}

function OptionList({ name, options, selected, onToggle }: OptionListProps) {
  return (
    <div className={cn(styles.options, options.length >= 8 && styles.optionsScroll)}>
      {options.map((option) => (
        <Checkbox
          key={option.value}
          className={styles.option}
          name={name}
          value={option.value}
          checked={selected.includes(option.value)}
          onChange={() => onToggle(option.value)}
          label={
            <span className={styles.optionRow}>
              <span className={styles.optionLabel}>{option.label}</span>
              <span className={cn(styles.optionCount, "tnum")}>{option.count}</span>
            </span>
          }
        />
      ))}
    </div>
  );
}

interface PriceFieldsProps {
  min?: number;
  max?: number;
  onChange: (range: { min?: number; max?: number }) => void;
}

function PriceFields({ min, max, onChange }: PriceFieldsProps) {
  const minId = useId();
  const maxId = useId();
  const [minText, setMinText] = useState(() => (min ? maskCurrencyInput(String(min)) : ""));
  const [maxText, setMaxText] = useState(() => (max ? maskCurrencyInput(String(max)) : ""));

  useEffect(() => {
    setMinText(min ? maskCurrencyInput(String(min)) : "");
  }, [min]);

  useEffect(() => {
    setMaxText(max ? maskCurrencyInput(String(max)) : "");
  }, [max]);

  const commit = () => {
    const nextMin = parseCurrencyInput(minText) || undefined;
    const nextMax = parseCurrencyInput(maxText) || undefined;
    if (nextMin === min && nextMax === max) return;
    // Cliente digitou invertido: arruma em vez de devolver lista vazia.
    if (nextMin && nextMax && nextMin > nextMax) {
      onChange({ min: nextMax, max: nextMin });
      return;
    }
    onChange({ min: nextMin, max: nextMax });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    commit();
  };

  return (
    <div className={styles.pair}>
      <Field label="Mínimo" htmlFor={minId}>
        <TextInput
          inputMode="numeric"
          autoComplete="off"
          placeholder="R$ 0"
          value={minText}
          className={cn(styles.money, "tnum")}
          onChange={(event) => setMinText(maskCurrencyInput(event.target.value))}
          onBlur={commit}
          onKeyDown={onKeyDown}
        />
      </Field>
      <Field label="Máximo" htmlFor={maxId}>
        <TextInput
          inputMode="numeric"
          autoComplete="off"
          placeholder="Sem limite"
          value={maxText}
          className={cn(styles.money, "tnum")}
          onChange={(event) => setMaxText(maskCurrencyInput(event.target.value))}
          onBlur={commit}
          onKeyDown={onKeyDown}
        />
      </Field>
    </div>
  );
}

/* ------------------------------------------------------------------ painel */

interface FilterPanelProps {
  facets: VehicleFacets;
  filters: Filters;
  onUpdate: (updater: FiltersUpdater) => void;
}

function FilterPanel({ facets, filters, onUpdate }: FilterPanelProps) {
  const yearMinId = useId();
  const yearMaxId = useId();
  const mileageId = useId();

  const brands = filters.brands ?? [];
  const models = filters.models ?? [];
  const features = filters.features ?? [];

  const commitQuery = useCallback(
    (value: string) => {
      const term = value.trim();
      onUpdate((prev) => ({ ...prev, q: term ? term : undefined }));
    },
    [onUpdate],
  );

  const toggleBrand = (value: string) =>
    onUpdate((prev) => {
      const nextBrands = toggleValue(prev.brands, value);
      // Tirou a marca: os modelos daquela marca saem junto.
      const allowed = new Set(
        (nextBrands ?? []).flatMap((brand) =>
          (facets.modelsByBrand[brand] ?? []).map((option) => option.value),
        ),
      );
      const nextModels = (prev.models ?? []).filter((model) => allowed.has(model));
      return {
        ...prev,
        brands: nextBrands,
        models: nextModels.length > 0 ? nextModels : undefined,
      };
    });

  const modelGroups = brands
    .map((brand) => ({ brand, options: facets.modelsByBrand[brand] ?? [] }))
    .filter((group) => group.options.length > 0);

  const yearOptions = useMemo(() => {
    const values = new Set<number>();
    for (let year = facets.year.min; year <= facets.year.max; year += 1) values.add(year);
    if (filters.yearMin) values.add(filters.yearMin);
    if (filters.yearMax) values.add(filters.yearMax);
    return [...values]
      .sort((a, b) => b - a)
      .map((year) => ({ value: String(year), label: String(year) }));
  }, [facets.year.min, facets.year.max, filters.yearMin, filters.yearMax]);

  const mileageOptions = useMemo(() => {
    const values = new Set<number>(MILEAGE_STEPS);
    if (filters.mileageMax) values.add(filters.mileageMax);
    return [...values]
      .sort((a, b) => a - b)
      .map((km) => ({ value: String(km), label: `Até ${formatMileageShort(km)}` }));
  }, [filters.mileageMax]);

  const priceCount =
    (typeof filters.priceMin === "number" ? 1 : 0) +
    (typeof filters.priceMax === "number" ? 1 : 0);
  const yearCount =
    (typeof filters.yearMin === "number" ? 1 : 0) + (typeof filters.yearMax === "number" ? 1 : 0);

  return (
    <div className={styles.panel}>
      <Block title="Busca" count={filters.q ? 1 : 0} defaultOpen>
        <SearchField value={filters.q ?? ""} onCommit={commitQuery} />
      </Block>

      <Block title="Marca" count={brands.length} defaultOpen>
        <OptionList name="marca" options={facets.brands} selected={brands} onToggle={toggleBrand} />
      </Block>

      <Block
        title="Modelo"
        count={models.length}
        disabled={modelGroups.length === 0}
        hint={modelGroups.length === 0 ? "Escolha uma marca para ver os modelos." : undefined}
      >
        {modelGroups.map((group) => (
          <div key={group.brand} className={styles.group}>
            {modelGroups.length > 1 ? (
              <span className={styles.groupLabel}>{group.brand}</span>
            ) : null}
            <OptionList
              name="modelo"
              options={group.options}
              selected={models}
              onToggle={(value) =>
                onUpdate((prev) => ({ ...prev, models: toggleValue(prev.models, value) }))
              }
            />
          </div>
        ))}
      </Block>

      <Block title="Categoria" count={filters.categories?.length ?? 0}>
        <ChipGroup
          options={facets.categories}
          selected={filters.categories ?? []}
          onToggle={(value) =>
            onUpdate((prev) => ({
              ...prev,
              categories: toggleValue(prev.categories, value as VehicleCategory),
            }))
          }
        />
      </Block>

      <Block title="Carroceria" count={filters.bodies?.length ?? 0}>
        <ChipGroup
          options={facets.bodies}
          selected={filters.bodies ?? []}
          onToggle={(value) =>
            onUpdate((prev) => ({ ...prev, bodies: toggleValue(prev.bodies, value as BodyType) }))
          }
        />
      </Block>

      <Block title="Faixa de preço" count={priceCount} defaultOpen>
        <PriceFields
          min={filters.priceMin}
          max={filters.priceMax}
          onChange={(range) =>
            onUpdate((prev) => ({ ...prev, priceMin: range.min, priceMax: range.max }))
          }
        />
        <div className={styles.chips}>
          {PRICE_SHORTCUTS.map((shortcut) => {
            const active = shortcut.min === filters.priceMin && shortcut.max === filters.priceMax;
            return (
              <button
                key={shortcut.label}
                type="button"
                className={cn(styles.chip, active && styles.chipOn)}
                aria-pressed={active}
                onClick={() =>
                  onUpdate((prev) =>
                    active
                      ? { ...prev, priceMin: undefined, priceMax: undefined }
                      : { ...prev, priceMin: shortcut.min, priceMax: shortcut.max },
                  )
                }
              >
                <span>{shortcut.label}</span>
              </button>
            );
          })}
        </div>
      </Block>

      <Block title="Ano do modelo" count={yearCount}>
        <div className={styles.pair}>
          <Field label="De" htmlFor={yearMinId}>
            <SelectInput
              placeholder="Qualquer"
              options={yearOptions}
              value={filters.yearMin ? String(filters.yearMin) : ""}
              onChange={(event) =>
                onUpdate((prev) => ({
                  ...prev,
                  yearMin: Number(event.target.value) || undefined,
                }))
              }
            />
          </Field>
          <Field label="Até" htmlFor={yearMaxId}>
            <SelectInput
              placeholder="Qualquer"
              options={yearOptions}
              value={filters.yearMax ? String(filters.yearMax) : ""}
              onChange={(event) =>
                onUpdate((prev) => ({
                  ...prev,
                  yearMax: Number(event.target.value) || undefined,
                }))
              }
            />
          </Field>
        </div>
      </Block>

      <Block title="Quilometragem" count={filters.mileageMax ? 1 : 0}>
        <Field label="Rodados no máximo" htmlFor={mileageId}>
          <SelectInput
            placeholder="Qualquer quilometragem"
            options={mileageOptions}
            value={filters.mileageMax ? String(filters.mileageMax) : ""}
            onChange={(event) =>
              onUpdate((prev) => ({
                ...prev,
                mileageMax: Number(event.target.value) || undefined,
              }))
            }
          />
        </Field>
      </Block>

      <Block title="Câmbio" count={filters.transmissions?.length ?? 0}>
        <ChipGroup
          options={facets.transmissions}
          selected={filters.transmissions ?? []}
          onToggle={(value) =>
            onUpdate((prev) => ({
              ...prev,
              transmissions: toggleValue(prev.transmissions, value as TransmissionType),
            }))
          }
        />
      </Block>

      <Block title="Combustível" count={filters.fuels?.length ?? 0}>
        <ChipGroup
          options={facets.fuels}
          selected={filters.fuels ?? []}
          onToggle={(value) =>
            onUpdate((prev) => ({ ...prev, fuels: toggleValue(prev.fuels, value as FuelType) }))
          }
        />
      </Block>

      <Block title="Opcionais" count={features.length}>
        <div className={styles.options}>
          {HIGHLIGHT_FEATURES.map((feature) => {
            const count = facets.features.find((option) => option.value === feature)?.count ?? 0;
            return (
              <Checkbox
                key={feature}
                className={styles.option}
                name="opcional"
                value={feature}
                checked={features.includes(feature)}
                onChange={() =>
                  onUpdate((prev) => ({ ...prev, features: toggleValue(prev.features, feature) }))
                }
                label={
                  <span className={styles.optionRow}>
                    <span className={styles.optionLabel}>{feature}</span>
                    <span className={cn(styles.optionCount, "tnum")}>{count}</span>
                  </span>
                }
              />
            );
          })}
        </div>
      </Block>

      <div className={styles.switch}>
        <Checkbox
          className={styles.option}
          name="financiamento"
          checked={Boolean(filters.onlyFinancing)}
          onChange={(event) =>
            onUpdate((prev) => ({
              ...prev,
              onlyFinancing: event.target.checked ? true : undefined,
            }))
          }
          label="Somente com financiamento"
          hint="Carros aprovados pelos bancos parceiros."
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- wrapper */

export default function VehicleFilters({ facets, resultCount }: VehicleFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const filters = useMemo(
    () => filtersFromSearchParams(new URLSearchParams(queryString)),
    [queryString],
  );
  const sort = useMemo(
    () => sortFromSearchParams(new URLSearchParams(queryString)),
    [queryString],
  );
  const activeCount = countActiveFilters(filters);

  const drawerId = useId();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(filters);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  /** Único ponto de escrita: filtros viram querystring e a rota é reescrita. */
  const push = useCallback(
    (next: Filters) => {
      const params = filtersToSearchParams(next, sort, 1);
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, sort],
  );

  // Desktop: aplica na hora, sempre lendo o estado atual da própria URL.
  const updateLive = useCallback(
    (updater: FiltersUpdater) => {
      push(updater(filtersFromSearchParams(new URLSearchParams(queryString))));
    },
    [push, queryString],
  );

  // Celular: rascunho local, aplicado só no botão do rodapé.
  const updateDraft = useCallback((updater: FiltersUpdater) => setDraft(updater), []);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useLockBodyScroll(open);
  useEscapeKey(close, open);

  // Chegou no desktop com o drawer aberto: fecha e devolve o scroll.
  useEffect(() => {
    if (isDesktop) setOpen(false);
  }, [isDesktop]);

  // Enquanto aberto, o foco circula dentro do drawer.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const node = drawerRef.current;
    if (!node) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusables = node.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])",
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    node.addEventListener("keydown", onKeyDown);
    return () => node.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const openDrawer = () => {
    setDraft(filters);
    setOpen(true);
  };

  const applyDraft = () => {
    push(draft);
    close();
  };

  const draftCount = countActiveFilters(draft);

  return (
    <>
      <aside className={styles.aside} aria-label="Filtros do estoque">
        <div className={styles.asideHead}>
          <h2 className={styles.asideTitle}>Filtrar estoque</h2>
          {activeCount > 0 ? (
            <button type="button" className={styles.clear} onClick={() => push({})}>
              Limpar
              <Icon name="close" size={14} />
            </button>
          ) : null}
        </div>
        <FilterPanel facets={facets} filters={filters} onUpdate={updateLive} />
      </aside>

      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={drawerId}
        aria-haspopup="dialog"
        onClick={openDrawer}
      >
        <Icon name="sliders" size={18} />
        <span className={styles.triggerLabel}>Filtrar</span>
        {activeCount > 0 ? (
          <span className={cn(styles.triggerCount, "tnum")}>{activeCount}</span>
        ) : null}
      </button>

      <div
        className={cn(styles.backdrop, open && styles.backdropOpen)}
        onClick={close}
        aria-hidden="true"
      />

      <div
        id={drawerId}
        ref={drawerRef}
        className={cn(styles.drawer, open && styles.drawerOpen)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.drawerTop}>
          <h2 id={titleId} className={styles.drawerTitle}>
            Filtros
          </h2>
          <button
            ref={closeRef}
            type="button"
            className={styles.drawerClose}
            aria-label="Fechar filtros"
            onClick={close}
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          <FilterPanel facets={facets} filters={draft} onUpdate={updateDraft} />
        </div>

        <div className={styles.drawerFoot}>
          <Button variant="outline" disabled={draftCount === 0} onClick={() => setDraft({})}>
            Limpar
          </Button>
          <Button variant="primary" fullWidth onClick={applyDraft}>
            {`Ver ${resultCount} ${pluralize(resultCount, "veículo", "veículos")}`}
          </Button>
        </div>
      </div>
    </>
  );
}
