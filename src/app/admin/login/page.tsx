import { redirect } from "next/navigation";
import Logo from "@/components/layout/Logo";
import { isAdminConfigured } from "@/lib/auth";
import { getSession } from "@/lib/session";
import LoginForm from "./LoginForm";
import styles from "./login.module.css";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");

  const configured = isAdminConfigured();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Logo tone="light" />
        <h1>Painel da loja</h1>
        <p className={styles.intro}>
          Área restrita para cadastrar e atualizar o estoque.
        </p>

        {configured ? (
          <LoginForm />
        ) : (
          <div className={styles.setup} role="status">
            <strong>Falta configurar o acesso</strong>
            <p>
              No terminal do projeto, rode <code>npm run admin:senha</code>, copie as três linhas geradas para o
              arquivo <code>.env.local</code> e reinicie o servidor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
