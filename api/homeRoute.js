const axios = require("axios");

const {CANON_API} = process.env;

module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/home", async(req, res) => {

    const carousels = [];

    carousels.push({
      title: "Viz Builder",
      icon: "/icons/sections/admissions.svg",
      rank: 1,
      footer: "View Builder",
      url: "/visualize",
      new: true,
      tiles: [
        {
          title: "Department of Interior Spending by State",
          url: "/visualize?groups=0-Z1MxM8L&groups=1-1pz0Cl-14&measure=1e64mv",
          image: "/api/profile/geo/washington-dc/thumb",
          new: true
        },
        {
          title: "Opioid Deaths by County",
          url: "/visualize?enlarged=s-geomap-QuaqK&groups=0-QuaqK&measure=2sUCF4",
          image: "/api/profile/cip/pharmacology/thumb",
          new: false
        },
        {
          title: "Admissions for Universities in the Boston Metro Area",
          url: "/visualize?groups=0-1CdfJW&groups=1-1YEWx6-31000US14460&measure=Z1GSog1",
          image: "/api/profile/geo/boston-cambridge-quincy-ma-nh-metro-area/thumb",
          new: false
        },
        {
          title: "Coal Mining Workers by State",
          url: "/visualize?filters=0-h3NC-5-5&filters=1-ZkH9RT-4-2000&groups=0-1LK22m&groups=1-ZJJp1G-2121&measure=ZkH9RT",
          image: "/api/profile/naics/mining-quarrying-oil-gas-extraction/thumb",
          new: false
        },
        {
          title: "Foreign Born Citizens by State",
          url: "/visualize?groups=0-1dX7e9&measure=ZHkGoL",
          image: "/api/profile/cip/regional-studies-us-canadian-foreign/thumb",
          new: false
        }
      ]
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
          url: `/profile/geo/${a.slug || a.id}`,
          image: `/api/profile/geo/${a.id}/thumb`
        }))
      );

    carousels.push({
      title: "Cities & Places",
      icon: "/icons/dimensions/Geography - White.svg",
      rank: 2,
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
            url: `/profile/naics/${a.slug || a.id}`,
            image: `/api/profile/naics/${a.id}/thumb`
          }));
      });

    carousels.push({
      title: "Industries",
      icon: "/icons/dimensions/PUMS Industry - White.svg",
      rank: 3,
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
          url: `/profile/soc/${a.slug || a.id}`,
          image: `/api/profile/soc/${a.id}/thumb`
        }))
      );

    carousels.push({
      title: "Jobs",
      icon: "/icons/dimensions/PUMS Occupation - White.svg",
      rank: 4,
      footer: "520 more",
      url: "/search/?kind=soc",
      tiles: occupations
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
          url: `/profile/university/${a.slug || a.id}`,
          image: `/api/profile/university/${a.id}/thumb`
        }))
      );

    carousels.push({
      title: "Universities",
      icon: "/icons/dimensions/University - White.svg",
      rank: 5,
      footer: "7,358 more",
      url: "/search/?kind=university",
      tiles: universities
    });

    const cipIDs = ["513801", "110701", "520201", "420101", "240101"];

    const courses = await db.search
      .findAll({where: {dimension: "CIP", id: cipIDs}})
      .then(attrs => attrs
        .sort((a, b) => cipIDs.indexOf(a.id) - cipIDs.indexOf(b.id))
        .map(a => ({
          title: a.display,
          url: `/profile/cip/${a.slug || a.id}`,
          image: `/api/profile/cip/${a.id}/thumb`
        }))
      );

    carousels.push({
      title: "Degrees",
      icon: "/icons/dimensions/CIP - White.svg",
      rank: 7,
      footer: "2,314 more",
      url: "/search/?kind=cip",
      tiles: courses
    });

    carousels.push({
      title: "Data Cart",
      icon: "/images/cart-big.png",
      rank: 6,
      footer: "View Cart",
      url: "/cart",
      tiles: [
        {
          image: "/api/profile/cip/451099/thumb",
          title: "Federal Agency Spending by State",
          new: true,
          cart: {
            urls: ["/api/data?measures=Obligation%20Amount&drilldowns=Agency,State"],
            slug: "cart_agency_state"
          }
        },
        {
          image: "/api/profile/soc/113031/thumb",
          title: "Average Wage for Jobs",
          cart: {
            urls: ["/api/data?measures=Average%20Wage&drilldowns=Detailed%20Occupation"],
            slug: "cart_wage_soc"
          }
        },
        {
          image: "/api/profile/naics/3122/thumb",
          title: "Adult Smoking by State",
          cart: {
            urls: ["/api/data?measures=Adult%20Smoking&drilldowns=State"],
            slug: "cart_adult_smoking_state"
          }
        },
        {
          image: "/api/profile/cip/45/thumb",
          title: "Population by County",
          cart: {
            urls: ["/api/data?measures=Population&drilldowns=County"],
            slug: "cart_population_county"
          }
        },
        {
          image: "/api/profile/geo/05000US25019/thumb",
          title: "Median Property Value by County",
          cart: {
            urls: ["/api/data?measures=Property%20Value,Property%20Value%20Moe&drilldowns=County"],
            slug: "cart_property_value_county"
          }
        }
      ]
    });

    const stories = await axios.get(`${CANON_API}/api/story`).then(resp => resp.data);
    carousels.push({
      title: "Latest Stories",
      icon: "/icons/sections/about.svg",
      rank: 8,
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
