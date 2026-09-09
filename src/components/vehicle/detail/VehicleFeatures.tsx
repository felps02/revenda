"use client";

import { useId, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { FEATURE_GROUPS } from "@/data/taxonomy";
import { cn } from "@/lib/cn";
import styles from "./VehicleFeatures.module.css";

/**
 * Opcionais do veiculo agrupados pelo catalogo de `data/taxonomy`.
 * Lista longa comeca cortada em 14 itens para nao empurrar a caixa de preco.
 */

const COLLAPSED_LIMIT = 14;

interface FeatureBlock {
  id: string;
  title: string;
  items: string[];
}

export interface VehicleFeaturesProps {
  features: string[];
  className?: string;
}

export function VehicleFeatures({ features, className }: VehicleFeaturesProps) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();

  const blocks = useMemo<FeatureBlock[]>(() => {
    const owned = new Set(features);
    const grouped: FeatureBlock[] = FEATURE_GROUPS.map((group) => ({
      id: group.id,
      title: group.title,
      items: group.items.filter((item) => owned.has(item)),
    })).filter((group) => group.items.length > 0);

    const known = new Set(FEATURE_GROUPS.flatMap((group) => group.items));
    const others = features.filter((item) => !known.has(item));
    if (others.length > 0) {
      grouped.push({ id: "outros", title: "Outros itens", items: others });
    }
    return grouped;
  }, [features]);

  const total = useMemo(
    () => blocks.reduce((sum, block) => sum + block.items.length, 0),
    [blocks],
  );

  const collapsible = total > COLLAPSED_LIMIT;

  const visible = useMemo<FeatureBlock[]>(() => {
    if (!collapsible || expanded) return blocks;
    let remaining = COLLAPSED_LIMIT;
    const cut: FeatureBlock[] = [];
    for (const block of blocks) {
      if (remaining <= 0) break;
      const items = block.items.slice(0, remaining);
      remaining -= items.length;
      cut.push({ ...block, items });
    }
    return cut;
  }, [blocks, collapsible, expanded]);

  if (total === 0) return null;

  return (
    <div className={cn(styles.root, className)}>
      <div id={listId} className={styles.groups}>
        {visible.map((block) => (
          <section key={block.id} className={styles.group}>
            <h3 className={styles.groupTitle}>{block.title}</h3>
            <ul className={styles.list}>
              {block.items.map((item) => (
                <li key={item} className={styles.item}>
                  <Icon name="check-circle" size={18} className={styles.check} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {collapsible ? (
        <Button
          variant="outline"
          size="md"
          icon={expanded ? "minus" : "plus"}
          className={styles.toggle}
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Ver menos opcionais" : `Ver todos os ${total} opcionais`}
        </Button>
      ) : null}
    </div>
  );
}

export default VehicleFeatures;
