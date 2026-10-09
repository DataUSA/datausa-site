// Report template for the naics profile (legacy canon_cms_profile #3).
import type {ReportTemplate} from "@/lib/reports/types";
import {attributes} from "./attributes";
import {generators} from "./generators";
import {materializers} from "./materializers";
import {meta} from "./profile";
import {sections} from "./sections";
import {selectors} from "./selectors";
import {visualizations} from "./visualizations/manifest";

export const template: ReportTemplate = {meta, sections, selectors, generators, materializers, visualizations, attributes};
