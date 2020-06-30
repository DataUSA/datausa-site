const axios = require("axios");

const {CANON_API} = process.env;

module.exports = function(app) {

  const {db} = app.settings

  app.get("/api/home", async(req, res) => {

    const carousels = [];
    const newProfiles = [
      "6222", "45221", "7112", "517311", "5241", // 2018 PUMS Industries
      "311131", "15124X", "395092", "253041", "271024" // 2018 PUMS Occupations
    ];

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
          new: false
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
          image: "/api/profile/geo/boston-cambridge-newton-ma-nh/thumb",
          new: false
        },
        {
          title: "Coal Mining Workers by State",
          url: "/visualize?filters=0-Z2nLcvC-5-5&filters=1-1qWfo-4-2000&groups=0-z9TnC&groups=1-1mjmRl-2121&measure=1qWfo",
          image: "/api/profile/naics/mining-quarrying-oil-gas-extraction/thumb",
          new: false
        },
        {
          title: "Foreign-Born Citizens by State",
          url: "/visualize?groups=0-TBhjH&measure=64auG",
          image: "/api/profile/cip/regional-studies-us-canadian-foreign/thumb",
          new: false
        }
      ]
    });

    const geoSlugs = [
      "minneapolis-mn",
      "philadelphia-pa",
      "los-angeles-ca",
      "louisvillejefferson-county-ky-in",
      "dallas-fort-worth-arlington-tx"
    ];

    const geos = await db.search
      .findAll({include: [{association: "content"}], where: {dimension: "Geography", slug: geoSlugs}})
      .then(attrs => attrs
        .sort((a, b) => geoSlugs.indexOf(a.slug) - geoSlugs.indexOf(b.slug))
        .map(a => ({
          title: a.content[0].name,
          url: `/profile/geo/${a.slug || a.id}`,
          image: `/api/profile/geo/${a.slug || a.id}/thumb`
        }))
      )
      .catch(() => []);

    carousels.push({
      title: "Cities & Places",
      icon: "/icons/dimensions/Geography - White.svg",
      rank: 2,
      footer: "36,185 more",
      url: "/search/?kind=geo",
      tiles: geos
    });

    const indSlugs = [
      "spectator-sports",
      "air-transportation",
      "child-day-care-services",
      "restaurants-food-services",
      "military-reserves-or-national-guard"
    ];

    const industries = await db.search
      .findAll({include: [{association: "content"}], where: {dimension: "PUMS Industry", slug: indSlugs}})
      .then(attrs => {
        const ids = attrs.map(d => d.id);
        return attrs
          .filter((a, i) => ids.indexOf(a.id) === i)
          .sort((a, b) => indSlugs.indexOf(a.slug) - indSlugs.indexOf(b.slug))
          .map(a => ({
            title: a.content[0].name,
            new: newProfiles.includes(a.id),
            url: `/profile/naics/${a.slug || a.id}`,
            image: `/api/profile/naics/${a.slug || a.id}/thumb`
          }));
      })
      .catch(() => []);

    carousels.push({
      title: "Industries",
      icon: "/icons/dimensions/PUMS Industry - White.svg",
      rank: 3,
      footer: "296 more",
      url: "/search/?kind=naics",
      tiles: industries
    });

    const occSlugs = [
      "police-officers",
      "emergency-medical-technicians-paramedics",
      "elementary-middle-school-teachers",
      "retail-salespersons",
      "childcare-workers"
    ];

    const occupations = await db.search
      .findAll({include: [{association: "content"}], where: {dimension: "PUMS Occupation", slug: occSlugs}})
      .then(attrs => attrs
        .sort((a, b) => occSlugs.indexOf(a.slug) - occSlugs.indexOf(b.slug))
        .map(a => ({
          title: a.content[0].name,
          new: newProfiles.includes(a.id),
          url: `/profile/soc/${a.slug || a.id}`,
          image: `/api/profile/soc/${a.slug || a.id}/thumb`
        }))
      )
      .catch(() => []);

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
      .findAll({include: [{association: "content"}], where: {dimension: "University", slug: universitySlugs}})
      .then(attrs => attrs
        .sort((a, b) => universitySlugs.indexOf(a.slug) - universitySlugs.indexOf(b.slug))
        .map(a => ({
          title: a.content[0].name,
          url: `/profile/university/${a.slug || a.id}`,
          image: `/api/profile/university/${a.slug || a.id}/thumb`
        }))
      )
      .catch(() => []);

    carousels.push({
      title: "Universities",
      icon: "/icons/dimensions/University - White.svg",
      rank: 5,
      footer: "7,358 more",
      url: "/search/?kind=university",
      tiles: universities
    });

    const cipSlugs = [
      "emergency-room-nursing",
      "corrections",
      "project-management",
      "immunology",
      "criminal-justice-police-science"
    ];

    const courses = await db.search
      .findAll({include: [{association: "content"}], where: {dimension: "CIP", slug: cipSlugs}})
      .then(attrs => attrs
        .sort((a, b) => cipSlugs.indexOf(a.slug) - cipSlugs.indexOf(b.slug))
        .map(a => ({
          title: a.content[0].name,
          url: `/profile/cip/${a.slug || a.id}`,
          image: `/api/profile/cip/${a.slug || a.id}/thumb`
        }))
      )
      .catch(() => []);

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

    const stories = await axios.get(`${CANON_API}/api/storyLegacy`)
      .then(resp => resp.data)
      .catch(() => []);

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

    res.json(carousels);

  });

};
