#! /usr/bin/env node

const axios = require("axios"),
      shell = require("shelljs");

const states= ["04000US01","04000US02","04000US04","04000US05","04000US06","04000US08","04000US09","04000US10","04000US11","04000US12","04000US13","04000US15","04000US16","04000US17","04000US18","04000US19","04000US20","04000US21","04000US22","04000US23","04000US24","04000US25","04000US26","04000US27","04000US28","04000US29","04000US30","04000US31","04000US32","04000US33","04000US34","04000US35","04000US36","04000US37","04000US38","04000US39","04000US40","04000US41","04000US42","04000US44","04000US45","04000US46","04000US47","04000US48","04000US49","04000US50","04000US51","04000US53","04000US54","04000US55","04000US56","04000US60","04000US66","04000US69","04000US72","04000US78"];

const urls = [
  "https://datausa.io/api/data?drilldowns=Party,Winning%20Candidate&measures=House%20Winner%20Votes,House%20Total%20Votes&Geography=<id>:districts&Election%20Type=0&Year=all",
  "https://datausa.io/api/data?drilldowns=Party,Candidate&measures=Senate%20Candidate%20Votes,Senate%20Total%20Votes&Geography=<id>&Election%20Type=0",
  "https://datausa.io/api/data?Geography=<id>:childrenCounty&measure=Candidate%20Votes,Total%20Votes"
]

/** */
async function run() {
  for (state of states) {
    console.log(state);
    for (url of urls) {
      const fullUrl = url.replace("<id>", state);
      const data = await axios.get(fullUrl).then(resp => resp.data.data);
      if (!data.length) {
        console.log("clearing: ", urls.indexOf(url));
        await axios.get(fullUrl, {headers: {"X-Update": "1", "x-cache-status": "BYPASS"}});
      }
    }
  }
}

run();
