// Converted from legacy canon_cms_materializer #10 "Election Data" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 10,
  name: "Election Data",
  ordering: 12,
  allowed: "always",
  logic: (variables, {formatters}) => {
    const {
      colorGrey, 
      colorParty, 
      electoralCandidates, 
      electoralParty1, 
      electionState,
      electionVotes1ID,
      electionVotes1Party,
      electionVotes2ID,
      electionVotes2Party,
      electionVotes3ID,
      electionVotes3Party,
      electionVotes1GeoID,
      electionVotes1GeoName,
      hierarchy,
      houseDistricts,
      houseState,
      houseStats,
      id,
      name,
      senatorTotal,
      electionGeo
    } = variables;

    const {list} = formatters;

    const president = electoralCandidates.find((d: any) => d.Party === electoralParty1.Party);
    const opponent = electoralCandidates.find((d: any) => d.Party !== electoralParty1.Party);
    const oppVotes = electoralParty1["Total Votes"] - electoralParty1["Electoral College Votes"];

    const nameFunc = (d: any) => {
      const names = d.split(" ");
      return d === "Joseph R Biden Jr." ? "Joe Biden" : `${names[0]} ${names[names.length - 1]}`;
    }

    const image = (d: any, type: any) => {
      if (!d) return "";
      const party = (d.Party || "")
        .replace(" Party", "")
        .replace(", and ", ", ")
        .replace(" and ", ", ");
      let color = colorGrey;
      party.split(", ").forEach((p: any) => {
        if (colorParty[p]) color = colorParty[p];
      });
      return `<span class='candidate-image' style='border-color: ${color};'><span style='background-image: url("/api/candidate/${type}/${d["Candidate ID"]}");'></span></span>`;
    }

    const retObj: Record<string, any> = {
      bidenImage: `<span class='candidate-image' style='border-color: ${colorParty.Democratic};'><span style='background-image: url("https://upload.wikimedia.org/wikipedia/commons/2/20/Joe_Biden_official_portrait_2013_cropped.jpg");'></span></span>`,
      presidentImage: image(president, "president"),
      presidentName: nameFunc(president.Candidate),
      presidentYear: president.Year,
      presidentParty: `${president.Party} Party`,
      presidentElectoral: electoralParty1["Electoral College Votes"],
      presidentElectoralShare: electoralParty1["Electoral College Votes"] / electoralParty1["Total Votes"] * 100,
      presidentPopular: president["Candidate Votes"],
      presidentPopularShare: president["Candidate Votes"] / president["Total Votes"] * 100,
  
      presidentOppImage: image(opponent, "president"),
      presidentOppName: nameFunc(opponent.Candidate),
      presidentOppParty: `${opponent.Party} Party`,
      presidentOppElectoral: oppVotes,
      presidentOppElectoralShare: oppVotes / electoralParty1["Total Votes"] * 100,
      presidentOppPopular: opponent["Candidate Votes"],
      presidentOppPopularShare: opponent["Candidate Votes"] / opponent["Total Votes"] * 100,
  
      electionVotes1Image: image({Party: electionVotes1Party, "Candidate ID": electionVotes1ID}, "president"),
      electionVotes2Image: image({Party: electionVotes2Party, "Candidate ID": electionVotes2ID}, "president"),
      electionVotes3Image: image({Party: electionVotes3Party, "Candidate ID": electionVotes3ID}, "president"),
  
      electionPresidentSub: ["Nation", "State"].includes(hierarchy) ? false : `Presidential voting results are only available at the county level. Showing data for the counties inside of ${electionState}.`,
      electionSenateSub: ["Nation", "State"].includes(hierarchy) ? false : `Senatorial voting results are only available at the state level. Showing data for ${electionState}.`,
      electionHouseSub: ["Nation", "State"].includes(hierarchy) ? false : `House voting results are only available at the state level. Showing data for ${houseState}.`,
      electionVotesSub: id !== electionVotes1GeoID ? `Voting results are not available for ${name}. Showing the available data for ${electionGeo}.` : false
    }

    for (let i = 1; i <= senatorTotal; i++) {
      const party = variables[`senator${i}Party`];
      const image = variables[`senator${i}ImageRaw`];
      retObj[`senator${i}Image`] = `<span class='candidate-image' style='border-color: ${colorParty[party] || colorGrey};'><span style='background-image: url("${image}");'></span></span>`;
    }

    for (let i = 1; i <= houseStats; i++) {
      retObj[`house${i}Image`] = `<span class='candidate-image' style='border-color: ${colorParty[variables[`house${i}Party`]] || colorGrey};'><span style='background-image: url("${variables[`house${i}ImageRaw`] || "/api/candidate/house/missing"}");'></span></span>`;
    }

    return retObj;
  }
};

export default materializer;
