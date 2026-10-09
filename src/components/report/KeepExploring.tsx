import Link from "next/link";
import type {MemberRow} from "@/lib/dimensions/db";
import {memberImageUrl} from "@/lib/reports/load";
import styles from "./KeepExploring.module.css";

/** Tiles linking to similar reports (legacy "Keep Exploring"). */
export function KeepExploring({profileSlug, members}: {profileSlug: string; members: MemberRow[]}) {
  return (
    <section id="keep-exploring" className={styles.keepExploring}>
      <h2 className={styles.heading}>Keep Exploring</h2>
      <div className={`${styles.tiles} ${profileSlug}`}>
        {members.map(m => (
          <Link key={m.slug || m.id} className={styles.tile} href={`/profile/${profileSlug}/${m.slug || m.id}`} style={{backgroundImage: `url("${memberImageUrl(profileSlug, m.slug, "thumb")}")`}}>
            <span className={styles.tileTitle}>{m.name}</span>
            <span className={styles.tileSubtitle}>{m.hierarchy}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
