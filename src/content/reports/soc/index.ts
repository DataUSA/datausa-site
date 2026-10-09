// Report template for the soc profile (legacy canon_cms_profile #4).
import type {ReportTemplate} from "@/lib/reports/types";
import {attributes} from "./attributes";
import {generators} from "./generators";
import {materializers} from "./materializers";
import {meta} from "./profile";
import {sections} from "./sections";
import {selectors} from "./selectors";
import {visualizations} from "./visualizations/manifest";

export const template: ReportTemplate = {meta, sections, selectors, generators, materializers, visualizations, attributes};
