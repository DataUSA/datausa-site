import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", padding: "4rem 1rem", textAlign: "center"}}>
      <h1 style={{fontSize: "3rem", fontWeight: 300}}>Page Not Found</h1>
      <p>The page you were looking for does not exist.</p>
      <p><Link href="/" style={{color: "var(--red)"}}>Return to the Data USA homepage</Link></p>
    </main>
  );
}
