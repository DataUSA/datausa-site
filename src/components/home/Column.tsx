import Link from "next/link";
import {InlineSvg} from "@/components/ui/InlineSvg";
import type {HomeColumn} from "@/lib/home/tiles";
import {Tile} from "./Tile";

/** One report family on the home page: title with icon plus its tiles (legacy `Home/Column.jsx`). */
export function Column({data}: {data: HomeColumn}) {
  return (
    <div className={`column ${data.slug}`}>
      <h2 className="column-title">
        <Link href={data.url} className="column-title-link">
          <span className="column-icon-container"><InlineSvg className="column-icon" src={data.icon} width={20} /></span>
          {data.title}
        </Link>
      </h2>
      {data.tiles.map(tile => <Tile key={tile.url} {...tile} />)}
    </div>
  );
}
