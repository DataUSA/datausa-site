// Converted from legacy canon_cms_materializer #85 "Visibility Variables" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 85,
  name: "Visibility Variables",
  ordering: 11,
  allowed: "always",
  logic: (variables) => {
    const {tuitionCostCurr, isUniversity, aidVis, roomCostGrowth, defaultRate, visibleFinancialAidSection, isHiddenUniversity, showDefaultRate, OtherStudentExpensesVis, tuitionCostsVis} = variables;

    let isUniversityWithTuition

    if (tuitionCostCurr && isUniversity) {
      isUniversityWithTuition = true
    }

    else {
      isUniversityWithTuition = false
    }

    let isUniversityAidVis

    if(isUniversity && aidVis){
      isUniversityAidVis = true
    }

    else{
      isUniversityAidVis = false
    }


    let isHiddenUniversityWithTuition

    if (tuitionCostCurr && isHiddenUniversity) {
      isHiddenUniversityWithTuition = true
    }

    else {
      isHiddenUniversityWithTuition = false
    }

    const costsVis = tuitionCostsVis || aidVis || roomCostGrowth || visibleFinancialAidSection || defaultRate;

    // Occupations Visibility

    const {staffTop1Name, staffOtherTop1Name, bachelorsMostPopularDegree, bachelorsNotMostPopularDegree} = variables;
    const {financeEndowment, financeGrants, salaryExpenditureVis, staffInstructionalEmployees, staffGenderTop1Vis} = variables;

    let occupationsByShareVis = true

    if ((staffTop1Name === false || !staffTop1Name) && (staffOtherTop1Name === false || !staffOtherTop1Name)) {
      occupationsByShareVis = false
    }

    else {
      occupationsByShareVis = true
    }

    // Operations Visibility

    const operationsVis = financeEndowment || financeGrants || salaryExpenditureVis || staffInstructionalEmployees || occupationsByShareVis || staffGenderTop1Vis;


    // Visbility Salaries Expenditure 2nd Paragraph

    const {isHiddenCarnegieParent, salaryCarnegieParent} = variables;

    let salaryExpenditureCarnegieParagraphVis = isHiddenCarnegieParent

    if (!salaryCarnegieParent) {
      salaryExpenditureCarnegieParagraphVis = false
    }

    // About Section

    const {nameCounty, latestYearDegrees_, mostPopularDegree, degreeCommonTop3_, gradsYearCurr, gradsTotal, gradsFemalePercent, gradsMalePercent} = variables

    let aboutParagraph1Vis = isUniversity

    if(nameCounty == false && !latestYearDegrees_ && !mostPopularDegree && !degreeCommonTop3_){
      aboutParagraph1Vis = false
    }

    let aboutParagraph3Vis = isUniversity

    if(!gradsYearCurr && !gradsTotal && !gradsFemalePercent && !gradsMalePercent){
      aboutParagraph3Vis = false
    }

    let aboutVis

    if(aboutParagraph1Vis == false && aboutParagraph3Vis == false && isHiddenUniversity == false && isUniversityWithTuition == false && isHiddenUniversityWithTuition == false) {
      aboutVis = false
    }

    // Graduates Visibility

    const {commonGradsRCAIds, majorsAwardedVis, sexBreakdownCommonMajorsVis, gradsMaleVis, gradsFemaleVis, timeframeYearCurr, gradRateByRaceVis, gradsRaceByShareVis, completionsRGVis} = variables;

    let commonJobsByMajorVis = true
    let highestPayingByMajorVis = true
    let commonIndustriesByMajorVis = true

    if (commonGradsRCAIds === "") {
      commonJobsByMajorVis = false
      highestPayingByMajorVis = false
      commonIndustriesByMajorVis = false
    }

    let graduatesVis = true

    if (commonJobsByMajorVis == false && 
        highestPayingByMajorVis == false &&
        commonIndustriesByMajorVis == false &&
        majorsAwardedVis == false &&
        sexBreakdownCommonMajorsVis == false &&
        gradsMaleVis == false &&
        gradsFemaleVis == false &&
        timeframeYearCurr == false &&
        gradRateByRaceVis == false &&
        gradsRaceByShareVis == false &&
        completionsRGVis == false) {
          graduatesVis = false
        }
    

    // Enrollment Visibility

    const {enrollmentFTPTVis, retentionRate, enrollmentRaceEthnicityVis} = variables;

    let enrollmentsVis = true

    if(!enrollmentFTPTVis && !retentionRate && !enrollmentRaceEthnicityVis){
      enrollmentsVis = false
    }

    return {
      isUniversityWithTuition,
      isUniversityAidVis,
      isHiddenUniversityWithTuition,
      occupationsByShareVis,
      enrollmentsVis,
      costsVis,
      salaryExpenditureCarnegieParagraphVis,
      operationsVis,
      aboutParagraph1Vis,
      aboutParagraph3Vis,
      aboutVis,
      commonJobsByMajorVis,
      highestPayingByMajorVis,
      commonIndustriesByMajorVis,
      graduatesVis
    }
  }
};

export default materializer;
