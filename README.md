# Data USA v3

## Profile API Flow

URL format: `/api/profile/geo/<id>`

### First Step: Prep Variables

1. db.get("the database variable generators")
(array of names, URLs, and JS blobs from the database)
2. group generators by URL (d3.nest)
3. Promise.all([...generator URLs])

> Example Logic

```js
axios.get("the generator url")
  .then(resp => {
    // expecting a variable called "variables"
    eval("the generator JS"); // for each generator (because we nest by URL)
    return variables;
  });

Promise.all([...generator promises])
  .then(results => {
    const variables = {...results};
  })
```

4. db.get("the materialized variable generators") // array of names and JS blobs from the database
5. eval all materialized JS blobs while rescuing return object after each eval

## Second Step: Fill/flow Variables

0. db.get("the formatters")
(array of names, descriptions, and JS blobs)
1. db.get("the profile meta stuff")
2. fill and format profile level texts/viz
3. db.get("the section meta stuff")
4. fill and format section meta information (title & description)
5. db.get("the topic meta stuff")
6. fill and format topic level texts/viz

> Example return:

```json
{
  "title": "New York, NY",
  "description": "Census Designated Place",
  "introduction": "Welcome to the profile page for New York, NY.",
  "stats": [
    {
      "title": "Population",
      "value": "8.5M",
      "subtitle": "2.4% Growth"
    }
  ],
  "visualizations": [
    {
      "data": "https://my-long-data-url-that-I-will-provide-as-a-content-creator",
      "groupBy": "geo",
      "type": "BarChart",
      "x": "year",
      "y": "pop"
    }
  ],
  "variables": {
    "name": "New York, NY",
    "pop_2015": 2523647,
    "pop_2016": 2234098
  },
  "sections": [
    {
      "title": "Economy",
      "slug": "economy",
      "description": "Yo, this be about money.",
      "stats": [
        {
          "title": "Population",
          "value": "8.5M",
          "subtitle": "2.4% Growth"
        }
      ],
      "topics": [
        {
          "title": "Population Over Time",
          "slug": "pop_time",
          "subtitle": "Warning! This data is not granular!",
          "description": "<p>The population in New York, NY as of 2015 was 2.5M.",
          "type": "TextViz",
          "visualizations": [
            {
              "data": "https://my-long-data-url-that-I-will-provide-as-a-content-creator",
              "groupBy": "geo",
              "type": "BarChart",
              "x": "year",
              "y": "pop"
            }
          ]
        }
      ]
    }
  ]
}
```
