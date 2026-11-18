import {landingMetadata, landingPage} from "@/components/landing/route";

/** Blocks on the route params so an unknown level or state answers a real 404 (see `src/proxy.ts`). */
export const instant = false;

export const generateMetadata = landingMetadata("products");

/** `/products`, `/products/<level>` and, for levels with state pages, `/products/<level>/<state>`. */
export default landingPage("products");
