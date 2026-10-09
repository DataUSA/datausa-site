import Link from "next/link";

interface TileProps {title: string; url: string; image?: string; subtitle?: string; isNew?: boolean}

/** Report tile with a background image (legacy `components/Tile`). */
export function Tile({title, url, image, subtitle, isNew}: TileProps) {
  return (
    <Link className={`usa-tile ${isNew ? "new" : ""}`} href={url}>
      {image && <div className="image" style={{backgroundImage: `url("${image}")`}} />}
      {image && <div className="overlay" />}
      <div className="content">
        <div className="title">{title}</div>
        {subtitle && <div className="subtitle">{subtitle}</div>}
      </div>
    </Link>
  );
}
