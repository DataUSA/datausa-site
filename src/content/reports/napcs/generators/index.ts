// Generators of the napcs profile in legacy id order (Canon ran them in this order and merged the results).
import type {GeneratorDefinition} from "@/lib/reports/types";
import g0 from "./290-attributes-sctg";
import g1 from "./295-transport-exporter";
import g2 from "./422-transport-importer";
import g3 from "./424-transport-interstate";
import g4 from "./425-transport-transportation-mode";
import g5 from "./426-transport-transportation-mode-averages";
import g6 from "./565-government-spending-obligation";
import g7 from "./566-government-spending-agencies";
import g8 from "./567-government-spending-transaction-type";

export const generators: GeneratorDefinition[] = [g0, g1, g2, g3, g4, g5, g6, g7, g8];
