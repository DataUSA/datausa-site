// Materializers of the soc profile sorted by legacy ordering (later ones read the output of earlier ones).
import type {MaterializerDefinition} from "@/lib/reports/types";
import m0 from "./00-32-nation-comparisons";
import m1 from "./01-31-industries-by-share";
import m2 from "./02-37-neighbors";
import m3 from "./03-35-icons";
import m4 from "./04-33-degrees";
import m5 from "./05-36-skills";
import m6 from "./06-34-bls-workforce";
import m7 from "./07-69-selector-options";
import m8 from "./08-75-dynamic-button";
import m9 from "./09-76-parragraph-visibility";
import m10 from "./10-77-wage-ranking-delta";
import m11 from "./11-78-gini-vs-national";
import m12 from "./12-80-helpers";
import m13 from "./13-88-visibility-skills";
import m14 from "./14-109-dynamic-gender-and-age-selector";

export const materializers: MaterializerDefinition[] = [m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14];
