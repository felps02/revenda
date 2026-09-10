"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Field, { TextInput } from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
import styles from "./login.module.css";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const destino = params.get("de") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as { ok: boolean; message?: string };

      if (!data.ok) {
        setError(data.message ?? "Não foi possível entrar.");
        setLoading(false);
        return;
      }

      router.replace(destino.startsWith("/admin") ? destino : "/admin");
      router.refresh();
    } catch {
      setError("Sem conexão com o servidor. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Field label="E-mail" htmlFor="email">
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </Field>

      <Field label="Senha" htmlFor="senha">
        {/* id próprio: sem ele o Field injetaria "senha" nesta div, duplicando
            o id do input e fazendo o rótulo apontar para o lugar errado. */}
        <div id="senha-campo" className={styles.passwordRow}>
          <TextInput
            id="senha"
            name="senha"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button
            type="button"
            className={styles.reveal}
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            <Icon name={showPassword ? "close" : "search"} size={18} />
          </button>
        </div>
      </Field>

      {error ? (
        <p className={styles.error} role="alert">
          <Icon name="alert" size={18} />
          <span>{error}</span>
        </p>
      ) : null}

      <Button type="submit" size="lg" fullWidth loading={loading}>
        Entrar no painel
      </Button>
    </form>
  );
}
