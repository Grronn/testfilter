import type { Svodka } from "../../types";

interface SvodkaCardProps {
  svodka: Svodka;
}

export function SvodkaCard({ svodka }: SvodkaCardProps) {
  return (
    <div className="svodka-card">
      <div className="svodka-card__meta-row">
        <span className="svodka-card__date-label">
          сводка от <strong>{svodka.dateFrom}</strong>
        </span>
        <div className="svodka-card__participants">
          <div className="participant">
            <span className="participant__role">ЗАКАЗЧИК</span>
            <span className="participant__name">{svodka.customer}</span>
          </div>
          <div className="participant">
            <span className="participant__role">ПОДРЯДЧИК</span>
            <span className="participant__name">{svodka.contractor}</span>
          </div>
        </div>
      </div>
      <h3 className="svodka-card__title">{svodka.title}</h3>
      <div className="svodka-card__sites">
        {svodka.sites.map((site) => (
          <span key={site} className="site-chip">{site}</span>
        ))}
      </div>
    </div>
  );
}
