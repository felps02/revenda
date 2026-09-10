"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Field, { Checkbox, SelectInput, TextArea, TextInput } from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
import { BODY_TYPES, FEATURE_GROUPS, FUELS, TRANSMISSIONS } from "@/data/taxonomy";
import { maskCurrencyInput, parseCurrencyInput } from "@/lib/format";
import {
  CATEGORY_OPTIONS,
  emptyDraft,
  validateDraft,
  type DraftErrors,
  type VehicleDraft,
} from "@/lib/vehicleForm";
import type { VehicleImage, VehicleImageKind } from "@/types";
import styles from "./VehicleForm.module.css";

interface VehicleFormProps {
  /** Rascunho inicial: vazio para cadastro, preenchido para edição. */
  initial?: VehicleDraft;
  /** Código do veículo em edição. Ausente = cadastro novo. */
  vehicleId?: string;
}

const IMAGE_KINDS: { value: VehicleImageKind; label: string }[] = [
  { value: "exterior", label: "Externa" },
  { value: "interior", label: "Interior" },
  { value: "painel", label: "Painel" },
  { value: "bancos", label: "Bancos" },
  { value: "motor", label: "Motor" },
  { value: "porta-malas", label: "Porta-malas" },
  { value: "detalhe", label: "Detalhe" },
];

