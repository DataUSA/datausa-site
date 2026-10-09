// Converted from legacy canon_cms_generator #493 "[Graduates] Time to Complete" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 493,
  name: "[Graduates] Time to Complete",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_graduation_timeframe&drilldowns=Timeframe,Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Median+Percent+Completed+BA&time=Year.latest`,
  logic: (resp, {formatters, variables}) => {
    ///api/data?university=<id>&measures=Median%20Percent%20Completed%20BA&drilldowns=Timeframe&Year=latest
    const {abbreviate} = formatters;
    const data = resp.data;

    const _100 = resp.data.find((d: any) => d["Timeframe"] == "100%");
    const _150 = resp.data.find((d: any) => d["Timeframe"] == "150%");
    const _200 = resp.data.find((d: any) => d["Timeframe"] == "200%");

    const timeframeYearCurr: any = resp.data.length ? resp.data[0]["Year"] : false;

    const timeframe100 = _100 ? _100["Median Percent Completed BA"] : 0;
    const timeframe150 = _150 ? _150["Median Percent Completed BA"] : 0;
    const timeframe200 = _200 ? _200["Median Percent Completed BA"] : 0;

    let text: any = ""

    if (timeframe100 && timeframe150 && timeframe200) {
      text = `In ${timeframeYearCurr}, ${abbreviate(timeframe100)}% of students graduating from ${variables.name} completed their program within 100% "normal time" (i.e. 4 years for a 4-year degree). Comparatively, ${abbreviate(timeframe150)}% completed their degrees within 150% of the normal time, and ${abbreviate(timeframe200)}% within 200%.`
    }

    else if (timeframe100 && timeframe150) {
      text = `In ${timeframeYearCurr}, ${abbreviate(timeframe100)}% of students graduating from ${variables.name} completed their program within 100% "normal time" (i.e. 4 years for a 4-year degree). Comparatively, ${abbreviate(timeframe150)}% completed their degrees within 150% of the normal time.`
    }

    else if (timeframe100 && timeframe200) {
      text = `In ${timeframeYearCurr}, ${abbreviate(timeframe100)}% of students graduating from ${variables.name} completed their program within 100% "normal time" (i.e. 4 years for a 4-year degree). Comparatively, ${abbreviate(timeframe200)}% completed their degrees within 200% of the normal time.`
    }

    else if (timeframe150 && timeframe200) {
      text = `In ${timeframeYearCurr}, ${abbreviate(timeframe150)}% of students graduating from ${variables.name} completed their program within 150% "normal time" (i.e. 4 years for a 4-year degree). Comparatively, ${abbreviate(timeframe200)}% completed their degrees within 200% of the normal time.`
    }

    else if (timeframe100) {
      text = `In ${timeframeYearCurr}, ${abbreviate(timeframe100)}% of students graduating from ${variables.name} completed their program within 100% "normal time" (i.e. 4 years for a 4-year degree).`
    }

    else if (timeframe150) {
      text = `In ${timeframeYearCurr}, ${abbreviate(timeframe150)}% of students graduating from ${variables.name} completed their program within 150% "normal time" (i.e. 4 years for a 4-year degree).`
    }

    else if (timeframe200) {
      text = `In ${timeframeYearCurr}, ${abbreviate(timeframe200)}% of students graduating from ${variables.name} completed their program within 200% "normal time" (i.e. 4 years for a 4-year degree).`
    }


    return {
      timeframeYearCurr,
      timeframe100: timeframe100 ? timeframe100 : false,
      timeframe150: timeframe150 ? timeframe150 : false,
      timeframe200: timeframe200 ? timeframe200 : false,
      timeToCompleteText: text,
    }
  }
};

export default generator;
