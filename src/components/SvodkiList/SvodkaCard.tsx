// Карточка сводки — приближение к реальному дизайну из скриншота
import { Svodka } from "../../types";

interface SvodkaCardProps {
  svodka: Svodka;
}

export function SvodkaCard({ svodka }: SvodkaCardProps) {
  return (
    <div className="svodka-card">
      {/* Верхняя строка: дата + заказчик + подрядчик */}
      <div className="svodka-card__meta-row">
        <span className="svodka-card__date-label">
          сводка от <strong>{svodka.dateFrom}</strong>
        </span>
        <div className="svodka-card__participants">
          <div className="participant">
            <span className="participant__role">заказчик</span>
            <span className="participant__name">{svodka.customer}</span>
          </div>
          <div className="participant">
            <span className="participant__role">подрядчик</span>
            <span className="participant__name">{svodka.contractor}</span>
          </div>
        </div>
      </div>

      {/* Заголовок */}
      <h3 className="svodka-card__title">{svodka.title}</h3>

      {/* Чипы участков */}
      <div className="svodka-card__sites">
        {svodka.sites.map((site) => (
          <span key={site} className="site-chip">{site}</span>
        ))}
      </div>

      {/* Области — как текстовые строки */}
      <div className="svodka-card__areas">
        {svodka.areas.map((area) => (
          <p key={area} className="area-item">{area}</p>
        ))}
      </div>
    </div>
  );
}
