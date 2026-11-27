// Converted from legacy canon_cms_materializer #118 "New visibility variables" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 118,
  name: "New visibility variables",
  ordering: 31,
  allowed: "always",
  logic: (variables) => {
    const {notNation, isNationStatePuma, isNationState,isCountyStateMSAnotPR, isNationStateCountyPlace, notDistrict, isStatePumaMsaCounty, isNationStateCountynotPR,
           empCurr, workforcePopulation, totalWorkforceState, stateNameEmployment, establishmentValue1, isNation,
           medianEarningsByIndustry, singleState, visiblePayroll, freightName, lastYearPumsEducation, lastYearNoSchooling,
           incomeRace0Child1Visible, incomeCurr, gini1Curr, commuteMeansYear, commuteTime, vehiclesNum, visibleSevereHousingProblems,
           povertyRate, visibleChildrenInPoverty, providerYear_, coverageByAge, insuranceYearCurr, visibleHealthCare, visibleAwardedDegrees, 
           visibleDegrees, visibleUniversities, visibleGradsRace, visibleTuition, visibleAdmEnr, senatorTotal, houseStats, houseTotal,
           isStateDistrictPumaMSAPlace, lastYearProvider, isCounty, lastYearProviderCounty, ageCurr,ageGrowth, povertyRateGrowth, payingIndustryListACS,
           propertyCurr, propertyGrowth, pct_rentOwn, incomeGrowth, acsMultiYear, propertyCurrMoe, providerVisible,
           visiblePresident, insuranceSome, insuranceEmp, insuranceMedicaid, insuranceMedicare, insuranceNon,
           insuranceOther, insuranceNone, menCoverage, womenCoverage, gradsRace1Ratio, isNotDistrict
    } = variables;

    // Shares over a total of 0 (the smallest places have no ACS rows) come out as NaN or Infinity and
    // printed as "NaNN%": hide the text or topic that would show them (QA DIFF-012, DIFF-014). Only
    // numbers that are not finite count; a missing value keeps the old behaviour.
    const nonFinite = (...values: any[]) => values.some(v => typeof v === "number" && !Number.isFinite(v));
    const textAboutProperty = Boolean(propertyCurr) && !nonFinite(pct_rentOwn);
    const textHealthCoverage = Boolean(notDistrict) && !nonFinite(insuranceSome, insuranceEmp, insuranceMedicaid, insuranceMedicare, insuranceNon, insuranceOther);
    const visibleUninsuredTopic = Boolean(insuranceYearCurr) && !nonFinite(insuranceEmp, insuranceMedicaid, insuranceNone);
    const textCoverageByGender = !nonFinite(menCoverage, womenCoverage);
    const textCoverageByGenderIntro = Boolean(isNotDistrict) && textCoverageByGender;
    // the age shares arrive already formatted ("NaNN% under 18 years")
    const textCoverageByAge = !(Array.isArray(coverageByAge) && coverageByAge.some((d: any) => String(d).includes("NaN")));
    const textGradsRaceRatio = !nonFinite(gradsRace1Ratio);

    const visibleTextIncome = incomeGrowth && acsMultiYear;
    const visiblePropertyStat = propertyCurrMoe && propertyCurr;

    const visibleTextHousing = propertyCurr && propertyGrowth && pct_rentOwn;
    const visibleAgeStat = ageCurr && ageGrowth;
    const visiblePovertyStat = povertyRate && povertyRateGrowth;

    const visibleTextProvider = isStateDistrictPumaMSAPlace && lastYearProvider;
    const visibleTextProviderCounty = isCounty && lastYearProviderCounty;

    const visibleWorkforceWage = isNationState && totalWorkforceState;
    const visibleOccupation = empCurr;
    const visibleUnemployment = stateNameEmployment;
    const visibleWorkforceDiversity = isNationStatePuma && workforcePopulation;
    const visibleEstablishmentSize = isCountyStateMSAnotPR && establishmentValue1;
    const visibleIndustriesSection =  empCurr || medianEarningsByIndustry || singleState || visibleEstablishmentSize || visiblePayroll;
    const visibleEmploymentSection = visibleWorkforceWage || visibleOccupation || visibleUnemployment || visibleWorkforceDiversity;
    const visibleWorkingPopulation = lastYearPumsEducation || lastYearNoSchooling;

    const visibleIncomeByLocation = isNationStateCountyPlace && incomeRace0Child1Visible;
    const visibleWageDistribution = notDistrict && gini1Curr;
    const visibleEquitySection = visibleIncomeByLocation || visibleWageDistribution || incomeCurr;

    const visibleTransportationSection = commuteMeansYear || commuteTime || vehiclesNum;
    const visiblePovertySection = notDistrict || visibleSevereHousingProblems || povertyRate || visibleChildrenInPoverty;

    const visiblePatient = isStatePumaMsaCounty && providerVisible;
    const visibleCoverageSection = visiblePatient || coverageByAge || insuranceYearCurr;

    const visibleOutcomes = isNationStateCountynotPR && providerYear_;
    const visibleBehavior = isNationStateCountynotPR && providerYear_;
    const visibleHealthIndSection = (visibleOutcomes || visibleBehavior || visibleHealthCare) && isNationStateCountynotPR;

    const visiblehealthSection = visibleHealthIndSection || visibleCoverageSection;

    const visibleAwarded = visibleAwardedDegrees && notDistrict;

    const visibleCompletions = notDistrict && (visibleAwardedDegrees || visibleDegrees || visibleUniversities || visibleGradsRace)

    const visibleEducationSection = visibleTuition || visibleWorkingPopulation || visibleCompletions || visibleAdmEnr;

    const visibleSenator = senatorTotal && notNation;
    const visibleSenatorSection = visibleSenator || isNation;

    const visibleHouse = houseStats && notNation;
    const visibleHouseSection = visibleHouse || isNation;
    // the "currently represented by" sentence: any area with members in the house (not the
    // territories, which have none in the data; QA DIFF-005)
    const visibleHouseText = houseTotal && notNation;

    const visibleElection = visiblePresident || visibleHouseSection || visibleSenatorSection;

    return {
      visibleAwarded,
      visiblehealthSection,
      visibleOutcomes,
      visibleBehavior,
      visiblePatient,
      visibleHealthIndSection,
      visibleCoverageSection,
      textEconomy: empCurr && notNation,
      textEconomyAbout: empCurr && notNation && payingIndustryListACS,
      visibleWorkforceWage,
      visibleOccupation,
      visibleUnemployment,
      visibleWorkforceDiversity,
      visibleEmploymentSection,
      visibleEstablishmentSize,
      visibleIndustriesSection,
      visibleEconomy: freightName || visibleIndustriesSection || visibleEmploymentSection,
      visibleWorkingPopulation,
      visibleIncomeByLocation,
      visibleWageDistribution,
      visibleEquitySection,
      visibleTransportationSection,
      visiblePovertySection,
      visibleCompletions,
      visibleEducationSection,
      visibleSenator,
      visibleSenatorSection,
      visibleHouse,
      visibleHouseSection,
      visibleHouseText,
      visibleTextProvider,
      visibleTextProviderCounty,
      visibleAgeStat,
      visiblePovertyStat,
      visibleTextHousing,
      visibleTextIncome,
      visiblePropertyStat,
      visibleElection,
      textAboutProperty,
      textHealthCoverage,
      visibleUninsuredTopic,
      textCoverageByGender,
      textCoverageByGenderIntro,
      textCoverageByAge,
      textGradsRaceRatio
    }
  }
};

export default materializer;
