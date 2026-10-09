// Materializers of the university profile sorted by legacy ordering (later ones read the output of earlier ones).
import type {MaterializerDefinition} from "@/lib/reports/types";
import m0 from "./00-51-tuition-carnegie-parent-tuition-lookup";
import m1 from "./01-44-enrollment-carnegie-parent-enrollment-lookup";
import m2 from "./02-49-enrollment-carnegie-parent-retention-lookup";
import m3 from "./03-40-carnegie-parents-rg-lookup";
import m4 from "./04-50-carnegie-parent-finance-lookup";
import m5 from "./05-39-finance-salary-ratio";
import m6 from "./06-41-degrees";
import m7 from "./07-45-icons";
import m8 from "./08-48-about-costs-tuition";
import m9 from "./09-52-booleans";
import m10 from "./10-86-visibility-bacherlors";
import m11 from "./11-85-visibility-variables";
import m12 from "./12-84-carnegie-name-check";
import m13 from "./13-96-carnegie-similar-ids";
import m14 from "./14-97-operations-staff-instructional";
import m15 from "./15-98-operations-staff-instructional-carnegie-parent";
import m16 from "./16-107-similar-universities-opeid";

export const materializers: MaterializerDefinition[] = [m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15, m16];