export default function VehicleForm({ initial, vehicleId }: VehicleFormProps) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState<VehicleDraft>(initial ?? emptyDraft());
  const [errors, setErrors] = useState<DraftErrors>({});
  const [message, setMessage] = useState<{ tone: "erro" | "ok"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  const editing = Boolean(vehicleId);

  function set<K extends keyof VehicleDraft>(key: K, value: VehicleDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function toggleFeature(feature: string) {
    setDraft((current) => ({
      ...current,
      features: current.features.includes(feature)
        ? current.features.filter((item) => item !== feature)
        : [...current.features, feature],
    }));
  }

  /* ---------------- fotos ---------------- */

  function addImages(urls: string[]) {
    const title = `${draft.brand} ${draft.model}`.trim() || "Veículo";
    const novas: VehicleImage[] = urls.map((url, index) => ({
      url,
      kind: draft.images.length + index === 0 ? "exterior" : "detalhe",
      caption: draft.images.length + index === 0 ? "Frente em três quartos" : "Foto do veículo",
      alt: `${title} - foto ${draft.images.length + index + 1}`,
    }));
    setDraft((current) => ({ ...current, images: [...current.images, ...novas] }));
    setErrors((current) => ({ ...current, images: undefined }));
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploading(true);
    setMessage(null);

    const body = new FormData();
    for (const file of list) body.append("fotos", file);

    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await response.json()) as { ok: boolean; urls?: string[]; message?: string };
      if (!data.ok || !data.urls) {
        setMessage({ tone: "erro", text: data.message ?? "Não foi possível enviar as fotos." });
      } else {
        addImages(data.urls);
      }
    } catch {
      setMessage({ tone: "erro", text: "Sem conexão para enviar as fotos." });
    } finally {
      setUploading(false);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length > 0) void uploadFiles(event.dataTransfer.files);
  }

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void uploadFiles(event.target.files);
    event.target.value = "";
  }

  function updateImage(index: number, patch: Partial<VehicleImage>) {
    setDraft((current) => ({
      ...current,
      images: current.images.map((image, position) =>
        position === index ? { ...image, ...patch } : image,
      ),
    }));
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= draft.images.length) return;
    setDraft((current) => {
      const images = [...current.images];
      [images[index], images[target]] = [images[target], images[index]];
      return { ...current, images };
    });
  }

  function removeImage(index: number) {
    setDraft((current) => ({
      ...current,
      images: current.images.filter((_, position) => position !== index),
    }));
  }

  /* ---------------- envio ---------------- */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const found = validateDraft(draft);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setMessage({ tone: "erro", text: "Confira os campos destacados antes de salvar." });
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        editing ? `/api/admin/vehicles/${vehicleId}` : "/api/admin/vehicles",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        },
      );
      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
        errors?: DraftErrors;
      };

      if (!data.ok) {
        if (data.errors) setErrors(data.errors);
        setMessage({ tone: "erro", text: data.message ?? "Não foi possível salvar." });
        setSaving(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setMessage({ tone: "erro", text: "Sem conexão com o servidor." });
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {message ? (
        <p className={message.tone === "erro" ? styles.error : styles.success} role="alert">
          <Icon name={message.tone === "erro" ? "alert" : "check-circle"} size={18} />
          <span>{message.text}</span>
        </p>
      ) : null}

      <fieldset className={styles.block}>
        <legend>Identificação</legend>
        <div className={styles.grid}>
          <Field label="Marca" htmlFor="brand" error={errors.brand} required className={styles.col2}>
            <TextInput
              id="brand"
              value={draft.brand}
              invalid={Boolean(errors.brand)}
              onChange={(event) => set("brand", event.target.value)}
              placeholder="Toyota"
            />
          </Field>

          <Field label="Modelo" htmlFor="model" error={errors.model} required className={styles.col2}>
            <TextInput
              id="model"
              value={draft.model}
              invalid={Boolean(errors.model)}
              onChange={(event) => set("model", event.target.value)}
              placeholder="Corolla"
            />
          </Field>

          <Field
            label="Versão"
            htmlFor="version"
            error={errors.version}
            hint="Como aparece no documento, ex.: XEi 2.0 Flex"
            required
            className={styles.full}
          >
            <TextInput
              id="version"
              value={draft.version}
              invalid={Boolean(errors.version)}
              onChange={(event) => set("version", event.target.value)}
            />
          </Field>

          <Field label="Ano do modelo" htmlFor="year" error={errors.year} required>
            <TextInput
              id="year"
              inputMode="numeric"
              value={draft.year}
              invalid={Boolean(errors.year)}
              onChange={(event) => set("year", event.target.value)}
            />
          </Field>

          <Field
            label="Ano de fabricação"
            htmlFor="manufactureYear"
            error={errors.manufactureYear}
            required
          >
            <TextInput
              id="manufactureYear"
              inputMode="numeric"
              value={draft.manufactureYear}
              invalid={Boolean(errors.manufactureYear)}
              onChange={(event) => set("manufactureYear", event.target.value)}
            />
          </Field>

          <Field
            label="Código do anúncio"
            htmlFor="id"
            hint={editing ? "Não muda depois de criado" : "Deixe vazio para gerar automaticamente"}
          >
            <TextInput
              id="id"
              value={draft.id}
              disabled={editing}
              onChange={(event) => set("id", event.target.value.toUpperCase())}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className={styles.block}>
        <legend>Preço e quilometragem</legend>
        <div className={styles.grid}>
          <Field label="Preço de venda" htmlFor="price" error={errors.price} required>
            <TextInput
              id="price"
              inputMode="numeric"
              value={draft.price ? maskCurrencyInput(draft.price) : ""}
              invalid={Boolean(errors.price)}
              onChange={(event) => set("price", String(parseCurrencyInput(event.target.value)))}
              placeholder="R$ 0"
            />
          </Field>

          <Field
            label="Preço anterior"
            htmlFor="previousPrice"
            error={errors.previousPrice}
            hint="Opcional — exibe o selo de oportunidade"
          >
            <TextInput
              id="previousPrice"
              inputMode="numeric"
              value={draft.previousPrice ? maskCurrencyInput(draft.previousPrice) : ""}
              invalid={Boolean(errors.previousPrice)}
              onChange={(event) =>
                set("previousPrice", String(parseCurrencyInput(event.target.value) || ""))
              }
            />
          </Field>

          <Field label="Quilometragem" htmlFor="mileage" error={errors.mileage} required>
            <TextInput
              id="mileage"
              inputMode="numeric"
              value={draft.mileage}
              invalid={Boolean(errors.mileage)}
              onChange={(event) => set("mileage", event.target.value.replace(/\D/g, ""))}
              placeholder="45000"
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className={styles.block}>
        <legend>Ficha técnica</legend>
        <div className={styles.grid}>
          <Field label="Câmbio" htmlFor="transmission" error={errors.transmission} required>
            <SelectInput
              id="transmission"
              value={draft.transmission}
              onChange={(event) => set("transmission", event.target.value)}
              options={TRANSMISSIONS.map((value) => ({ value, label: value }))}
            />
          </Field>

          <Field label="Combustível" htmlFor="fuel" error={errors.fuel} required>
            <SelectInput
              id="fuel"
              value={draft.fuel}
              onChange={(event) => set("fuel", event.target.value)}
              options={FUELS.map((value) => ({ value, label: value }))}
            />
          </Field>

          <Field label="Carroceria" htmlFor="body" error={errors.body} required>
            <SelectInput
              id="body"
              value={draft.body}
              onChange={(event) => set("body", event.target.value)}
              options={BODY_TYPES.map((value) => ({ value, label: value }))}
            />
          </Field>

          <Field
            label="Categoria"
            htmlFor="category"
            error={errors.category}
            hint="Usada no filtro do site"
            required
          >
            <SelectInput
              id="category"
              value={draft.category}
              onChange={(event) => set("category", event.target.value)}
              options={CATEGORY_OPTIONS}
            />
          </Field>

          <Field label="Cor" htmlFor="color" error={errors.color} required>
            <TextInput
              id="color"
              value={draft.color}
              invalid={Boolean(errors.color)}
              onChange={(event) => set("color", event.target.value)}
              placeholder="Prata"
            />
          </Field>

          <Field label="Portas" htmlFor="doors">
            <SelectInput
              id="doors"
              value={draft.doors}
              onChange={(event) => set("doors", event.target.value)}
              options={["2", "3", "4", "5"].map((value) => ({ value, label: `${value} portas` }))}
            />
          </Field>

          <Field label="Motor" htmlFor="engine" error={errors.engine} required>
            <TextInput
              id="engine"
              value={draft.engine}
              invalid={Boolean(errors.engine)}
              onChange={(event) => set("engine", event.target.value)}
              placeholder="2.0 Dynamic Force Flex"
            />
          </Field>

          <Field label="Potência (cv)" htmlFor="power" error={errors.power} required>
            <TextInput
              id="power"
              inputMode="numeric"
              value={draft.power}
              invalid={Boolean(errors.power)}
              onChange={(event) => set("power", event.target.value.replace(/\D/g, ""))}
              placeholder="177"
            />
          </Field>

          <Field label="Final da placa" htmlFor="plateEnd">
            <SelectInput
              id="plateEnd"
              value={draft.plateEnd}
              onChange={(event) => set("plateEnd", event.target.value)}
              options={Array.from({ length: 10 }, (_, index) => ({
                value: String(index),
                label: String(index),
              }))}
            />
          </Field>
        </div>

        <div className={styles.checks}>
          <Checkbox
            id="licensed"
            checked={draft.licensed}
            onChange={(event) => set("licensed", event.target.checked)}
            label="IPVA do ano pago"
          />
          <Checkbox
            id="singleOwner"
            checked={draft.singleOwner}
            onChange={(event) => set("singleOwner", event.target.checked)}
            label="Único dono"
          />
          <Checkbox
            id="financingAvailable"
            checked={draft.financingAvailable}
            onChange={(event) => set("financingAvailable", event.target.checked)}
            label="Aceita financiamento"
          />
        </div>

        <Field label="Garantia" htmlFor="warranty" hint="Opcional, ex.: Garantia de fábrica até 2027">
          <TextInput
            id="warranty"
            value={draft.warranty}
            onChange={(event) => set("warranty", event.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className={styles.block}>
        <legend>Fotos</legend>

        <div
          className={dragging ? styles.dropzoneActive : styles.dropzone}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <Icon name="camera" size={28} />
          <p>
            Arraste as fotos aqui ou{" "}
            <button type="button" onClick={() => fileInput.current?.click()}>
              escolha do computador
            </button>
          </p>
          <span>JPG, PNG ou WEBP de até 8 MB cada. A primeira foto é a capa do anúncio.</span>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            hidden
            onChange={onPick}
          />
          {uploading ? <p className={styles.uploading}>Enviando fotos…</p> : null}
        </div>

        <div className={styles.urlRow}>
          <TextInput
            aria-label="Colar URL de uma foto"
            placeholder="Ou cole o endereço de uma foto (https://...)"
            value={photoUrl}
            onChange={(event) => setPhotoUrl(event.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => {
              if (!photoUrl.trim()) return;
              addImages([photoUrl.trim()]);
              setPhotoUrl("");
            }}
          >
            Adicionar
          </Button>
        </div>

        {errors.images ? (
          <p className={styles.fieldError} role="alert">
            {errors.images}
          </p>
        ) : null}

        {draft.images.length > 0 ? (
          <ul className={styles.photos}>
            {draft.images.map((image, index) => (
              <li key={`${image.url}-${index}`}>
                <div className={styles.photoThumb}>
                  <Image src={image.url} alt={image.alt} fill sizes="160px" style={{ objectFit: "cover" }} />
                  {index === 0 ? <span className={styles.cover}>Capa</span> : null}
                </div>

                <div className={styles.photoFields}>
                  <label>
                    <span className="sr-only">Legenda da foto {index + 1}</span>
                    <input
                      type="text"
                      value={image.caption ?? ""}
                      placeholder="Legenda (ex.: Painel e multimídia)"
                      onChange={(event) => updateImage(index, { caption: event.target.value })}
                    />
                  </label>
                  <label>
                    <span className="sr-only">Tipo da foto {index + 1}</span>
                    <select
                      value={image.kind}
                      onChange={(event) =>
                        updateImage(index, { kind: event.target.value as VehicleImageKind })
                      }
                    >
                      {IMAGE_KINDS.map((kind) => (
                        <option key={kind.value} value={kind.value}>
                          {kind.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className={styles.photoActions}>
                  <button
                    type="button"
                    aria-label={`Mover foto ${index + 1} para antes`}
                    disabled={index === 0}
                    onClick={() => moveImage(index, -1)}
                  >
                    <Icon name="chevron-left" size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Mover foto ${index + 1} para depois`}
                    disabled={index === draft.images.length - 1}
                    onClick={() => moveImage(index, 1)}
                  >
                    <Icon name="chevron-right" size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remover foto ${index + 1}`}
                    onClick={() => removeImage(index)}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </fieldset>

      <fieldset className={styles.block}>
        <legend>Descrição do anúncio</legend>

        <Field
          label="Texto do anúncio"
          htmlFor="description"
          error={errors.description}
          hint="Conte o histórico real do carro. Deixe uma linha em branco para separar parágrafos."
          required
        >
          <TextArea
            id="description"
            rows={8}
            value={draft.description}
            invalid={Boolean(errors.description)}
            onChange={(event) => set("description", event.target.value)}
          />
        </Field>

        <Field
          label="Três destaques"
          htmlFor="highlight0"
          hint="Argumentos curtos que aparecem em lista na página do veículo"
        >
          <div className={styles.highlights}>
            {[0, 1, 2].map((index) => (
              <input
                key={index}
                id={`highlight${index}`}
                type="text"
                value={draft.highlights[index] ?? ""}
                placeholder={`Destaque ${index + 1}`}
                onChange={(event) => {
                  const next = [...draft.highlights];
                  next[index] = event.target.value;
                  set("highlights", next);
                }}
              />
            ))}
          </div>
        </Field>
      </fieldset>

      <fieldset className={styles.block}>
        <legend>Opcionais</legend>
        <p className={styles.hint}>
          Marque o que o carro tem. É o que alimenta o filtro por opcional no site.
        </p>
        {FEATURE_GROUPS.map((group) => (
          <div key={group.id} className={styles.featureGroup}>
            <h3>{group.title}</h3>
            <div className={styles.featureList}>
              {group.items.map((feature) => (
                <Checkbox
                  key={feature}
                  id={`feature-${feature}`}
                  checked={draft.features.includes(feature)}
                  onChange={() => toggleFeature(feature)}
                  label={feature}
                />
              ))}
            </div>
          </div>
        ))}
      </fieldset>

      <fieldset className={styles.block}>
        <legend>Publicação</legend>
        <div className={styles.grid}>
          <Field label="Status" htmlFor="status">
            <SelectInput
              id="status"
              value={draft.status}
              onChange={(event) => set("status", event.target.value)}
              options={[
                { value: "disponivel", label: "Disponível" },
                { value: "reservado", label: "Reservado" },
                { value: "vendido", label: "Vendido" },
              ]}
            />
          </Field>

          <Field label="Unidade" htmlFor="location">
            <TextInput
              id="location"
              value={draft.location}
              onChange={(event) => set("location", event.target.value)}
            />
          </Field>
        </div>

        <Checkbox
          id="featured"
          checked={draft.featured}
          onChange={(event) => set("featured", event.target.checked)}
          label="Mostrar nos destaques da página inicial"
        />
      </fieldset>

      <div className={styles.footer}>
        <Button type="submit" size="lg" loading={saving}>
          {editing ? "Salvar alterações" : "Cadastrar veículo"}
        </Button>
        <Button href="/admin" variant="ghost" size="lg">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
