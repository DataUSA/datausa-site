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
           visibleDegrees, visibleUniversities, visibleGradsRace, visibleTuition, visibleAdmEnr, senatorTotal, houseStats,
           isStateDistrictPumaMSAPlace, lastYearProvider, isCounty, lastYearProviderCounty, ageCurr,ageGrowth, povertyRateGrowth, payingIndustryListACS,
           propertyCurr, propertyGrowth, pct_rentOwn, incomeGrowth, acsMultiYear, propertyCurrMoe, providerVisible,
           visiblePresident
    } = variables;

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
      visibleTextProvider,
      visibleTextProviderCounty,
      visibleAgeStat,
      visiblePovertyStat,
      visibleTextHousing,
      visibleTextIncome,
      visiblePropertyStat,
      visibleElection
    }
  }
};

export default materializer;
