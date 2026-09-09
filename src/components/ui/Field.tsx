import {
  Children,
  cloneElement,
  isValidElement,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import Icon from "./Icon";
import styles from "./Field.module.css";

/**
 * Campo de formulario: rotulo, marcador de obrigatorio, dica, mensagem de erro
 * e o controle. O Field liga sozinho `id`, `aria-describedby` e `aria-invalid`
 * do controle que recebe como filho - basta passar o mesmo `htmlFor`.
 */

export interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/** Props que o Field consegue injetar no controle filho. */
interface ControlSlotProps {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  className,
  children,
}: FieldProps) {
  const hintId = `${htmlFor}-ajuda`;
  const errorId = `${htmlFor}-erro`;
  const describedBy =
    [hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined;

  const control = Children.map(children, (child) => {
    if (!isValidElement<ControlSlotProps>(child)) return child;
    return cloneElement(child, {
      id: child.props.id ?? htmlFor,
      "aria-describedby": child.props["aria-describedby"] ?? describedBy,
      "aria-invalid": child.props["aria-invalid"] ?? (error ? true : undefined),
    });
  });

  return (
    <div className={cn(styles.field, className)}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
        {required ? (
          <>
            <span className={styles.required} aria-hidden="true">
              *
            </span>
            <span className="sr-only">campo obrigatório</span>
          </>
        ) : null}
      </label>

      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}

      {control}

      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          <Icon name="alert" size={14} className={styles.errorIcon} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- controles */

export interface TextInputProps extends ComponentPropsWithRef<"input"> {
  invalid?: boolean;
}

export function TextInput({
  invalid,
  className,
  "aria-invalid": ariaInvalid,
  ...rest
}: TextInputProps) {
  return (
    <input
      {...rest}
      className={cn(styles.control, styles.input, className)}
      aria-invalid={ariaInvalid ?? (invalid ? true : undefined)}
    />
  );
}

export interface TextAreaProps extends ComponentPropsWithRef<"textarea"> {
  invalid?: boolean;
}

export function TextArea({
  invalid,
  className,
  rows = 4,
  "aria-invalid": ariaInvalid,
  ...rest
}: TextAreaProps) {
  return (
    <textarea
      {...rest}
      rows={rows}
      className={cn(styles.control, styles.textarea, className)}
      aria-invalid={ariaInvalid ?? (invalid ? true : undefined)}
    />
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectInputProps extends ComponentPropsWithRef<"select"> {
  invalid?: boolean;
  options?: SelectOption[];
  /** Primeira opcao neutra, com value vazio. */
  placeholder?: string;
}

export function SelectInput({
  invalid,
  options,
  placeholder,
  className,
  children,
  "aria-invalid": ariaInvalid,
  ...rest
}: SelectInputProps) {
  return (
    <span className={styles.selectWrap}>
      <select
        {...rest}
        className={cn(styles.control, styles.select, className)}
        aria-invalid={ariaInvalid ?? (invalid ? true : undefined)}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </select>
      <Icon name="chevron-down" size={18} className={styles.selectIcon} />
    </span>
  );
}

export interface CheckboxProps extends Omit<ComponentPropsWithRef<"input">, "type"> {
  label: ReactNode;
  hint?: string;
  invalid?: boolean;
}

export function Checkbox({
  label,
  hint,
  invalid,
  className,
  "aria-invalid": ariaInvalid,
  ...rest
}: CheckboxProps) {
  return (
    <label className={cn(styles.checkbox, className)}>
      <input
        {...rest}
        type="checkbox"
        className={styles.checkboxInput}
        aria-invalid={ariaInvalid ?? (invalid ? true : undefined)}
      />
      <span className={styles.checkboxBox} aria-hidden="true">
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
          <path
            d="m3.4 8.3 3.1 3.1 6.1-6.6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={styles.checkboxText}>
        <span>{label}</span>
        {hint ? <span className={styles.checkboxHint}>{hint}</span> : null}
      </span>
    </label>
  );
}

export default Field;
