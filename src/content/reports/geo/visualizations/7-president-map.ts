// Converted from legacy canon_cms_section_visualization #7 "section president-map" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, albersUsaPr}) => {
  const {colorGrey, colorParty, countyDataDepth, id, countyDataGeoIDs, presidentChildrenDiverging, presidentChildrenParty, tesseract, 
        electionCut} = variables;
  const {abbreviate} = formatters;
  const {nest} = libs.d3;

  const geoKey = id === "01000US" ? "State" : "County";
  
  return {
    cart: `${tesseract}tesseract/data?cube=Data_USA_President_election&drilldowns=Year,${electionCut}&measures=Candidate+Votes,Total+Votes`,
    colorScale: "Vote Share",
    colorScaleConfig: {
      axisConfig: {
        labels: [-100, -50, 0, 50, 100],
        shapeConfig: {
          labelBounds: (d: any, i: any, s: any) => {
            const width = 120;
            const {height, y} = d.labelBounds;
            return {x: -width / 2, y: y, width, height};
          }
        },
        tickFormat: (d: any) => 
          d === -100 ? "Democratic" : 
          d === 100 ? "Republican" : 
          d === 0 ? "Bipartisan"
          : `${abbreviate(Math.abs(d))}%`
      },
      color: [colorParty.Democratic, colorGrey, colorParty.Republican],
      colorMin: colorParty.Democratic,
      colorMid: colorGrey,
      colorMax: colorParty.Republican,
      domain: [-100, 100],
      //data: [{"Vote Share": -100}, {"Vote Share": 0}, {"Vote Share": 100}],
      scale: "linear"
    },
    data: `${tesseract}tesseract/data?cube=Data_USA_President_election&drilldowns=Year,Candidate,Party,${electionCut}&measures=Candidate+Votes,Total+Votes&sort=Candidate+Votes.desc`,
    dataFormat: (resp: any) => {
    
      const tops = nest()
        .key((d: any) => `${d.Year}_${d[`${geoKey} ID`]}`)
        .entries(resp.data)
        .map((group: any) => {
          group.values.forEach((d: any) => {
            d["Vote Share"] = d["Candidate Votes"] / d["Total Votes"] * 100;
          });
          const d = Object.assign({}, group.values[0]);
          if (d.Party === "Democratic") d["Vote Share"] *= -1;
          else if (d.Party !== "Republican") d["Vote Share"] = 0;
          d.list = group.values;
          return d;
        });
      
      return tops;
    
    },
    groupBy: `${geoKey} ID`,
    label: (d: any) => d[geoKey],
    projection: countyDataDepth === "State" && typeof window !== "undefined" ? albersUsaPr() : "geoMercator",
    shapeConfig: {
      Path: {
        fillOpacity: 1,
        strokeOpacity: 1
      }
    },
    tiles: false,
    tooltipConfig: {
      tbody: (d: any) => {
        const arr: any = [
          ["Year", d.Year],
          ["Total Vote", abbreviate(d["Total Votes"])],
          ["Top Results"]
        ];
        d.list.slice(0, 3).forEach((l: any) => {
          arr.push([l.Candidate, `${abbreviate(l["Vote Share"])}%`]);
        });
        return arr;
      }
    },
    topojson: `/topojson/${countyDataDepth}.json`,
    topojsonFilter: countyDataDepth === "State" ? (d: any) => d : (d: any) => (countyDataGeoIDs || []).includes(d.id),
    time: "Year",
    type: "Geomap"
  };

};

export default viz;
