viz.tree_map = function(build) {

  function noAgg(k) {
    return function(leaves) {
      if (leaves.length === 1) return leaves[0][k];
      else return null;
    }
  }

  return {
    "aggs": {
      "avg_wage": noAgg("avg_wage"),
      "avg_wage_moe": noAgg("avg_wage_moe"),
      "avg_wage_rank": noAgg("avg_wage_rank"),
      "avg_wage_ft": noAgg("avg_wage_ft"),
      "avg_wage_ft_moe": noAgg("avg_wage_ft_moe"),
      "avg_wage_ft_rank": noAgg("avg_wage_ft_rank"),
      "avg_wage_pt": noAgg("avg_wage_pt"),
      "avg_wage_pt_moe": noAgg("avg_wage_pt_moe"),
      "avg_wage_pt_rank": noAgg("avg_wage_pt_rank"),
      "avg_hrs": noAgg("avg_hrs"),
      "avg_hrs_moe": noAgg("avg_hrs_moe"),
      "avg_hrs_rank": noAgg("avg_hrs_rank"),
      "avg_hrs_ft": noAgg("avg_hrs_ft"),
      "avg_hrs_ft_moe": noAgg("avg_hrs_ft_moe"),
      "avg_hrs_ft_rank": noAgg("avg_hrs_ft_rank"),
      "avg_hrs_pt": noAgg("avg_hrs_pt"),
      "avg_hrs_pt_moe": noAgg("avg_hrs_pt_moe"),
      "avg_hrs_pt_rank": noAgg("avg_hrs_pt_rank"),
      "avg_age": noAgg("avg_age"),
      "avg_age_moe": noAgg("avg_age_moe"),
      "avg_age_rank": noAgg("avg_age_rank"),
      "med_earnings": noAgg("med_earnings"),
      "med_earnings_moe": noAgg("med_earnings_moe")
    },
    "labels": {
      "align": "left",
      "valign": "top"
    },
    "legend": {
      "filters": true
    },
    // "title": {
    //   "total": {
    //     "font": {
    //       "color": "#444",
    //       "family": "Palanquin",
    //       "size": 14,
    //       "transform": "uppercase",
    //       "weight": 700
    //     },
    //     "value": {
    //       "prefix": dictionary[build.config.size] + ": "
    //     }
    //   }
    // }
  };
}
