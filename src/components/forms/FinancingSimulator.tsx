"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Field, { TextInput } from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import {
  formatCurrency,
  formatCurrencyCents,
  formatNumber,
  maskCurrencyInput,
  parseCurrencyInput,
} from "@/lib/format";
import { vehicleFullTitle } from "@/lib/slug";
import {
  FINANCING,
  FINANCING_DISCLAIMER,
  minDownPayment,
  simulateFinancing,
  type SimulationResult,
} from "@/services/financing";
import { submitLead } from "@/services/leadService";
import { vehicleUrl, waMessage, whatsappUrl } from "@/services/whatsapp";
import type { FinancingLead, Vehicle } from "@/types";
import { WhatsAppHint, focusFirstError } from "./FormStatus";
import styles from "./FinancingSimulator.module.css";

/**
 * Simulador de parcelas.
 *
 * Toda conta sai de `@/services/financing`, entao a parcela mostrada aqui e a
 * mesma dos cards do estoque. O lead so e registrado quando o cliente pede
 * para falar com um consultor - simular nao vira contato.
 */

export interface FinancingSimulatorProps {
  vehicle?: Vehicle | null;
  variant?: "page" | "compact";
}

interface FieldErrorsState {
  price?: string;
  down?: string;
}

/** 0.0149 -> "1,49%" */
function percent(rate: number): string {
  return formatNumber(Number((rate * 100).toFixed(2))) + "%";
}

