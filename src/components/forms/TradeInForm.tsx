"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Field, { TextArea, TextInput } from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import {
  formatNumber,
  maskCurrencyInput,
  maskPhoneInput,
  parseCurrencyInput,
} from "@/lib/format";
import {
  UPLOAD_LIMITS,
  validateName,
  validatePhone,
  validatePhotos,
  validateRequired,
  validateYear,
  type FieldErrors,
} from "@/lib/validation";
import { buildProtocol, submitLead } from "@/services/leadService";
import { waMessage, whatsappUrl } from "@/services/whatsapp";
import type { TradeInLead } from "@/types";
import FormStatus, { WhatsAppHint, focusFirstError, type FormState } from "./FormStatus";
import styles from "./TradeInForm.module.css";

/**
 * Avaliacao de usado (troca ou venda direta).
 *
 * As fotos ficam apenas no navegador: enviamos os nomes junto do lead e
 * pedimos os arquivos no WhatsApp, que e mais leve para o plano de dados do
 * cliente do que subir 8 imagens pelo formulario.
 */

export interface TradeInFormProps {
  compact?: boolean;
}

type FieldName = "name" | "phone" | "brand" | "model" | "year" | "mileage";
const FIELD_ORDER: FieldName[] = ["name", "phone", "brand", "model", "year", "mileage"];

interface Values {
  name: string;
  phone: string;
  brand: string;
  model: string;
  year: string;
  mileage: string;
  expectedPrice: string;
  notes: string;
}

interface Photo {
  id: string;
  file: File;
  url: string;
}

const EMPTY: Values = {
  name: "",
  phone: "",
  brand: "",
  model: "",
  year: "",
  mileage: "",
  expectedPrice: "",
  notes: "",
};

const IMAGE_NAME = /\.(jpe?g|png|webp|heic|heif)$/i;

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || IMAGE_NAME.test(file.name);
}

