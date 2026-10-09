// Materializers of the napcs profile sorted by legacy ordering (later ones read the output of earlier ones).
import type {MaterializerDefinition} from "@/lib/reports/types";
import m0 from "./00-53-colors";
import m1 from "./01-54-data";

export const materializers: MaterializerDefinition[] = [m0, m1];
