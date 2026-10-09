// Converted from legacy canon_cms_materializer #58 "Sections visibility" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 58,
  name: "Sections visibility",
  ordering: 17,
  allowed: "always",
  logic: (variables) => {
    const {isNationState, totalPopulationState, isNationStatePuma, residentPopulation, residentState, enrollmentsTotal,
           curr_homeownersMortgage, propertyCurr, applicantAdmitted, notDistrict, birthplaceYear, citizenshipCurr,
           payrollValue1, isCountyStateMSAnotPR, severeHousingRate, isStateCounty, wage1Gap, empCurr,
           childrenInPovertyRate, isNationStateCountynotPR, isNation, currRate_socialNeed_opt1, topStateTuition,
          lastYearPumsEducation, degreesYear, universityGrads, gradsRaceYear, raceTopRatio, hispanicPopShare,
          foreignbortnCurr, language1Name, confict1Name, topStateFee, visibleCrimeSection
    } = variables

    const visibleGradsRace = gradsRaceYear && notDistrict
    const visibleUniversities = universityGrads && notDistrict
    const visibleDegrees = degreesYear && notDistrict
    const visibleEnrollment = enrollmentsTotal && notDistrict
    const visibleHousing = curr_homeownersMortgage || propertyCurr
    const visiblePayroll = payrollValue1 && isCountyStateMSAnotPR
    const visibleChildrenInPoverty = isNation || (isNationStateCountynotPR && childrenInPovertyRate)
    const visibleSevereHousingProblems = isNation || (isNationStateCountynotPR && severeHousingRate)
    const visibleCrimes = isNation || (isNationStateCountynotPR && visibleCrimeSection)
    const visibleApplicantEnrollment = applicantAdmitted && notDistrict
    const visibleTextSevereHousingProblems = severeHousingRate && isStateCounty
    const visibleGlobalDiversity = notDistrict && birthplaceYear
    const visibleTextSalaries = wage1Gap && notDistrict
    const visibleEmployees = empCurr && notDistrict
    const visiblePopulation = isNationState && totalPopulationState
    const visibleResidents = isNation || (isNationStatePuma && residentPopulation) || (isNationStatePuma && residentState)
    const visiblePopulationSection = citizenshipCurr || visibleResidents || visiblePopulation
    const visibleTuition = (topStateTuition || topStateFee) && notDistrict
    const visiblePopEduc = lastYearPumsEducation && isNationStatePuma

    const visibleAdmEnr = visibleEnrollment || visibleApplicantEnrollment

    // diversity
    const visibleRaceEth = raceTopRatio || hispanicPopShare
    const visibleDiversityFullSection = visibleRaceEth || visibleGlobalDiversity || foreignbortnCurr || language1Name

    const visiblePopulationDiversity = visibleDiversityFullSection || confict1Name || visiblePopulationSection
    return {
      visibleUniversities,
      visibleDegrees,
      visiblePopEduc,
      visibleAdmEnr,
      visibleEnrollment,
      visibleTuition,
      visiblePopulationSection,
      visibleResidents,
      visiblePopulation,
      visibleEmployees,
      visibleTextSalaries,
      visibleGlobalDiversity,
      visibleTextSevereHousingProblems,
      visibleSevereHousingProblems,
      visibleHousing,
      visiblePayroll,
      visibleChildrenInPoverty,
      visibleCrimes,
      visibleApplicantEnrollment,
      visibleGradsRace,
      visibleRaceEth,
      visibleDiversityFullSection,
      visiblePopulationDiversity
    }
  }
};

export default materializer;
