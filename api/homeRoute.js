const axios = require("axios");

const {CANON_API} = process.env;

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/home", async(req, res) => {

    const carousels = [];

    carousels.push({
      title: "Maps",
      icon: "/images/icons/demographics.svg",
      rank: 1,
      footer: "110 more",
      url: "/map",
      tiles: [
        {
          title: "Opioid Deaths (Age-Adjusted) by State",
          url: "/map/?level=state&key=opioid_overdose_deathrate_ageadjusted",
          image: "/images/home/maps/opioid_overdose_deathrate_ageadjusted.png",
          new: false
        },
        {
          title: "Default Rate by County",
          url: "/map/?level=county&key=default_rate,num_borrowers,num_defaults",
          image: "/images/home/maps/default_rate.png",
          new: false
        },
        {
          title: "Nonmedical Pain Reliever Usage by State",
          url: "/map/?level=state&key=non_medical_use_of_pain_relievers",
          image: "/images/home/maps/non_medical_use_of_pain_relievers.png",
          new: false
        },
        {
          title: "Medicare Reimbursements by County",
          url: "/map/?level=county&key=total_reimbursements_b",
          image: "/images/home/maps/total_reimbursements_b.png",
          new: false
        },
        {
          title: "Poverty Rate by County",
          url: "/map/?level=county&key=income_below_poverty:pop_poverty_status,income_below_poverty,income_below_poverty_moe,pop_poverty_status,pop_poverty_status_moe",
          image: "/images/home/maps/income_below_poverty.png",
          new: false
        }
      ]
    });

    const universitySlugs = [
      "massachusetts-institute-of-technology",
      "university-of-maryland-college-park",
      "university-of-notre-dame",
      "university-of-chicago",
      "northeastern-university"
    ];

    const universities = await db.search
      .findAll({where: {dimension: "University", slug: universitySlugs}})
      .then(attrs => attrs
        .sort((a, b) => universitySlugs.indexOf(a.slug) - universitySlugs.indexOf(b.slug))
        .map(a => ({
          title: a.display,
          url: `/profile/university/${a.id}`,
          image: `/api/profile/university/${a.id}/thumb`
        }))
      );

    carousels.push({
      title: "Universities",
      icon: "/images/icons/university.svg",
      rank: 2,
      footer: "7,358 more",
      url: "/search/?kind=university",
      tiles: universities
    });

    const geoSlugs = [
      "new-york-ny",
      "los-angeles-county-ca",
      "florida",
      "suffolk-county-ma",
      "illinois"
    ];

    const geos = await db.search
      .findAll({where: {dimension: "Geography", slug: geoSlugs}})
      .then(attrs => attrs
        .sort((a, b) => geoSlugs.indexOf(a.slug) - geoSlugs.indexOf(b.slug))
        .map(a => ({
          title: a.display,
          url: `/profile/geo/${a.id}`,
          image: `/api/profile/geo/${a.id}/thumb`
        }))
      );

    carousels.push({
      title: "Cities & Places",
      icon: "/images/icons/geo.svg",
      rank: 3,
      footer: "36,185 more",
      url: "/search/?kind=geo",
      tiles: geos
    });

    const indIDs = ["622", "23", "31-33", "722Z", "44-45"];

    const industries = await db.search
      .findAll({where: {dimension: "PUMS Industry", id: indIDs}})
      .then(attrs => {
        const ids = attrs.map(d => d.id);
        return attrs
          .filter((a, i) => ids.indexOf(a.id) === i)
          .sort((a, b) => indIDs.indexOf(a.id) - indIDs.indexOf(b.id))
          .map(a => ({
            title: a.display,
            url: `/profile/naics/${a.id}`,
            image: `/api/profile/naics/${a.id}/thumb`
          }));
      });

    carousels.push({
      title: "Industries",
      icon: "/images/icons/naics.svg",
      rank: 7,
      footer: "296 more",
      url: "/search/?kind=naics",
      tiles: industries
    });

    const occIDs = ["252020", "151131", "1110XX", "412031", "291141"];

    const occupations = await db.search
      .findAll({where: {dimension: "PUMS Occupation", id: occIDs}})
      .then(attrs => attrs
        .sort((a, b) => occIDs.indexOf(a.id) - occIDs.indexOf(b.id))
        .map(a => ({
          title: a.display,
          url: `/profile/soc/${a.id}`,
          image: `/api/profile/soc/${a.id}/thumb`
        }))
      );

    carousels.push({
      title: "Jobs",
      icon: "/images/icons/soc.svg",
      rank: 5,
      footer: "520 more",
      url: "/search/?kind=soc",
      tiles: occupations
    });

    const cipIDs = ["513801", "110701", "520201", "420101", "240101"];

    const courses = await db.search
      .findAll({where: {dimension: "CIP", id: cipIDs}})
      .then(attrs => attrs
        .sort((a, b) => cipIDs.indexOf(a.id) - cipIDs.indexOf(b.id))
        .map(a => ({
          title: a.display,
          url: `/profile/cip/${a.id}`,
          image: `/api/profile/cip/${a.id}/thumb`
        }))
      );

    carousels.push({
      title: "Degrees",
      icon: "/images/icons/cip.svg",
      rank: 8,
      footer: "2,314 more",
      url: "/search/?kind=cip",
      tiles: courses
    });

    carousels.push({
      title: "Download",
      icon: "/images/cart-big.png",
      rank: 6,
      footer: "110 more",
      url: "/map",
      tiles: [
        {
          url: "/api/data?required=patients_diabetic_medicare_enrollees_65_75_lipid_test_total&show=geo&sumlevel=county&year=all",
          slug: "map_patients_diabetic_medicare_enrollees_65_75_lipid_test_total_ county",
          image: "/api/profile/naics/5417/thumb",
          title: "Diabetic Lipid Tests by County"
        },
        {
          url: "/api/data?required=adult_smoking&show=geo&sumlevel=state&year=all",
          slug: "map_adult_smoking_ state",
          image: "/api/profile/naics/3122/thumb",
          title: "Adult Smoking by State"
        },
        {
          url: "/api/data?required=leg_amputations_per_1000_enrollees_total&show=geo&sumlevel=county&year=all",
          slug: "map_leg_amputations_per_1000_enrollees_total_ county",
          image: "/api/profile/naics/62/thumb",
          title: "Leg Amputations by County"
        },
        {
          url: "/api/data?required=pop%2Cpop_moe&show=geo&sumlevel=county&year=all",
          slug: "map_pop_ county",
          image: "/api/profile/cip/45/thumb",
          title: "Population by County"
        },
        {
          url: "/api/data?required=median_property_value%2Cmedian_property_value_moe&show=geo&sumlevel=county&year=all",
          slug: "map_median_property_value_ county",
          image: "/api/profile/geo/05000US25019/thumb",
          title: "Median Property Value by County"
        }
      ]
    });

    const stories = await axios.get(`${CANON_API}/api/story`).then(resp => resp.data);
    carousels.push({
      title: "Latest Stories",
      icon: "/images/icons/about.svg",
      rank: 4,
      footer: `${stories.length - 5} more`,
      url: "/story",
      tiles: stories.slice(0, 5).map(story => ({
        image: story.image,
        title: story.title,
        url: `/story/${story.id}`
      }))
    });

    res.json(carousels).end();

  });

};
