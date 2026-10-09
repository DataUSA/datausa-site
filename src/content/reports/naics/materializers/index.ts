// Materializers of the naics profile sorted by legacy ordering (later ones read the output of earlier ones).
import type {MaterializerDefinition} from "@/lib/reports/types";
import m0 from "./00-23-icons";
import m1 from "./01-29-colors";
import m2 from "./02-27-nation-comparisons";
import m3 from "./03-25-occupations-salary-by-gender-comparison";
import m4 from "./04-21-business-industry-flow";
import m5 from "./05-22-va-filter";
import m6 from "./06-30-bls-subtitle";
import m7 from "./07-63-buttons";
import m8 from "./08-64-texts";
import m9 from "./09-65-visibility-variables";
import m10 from "./10-66-employment-average-wage";
import m11 from "./11-90-bls-ids";

export const materializers: MaterializerDefinition[] = [m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11];
