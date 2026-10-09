// Materializers of the cip profile sorted by legacy ordering (later ones read the output of earlier ones).
import type {MaterializerDefinition} from "@/lib/reports/types";
import m0 from "./00-93-parent-name";
import m1 from "./01-92-visibilities";
import m2 from "./02-17-degrees";
import m3 from "./03-16-employment-occupation-share";
import m4 from "./04-18-colors";
import m5 from "./05-19-icons";
import m6 from "./06-20-html-hacks";
import m7 from "./07-94-completions-share-by-university";
import m8 from "./08-95-specialized-colleges-degree-share-by-university";
import m9 from "./09-81-institutions-text";
import m10 from "./10-82-diversity-about-text";

export const materializers: MaterializerDefinition[] = [m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10];