/** Quilometragem com separador de milhar, sem simbolo de moeda. */
function maskMileage(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 7);
  return digits ? formatNumber(Number(digits)) : "";
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function TradeInForm({ compact = false }: TradeInFormProps) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<Photo[]>([]);
  const sequenceRef = useRef(0);

  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<FieldName>>({});
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoError, setPhotoError] = useState<string | undefined>(undefined);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<FormState>("idle");
  const [protocol, setProtocol] = useState("");
  const [feedback, setFeedback] = useState("");

  const photosHintId = uid + "-fotos-ajuda";
  const photosErrorId = uid + "-fotos-erro";

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  // Libera as pre-visualizacoes ao sair da tela.
  useEffect(() => {
    return () => {
      for (const photo of photosRef.current) URL.revokeObjectURL(photo.url);
    };
  }, []);

  useEffect(() => {
    if (status === "success") statusRef.current?.focus();
  }, [status]);

  function setValue<K extends keyof Values>(key: K, value: Values[K]): void {
    setValues((previous) => {
      const next = { ...previous };
      next[key] = value;
      return next;
    });
  }

  function setFieldError(field: FieldName, message: string | undefined): void {
    setErrors((previous) => {
      const next: FieldErrors<FieldName> = { ...previous };
      next[field] = message;
      return next;
    });
  }

  function checkField(field: FieldName, current: Values): string | undefined {
    if (field === "name") return validateName(current.name);
    if (field === "phone") return validatePhone(current.phone);
    if (field === "brand") return validateRequired(current.brand, "Marca");
    if (field === "model") return validateRequired(current.model, "Modelo");
    if (field === "year") return validateYear(current.year);
    if (!onlyDigits(current.mileage)) return "Informe a quilometragem";
    return undefined;
  }

  function handleBlur(field: FieldName): void {
    setFieldError(field, checkField(field, values));
  }

  /* ---------------------------------------------------------------- fotos */

  function addFiles(list: FileList | null): void {
    if (!list || list.length === 0) return;

    const incoming = Array.from(list).filter(isImageFile);
    if (incoming.length === 0) {
      setPhotoError("Envie apenas imagens (JPG, PNG, WEBP ou HEIC)");
      return;
    }

    const combined = [...photos.map((photo) => photo.file), ...incoming];
    const error = validatePhotos(combined);
    if (error) {
      setPhotoError(error);
      return;
    }

    const created = incoming.map((file) => {
      sequenceRef.current += 1;
      return { id: "foto-" + sequenceRef.current, file, url: URL.createObjectURL(file) };
    });

    setPhotoError(undefined);
    setPhotos((previous) => [...previous, ...created]);
  }

  function removePhoto(id: string): void {
    const target = photos.find((photo) => photo.id === id);
    if (target) URL.revokeObjectURL(target.url);
    setPhotos((previous) => previous.filter((photo) => photo.id !== id));
    setPhotoError(undefined);
  }

  function handleDrop(event: DragEvent<HTMLElement>): void {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  }

  function handleDragOver(event: DragEvent<HTMLElement>): void {
    event.preventDefault();
    setDragging(true);
  }

  /** Ignora o "sair" que vem dos filhos da area, senao o destaque pisca. */
  function handleDragLeave(event: DragEvent<HTMLElement>): void {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    setDragging(false);
  }

  /* --------------------------------------------------------------- envio */

  const waText = waMessage.tradeIn({
    name: values.name.trim() || undefined,
    brand: values.brand.trim() || "meu carro",
    model: values.model.trim(),
    year: values.year || "",
    mileage: values.mileage ? values.mileage + " km" : "a confirmar",
    expectedPrice: values.expectedPrice || undefined,
    notes: values.notes.trim() || undefined,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const nextErrors: FieldErrors<FieldName> = {};
    for (const field of FIELD_ORDER) nextErrors[field] = checkField(field, values);
    setErrors(nextErrors);

    const photoIssue = validatePhotos(photos.map((photo) => photo.file));
    setPhotoError(photoIssue);

    const invalid = FIELD_ORDER.filter((field) => nextErrors[field]);
    if (invalid.length > 0 || photoIssue) {
      if (invalid.length > 0) focusFirstError(formRef.current, invalid);
      return;
    }

    setFeedback("");
    setStatus("loading");

    const lead: TradeInLead = {
      type: "avaliacao",
      name: values.name.trim(),
      phone: values.phone.trim(),
      message: values.notes.trim() || undefined,
      source: "formulario-avaliacao",
      car: {
        brand: values.brand.trim(),
        model: values.model.trim(),
        year: Number(onlyDigits(values.year)),
        mileage: Number(onlyDigits(values.mileage)),
        expectedPrice: values.expectedPrice
          ? parseCurrencyInput(values.expectedPrice)
          : undefined,
        notes: values.notes.trim() || undefined,
        photos: photos.map((photo) => photo.file.name),
      },
    };

    const response = await submitLead(lead);

    if (response.ok) {
      setProtocol(response.protocol ?? buildProtocol());
      setStatus("success");
      return;
    }

    setFeedback(response.message);
    setStatus("error");
  }

  if (status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} className={styles.statusWrap}>
        <FormStatus
          state="success"
          protocol={protocol}
          message="Nosso avaliador vai conferir os dados do seu carro e voltar com uma faixa de valor. As fotos serão solicitadas no WhatsApp para não pesar seu plano de dados."
        >
          <Button variant="whatsapp" size="lg" fullWidth href={whatsappUrl(waText)} external>
            Continuar no WhatsApp
          </Button>
        </FormStatus>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className={cn(styles.form, compact ? styles.compact : undefined)}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className={styles.columns}>
        <section className={styles.column}>
          <h3 className={styles.columnTitle}>Seus dados</h3>

          <Field label="Nome completo" htmlFor={uid + "-nome"} required error={errors.name}>
            <TextInput
              name="name"
              value={values.name}
              onChange={(event) => setValue("name", event.target.value)}
              onBlur={() => handleBlur("name")}
              autoComplete="name"
              enterKeyHint="next"
              placeholder="Nome e sobrenome"
            />
          </Field>

          <Field
            label="WhatsApp"
            htmlFor={uid + "-whatsapp"}
            required
            error={errors.phone}
            hint="É por aqui que enviamos a avaliação."
          >
            <TextInput
              name="phone"
              value={values.phone}
              onChange={(event) => setValue("phone", maskPhoneInput(event.target.value))}
              onBlur={() => handleBlur("phone")}
              inputMode="tel"
              autoComplete="tel"
              enterKeyHint="next"
              placeholder="(41) 99999-0000"
            />
          </Field>
        </section>

        <section className={styles.column}>
          <h3 className={styles.columnTitle}>Seu carro</h3>

          <div className={styles.pair}>
            <Field label="Marca" htmlFor={uid + "-marca"} required error={errors.brand}>
              <TextInput
                name="brand"
                value={values.brand}
                onChange={(event) => setValue("brand", event.target.value)}
                onBlur={() => handleBlur("brand")}
                enterKeyHint="next"
                placeholder="Toyota"
              />
            </Field>

            <Field label="Modelo" htmlFor={uid + "-modelo"} required error={errors.model}>
              <TextInput
                name="model"
                value={values.model}
                onChange={(event) => setValue("model", event.target.value)}
                onBlur={() => handleBlur("model")}
                enterKeyHint="next"
                placeholder="Corolla XEi"
              />
            </Field>
          </div>

          <div className={styles.pair}>
            <Field label="Ano do modelo" htmlFor={uid + "-ano"} required error={errors.year}>
              <TextInput
                name="year"
                value={values.year}
                onChange={(event) => setValue("year", onlyDigits(event.target.value).slice(0, 4))}
                onBlur={() => handleBlur("year")}
                inputMode="numeric"
                maxLength={4}
                enterKeyHint="next"
                placeholder="2021"
              />
            </Field>

            <Field
              label="Quilometragem"
              htmlFor={uid + "-km"}
              required
              error={errors.mileage}
              hint="Aproximada, em km."
            >
              <TextInput
                name="mileage"
                value={values.mileage}
                onChange={(event) => setValue("mileage", maskMileage(event.target.value))}
                onBlur={() => handleBlur("mileage")}
                inputMode="numeric"
                enterKeyHint="next"
                placeholder="48.000"
              />
            </Field>
          </div>

          <Field
            label="Valor pretendido"
            htmlFor={uid + "-valor"}
            hint="Opcional. Ajuda a acelerar a proposta."
          >
            <TextInput
              name="expectedPrice"
              value={values.expectedPrice}
              onChange={(event) =>
                setValue("expectedPrice", maskCurrencyInput(event.target.value))
              }
              inputMode="numeric"
              placeholder="R$ 95.000"
            />
          </Field>
        </section>
      </div>

      <Field
        label="Observações"
        htmlFor={uid + "-observacoes"}
        hint="Detalhes que mudam o valor: único dono, revisões em concessionária, retoques de pintura, pneus novos."
      >
        <TextArea
          name="notes"
          value={values.notes}
          onChange={(event) => setValue("notes", event.target.value)}
          rows={4}
          placeholder="Conte o histórico do carro"
        />
      </Field>

      {/* ---- Fotos ---- */}
      <div className={styles.upload}>
        <div className={styles.uploadHead}>
          <span className={styles.uploadLabel}>Fotos do carro</span>
          <span className={cn(styles.counter, "tnum")}>
            {photos.length} de {UPLOAD_LIMITS.maxFiles} fotos
          </span>
        </div>

        <button
          type="button"
          className={cn(styles.dropzone, dragging ? styles.dropzoneActive : undefined)}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-describedby={photoError ? photosHintId + " " + photosErrorId : photosHintId}
        >
          <span className={styles.dropIcon} aria-hidden="true">
            <Icon name="camera" size={24} />
          </span>
          <span className={styles.dropTitle}>Adicionar fotos</span>
          <span className={styles.dropText}>
            Arraste as imagens até aqui ou toque para escolher na galeria
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          name="photos"
          accept={UPLOAD_LIMITS.accept}
          multiple
          className={styles.fileInput}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <p id={photosHintId} className={styles.uploadHint}>
          Até {UPLOAD_LIMITS.maxFiles} imagens de {UPLOAD_LIMITS.maxSizeMb}MB cada. As fotos serão
          solicitadas no WhatsApp para não pesar seu plano de dados.
        </p>

        {photoError ? (
          <p id={photosErrorId} className={styles.uploadError} role="alert">
            <Icon name="alert" size={14} className={styles.uploadErrorIcon} />
            {photoError}
          </p>
        ) : null}

        {photos.length > 0 ? (
          <ul className={styles.thumbs}>
            {photos.map((photo, index) => (
              <li key={photo.id} className={styles.thumb}>
                <Image
                  src={photo.url}
                  alt={"Foto " + (index + 1) + " do seu carro"}
                  fill
                  sizes="120px"
                  unoptimized
                  className={styles.thumbImage}
                />
                <button
                  type="button"
                  className={styles.thumbRemove}
                  onClick={() => removePhoto(photo.id)}
                  aria-label={"Remover foto " + (index + 1)}
                >
                  <Icon name="trash" size={16} />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {status === "error" ? (
        <FormStatus state="error" message={feedback}>
          <Button variant="whatsapp" fullWidth href={whatsappUrl(waText)} external>
            Continuar no WhatsApp
          </Button>
        </FormStatus>
      ) : null}

      <div className={styles.actions}>
        <Button type="submit" size="lg" fullWidth loading={status === "loading"}>
          Quero avaliar meu carro
        </Button>
        <WhatsAppHint message={waText} />
      </div>
    </form>
  );
}

export default TradeInForm;
