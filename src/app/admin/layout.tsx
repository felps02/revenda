import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/layout/Logo";
import Icon from "@/components/ui/Icon";
import { getSession } from "@/lib/session";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Painel · Marchetti Motors",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className={styles.shell}>
      {session ? (
        <header className={styles.topbar}>
          <div className={styles.topbarInner}>
            <Link href="/admin" className={styles.brand} aria-label="Painel da Marchetti Motors">
              <Logo tone="light" compact />
              <span>Painel</span>
            </Link>

            <nav className={styles.nav} aria-label="Seções do painel">
              <Link href="/admin">
                <Icon name="car" size={18} />
                <span>Estoque</span>
              </Link>
              <Link href="/admin/veiculos/novo">
                <Icon name="plus" size={18} />
                <span>Novo veículo</span>
              </Link>
              <Link href="/" target="_blank" rel="noopener noreferrer">
                <Icon name="arrow-up-right" size={18} />
                <span>Ver o site</span>
              </Link>
            </nav>

            <form action="/api/admin/logout" method="post" className={styles.logout}>
              <span className={styles.user}>{session.email}</span>
              <button type="submit">Sair</button>
            </form>
          </div>
        </header>
      ) : null}

      <main className={styles.content}>{children}</main>
    </div>
  );
}
