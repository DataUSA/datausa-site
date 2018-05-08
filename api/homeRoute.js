module.exports = function(app) {

  app.get("/api/home", (req, res) => {
    res.json([
      {
        title: "Maps",
        icon: "/images/icons/demographics.svg",
        rank: 1,
        footer: "110 more",
        url: "/map",
        tiles: [
          {
            title: "Opioid Deaths (Age-Adjusted) by State",
            url: "/map/?level=state&key=opioid_overdose_deathrate_ageadjusted",
            image: "/images/home/maps/total_reimbursements_b.png",
            new: true
          },
          {
            title: "Medicare Reimbursements by County",
            url: "/map/?level=state&key=opioid_overdose_deathrate_ageadjusted",
            image: "/images/home/maps/total_reimbursements_b.png",
            new: false
          }
        ]
      },
      {
        title: "Univesities",
        icon: "/images/icons/university.svg",
        rank: 2,
        footer: "110 more",
        url: "/map",
        tiles: [
          {
            title: "Opioid Deaths (Age-Adjusted) by State",
            url: "/map/?level=state&key=opioid_overdose_deathrate_ageadjusted",
            image: "/images/home/maps/total_reimbursements_b.png",
            new: true
          },
          {
            title: "Medicare Reimbursements by County",
            url: "/map/?level=state&key=opioid_overdose_deathrate_ageadjusted",
            image: "/images/home/maps/total_reimbursements_b.png",
            new: false
          }
        ]
      },
      {
        title: "Cities & Places",
        icon: "/images/icons/geo.svg",
        rank: 3,
        footer: "110 more",
        url: "/map",
        tiles: [
          {
            title: "Opioid Deaths (Age-Adjusted) by State",
            url: "/map/?level=state&key=opioid_overdose_deathrate_ageadjusted",
            image: "/images/home/maps/total_reimbursements_b.png",
            new: true
          },
          {
            title: "Medicare Reimbursements by County",
            url: "/map/?level=state&key=opioid_overdose_deathrate_ageadjusted",
            image: "/images/home/maps/total_reimbursements_b.png",
            new: false
          }
        ]
      },
      {
        title: "Industries",
        icon: "/images/icons/naics.svg",
        rank: 7,
        footer: "110 more",
        url: "/map",
        tiles: [
          {
            title: "Opioid Deaths (Age-Adjusted) by State",
            url: "/map/?level=state&key=opioid_overdose_deathrate_ageadjusted",
            image: "/images/home/maps/total_reimbursements_b.png",
            new: true
          },
          {
            title: "Medicare Reimbursements by County",
            url: "/map/?level=state&key=opioid_overdose_deathrate_ageadjusted",
            image: "/images/home/maps/total_reimbursements_b.png",
            new: false
          }
        ]
      },
      {
        title: "Jobs",
        icon: "/images/icons/soc.svg",
        rank: 5,
        footer: "110 more",
        url: "/map",
        tiles: [
          {
            title: "Opioid Deaths (Age-Adjusted) by State",
            url: "/map/?level=state&key=opioid_overdose_deathrate_ageadjusted",
            image: "/images/home/maps/total_reimbursements_b.png",
            new: true
          },
          {
            title: "Medicare Reimbursements by County",
            url: "/map/?level=state&key=opioid_overdose_deathrate_ageadjusted",
            image: "/images/home/maps/total_reimbursements_b.png",
            new: false
          }
        ]
      },
      {
        title: "Degrees",
        icon: "/images/icons/cip.svg",
        rank: 8,
        footer: "110 more",
        url: "/map",
        tiles: [
          {
            title: "Opioid Deaths (Age-Adjusted) by State",
            url: "/map/?level=state&key=opioid_overdose_deathrate_ageadjusted",
            image: "/images/home/maps/total_reimbursements_b.png",
            new: true
          },
          {
            title: "Medicare Reimbursements by County",
            url: "/map/?level=state&key=opioid_overdose_deathrate_ageadjusted",
            image: "/images/home/maps/total_reimbursements_b.png",
            new: false
          }
        ]
      },
      {
        title: "Download",
        icon: "/images/cart-big.png",
        rank: 6,
        footer: "110 more",
        url: "/map",
        tiles: [
          {
            title: "Opioid Deaths (Age-Adjusted) by State",
            url: "/map/?level=state&key=opioid_overdose_deathrate_ageadjusted",
            image: "/images/home/maps/total_reimbursements_b.png",
            new: true
          },
          {
            title: "Medicare Reimbursements by County",
            url: "/map/?level=state&key=opioid_overdose_deathrate_ageadjusted",
            image: "/images/home/maps/total_reimbursements_b.png",
            new: false
          }
        ]
      },
      {
        title: "Latest Stories",
        icon: "/images/icons/about.svg",
        rank: 4,
        footer: "110 more",
        url: "/map",
        tiles: [
          {
            title: "How to Convert a Site to Canon",
            url: "/map/?level=state&key=opioid_overdose_deathrate_ageadjusted",
            image: "/images/home/maps/total_reimbursements_b.png",
            subtitle: "By Dave Landry",
            new: true
          },
          {
            title: "Medicare Reimbursements by County",
            url: "/map/?level=state&key=opioid_overdose_deathrate_ageadjusted",
            image: "/images/home/maps/total_reimbursements_b.png",
            subtitle: "By Dave Landry",
            new: false
          }
        ]
      }
    ]).end();
  });

};