export function FinancingSimulator({ vehicle, variant = "page" }: FinancingSimulatorProps) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const downTouched = useRef(false);

  const [price, setPrice] = useState(() =>
    vehicle ? maskCurrencyInput(String(vehicle.price)) : "",
  );
  const [down, setDown] = useState(() =>
    vehicle ? maskCurrencyInput(String(minDownPayment(vehicle.price))) : "",
  );
  const [installments, setInstallments] = useState<number>(FINANCING.defaultInstallments);
  const [errors, setErrors] = useState<FieldErrorsState>({});
  const [result, setResult] = useState<SimulationResult | null>(() => {
    if (!vehicle) return null;
    const initial = simulateFinancing({
      price: vehicle.price,
      downPayment: minDownPayment(vehicle.price),
      installments: FINANCING.defaultInstallments,
    });
    return initial.valid ? initial : null;
  });

  const priceValue = parseCurrencyInput(price);
  const downValue = parseCurrencyInput(down);
  const minimum = minDownPayment(priceValue);
  const maxDown = priceValue > 0 ? Math.max(minimum, Math.round(priceValue * 0.9)) : 0;
  const rangeValue = Math.min(Math.max(downValue, minimum), Math.max(maxDown, minimum));
  const hasPrice = priceValue > 0;

  function handlePriceChange(raw: string): void {
    const masked = maskCurrencyInput(raw);
    setPrice(masked);
    setErrors({});
    // Enquanto o cliente nao mexer na entrada, ela acompanha o minimo do carro.
    if (!downTouched.current) {
      setDown(maskCurrencyInput(String(minDownPayment(parseCurrencyInput(masked)))));
    }
  }

  function handleDownChange(raw: string): void {
    downTouched.current = true;
    setDown(maskCurrencyInput(raw));
    setErrors({});
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const simulation = simulateFinancing({
      price: priceValue,
      downPayment: downValue,
      installments,
    });

    if (!simulation.valid) {
      const message = simulation.error ?? "Revise os valores para simular";
      const field = priceValue <= 0 ? "price" : "down";
      setErrors(field === "price" ? { price: message } : { down: message });
      setResult(null);
      focusFirstError(formRef.current, [field]);
      return;
    }

    setErrors({});
    setResult(simulation);
  }

  const waText = result
    ? waMessage.financing({
        vehicle,
        price: priceValue,
        downPayment: result.downPayment,
        installments: result.installments,
        installmentValue: result.installmentValue,
      })
    : waMessage.generic();

  /** Consultor solicitado: aqui sim o contato vira lead. */
  function registerLead(): void {
    if (!result) return;
    const lead: FinancingLead = {
      type: "financiamento",
      name: "Simulação pelo site",
      phone: "",
      message:
        "Simulou " +
        result.installments +
        "x de " +
        formatCurrencyCents(result.installmentValue) +
        " com entrada de " +
        formatCurrency(result.downPayment) +
        ".",
      source: vehicle ? "simulador-do-veiculo" : "simulador-financiamento",
      vehiclePrice: priceValue,
      downPayment: result.downPayment,
      installments: result.installments,
      estimatedInstallment: Math.round(result.installmentValue),
      vehicleId: vehicle?.id,
      vehicleTitle: vehicle ? vehicleFullTitle(vehicle) : undefined,
      vehicleUrl: vehicle ? vehicleUrl(vehicle) : undefined,
    };
    void submitLead(lead);
  }

  return (
    <div className={cn(styles.root, variant === "page" ? styles.page : styles.compact)}>
      <form ref={formRef} className={styles.fields} onSubmit={handleSubmit} noValidate>
        <Field
          label="Valor do veículo"
          htmlFor={uid + "-valor"}
          required
          error={errors.price}
          hint={vehicle ? vehicleFullTitle(vehicle) : "Informe o preço do carro que você quer."}
        >
          <TextInput
            name="price"
            value={price}
            onChange={(event) => handlePriceChange(event.target.value)}
            readOnly={Boolean(vehicle)}
            inputMode="numeric"
            enterKeyHint="next"
            placeholder="R$ 120.000"
            className={vehicle ? styles.locked : undefined}
          />
        </Field>

        <Field label="Entrada" htmlFor={uid + "-entrada"} required error={errors.down}>
          <TextInput
            name="down"
            value={down}
            onChange={(event) => handleDownChange(event.target.value)}
            inputMode="numeric"
            enterKeyHint="done"
            placeholder="R$ 24.000"
          />
        </Field>

        <div className={styles.rangeBlock}>
          <input
            type="range"
            className={styles.range}
            min={hasPrice ? minimum : 0}
            max={hasPrice ? maxDown : 100}
            step={500}
            value={hasPrice ? rangeValue : 0}
            disabled={!hasPrice}
            onChange={(event) => handleDownChange(event.target.value)}
            aria-label="Ajustar valor da entrada"
            aria-valuetext={formatCurrency(hasPrice ? rangeValue : 0)}
          />
          <div className={styles.rangeLegend}>
            <span className={styles.rangeMin}>
              <Icon name="info" size={13} className={styles.rangeIcon} />
              Entrada mínima <strong className="tnum">{formatCurrency(minimum)}</strong> (
              {Math.round(FINANCING.minDownPaymentPercent * 100)}%)
            </span>
            <span className={cn(styles.rangeMax, "tnum")}>{formatCurrency(maxDown)}</span>
          </div>
        </div>

        <fieldset className={styles.chipsField}>
          <legend className={styles.legend}>Parcelas</legend>
          <div className={styles.chips}>
            {FINANCING.installmentOptions.map((option) => (
              <label key={option} className={styles.chip}>
                <input
                  type="radio"
                  name={uid + "-parcelas"}
                  value={option}
                  checked={installments === option}
                  onChange={() => setInstallments(option)}
                  className={styles.chipInput}
                />
                <span className={styles.chipBox}>
                  <span className="tnum">{option}</span>x
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.actions}>
          <Button type="submit" size="lg" icon="calculator" fullWidth>
            Simular
          </Button>
          <WhatsAppHint message={waText} />
        </div>
      </form>

      <div className={styles.resultColumn}>
        <div className={styles.result} aria-live="polite">
          {result ? (
            <div
              key={result.installments + "-" + Math.round(result.installmentValue)}
              className={styles.resultInner}
            >
              <span className={styles.resultLabel}>Parcela estimada</span>
              <p className={styles.installment}>
                <span className={cn(styles.installmentCount, "tnum")}>{result.installments}x</span>
                <strong className={cn(styles.installmentValue, "tnum")}>
                  {formatCurrencyCents(result.installmentValue)}
                </strong>
              </p>

              <dl className={styles.rows}>
                <div className={styles.row}>
                  <dt className={styles.rowLabel}>Valor financiado</dt>
                  <dd className={cn(styles.rowValue, "tnum")}>
                    {formatCurrency(Math.round(result.financedAmount))}
                  </dd>
                </div>
                <div className={styles.row}>
                  <dt className={styles.rowLabel}>Total a prazo</dt>
                  <dd className={cn(styles.rowValue, "tnum")}>
                    {formatCurrency(Math.round(result.totalPaid))}
                  </dd>
                </div>
                <div className={styles.row}>
                  <dt className={styles.rowLabel}>Taxa mensal</dt>
                  <dd className={cn(styles.rowValue, "tnum")}>{percent(result.monthlyRate)} a.m.</dd>
                </div>
                <div className={styles.row}>
                  <dt className={styles.rowLabel}>Taxa anual</dt>
                  <dd className={cn(styles.rowValue, "tnum")}>{percent(result.yearlyRate)} a.a.</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">
                <Icon name="calculator" size={24} />
              </span>
              <p className={styles.placeholderText}>
                Preencha o valor do carro e a entrada e toque em <strong>Simular</strong> para ver a
                parcela estimada.
              </p>
            </div>
          )}
        </div>

        <Button
          variant="whatsapp"
          size="lg"
          fullWidth
          href={whatsappUrl(waText)}
          external
          onClick={registerLead}
        >
          Falar com um consultor
        </Button>

        <p className={styles.disclaimer}>{FINANCING_DISCLAIMER}</p>
      </div>
    </div>
  );
}

export default FinancingSimulator;
