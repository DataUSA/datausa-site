// Exposes d3plus text helpers in the browser so label wrapping can be compared from Playwright.
//   npx esbuild scripts/regression/harness/text.ts --bundle --format=iife --alias:@=./src --outfile=public/_harness/text.js
import {textSplit, textWrap} from "@d3plus/text";
import {legacySplit} from "@/lib/viz/theme";

type AnyRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
(window as AnyRecord).d3plusText = {textSplit, textWrap, legacySplit};
