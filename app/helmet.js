const title = "Data USA";
const desc = "The most comprehensive visualization of U.S. public data. Data USA provides an open, easy-to-use platform that turns data into knowledge.";

export default {
  link: [
    {rel: "icon", href: "/images/favicon.ico?v=3"},
    {rel: "preconnect", href: "https://fonts.gstatic.com/", crossorigin: "anonymous"},
    {rel: "stylesheet", href: "https://fonts.googleapis.com/css?family=Lato:300|Palanquin:300,400,500,600,700|Source+Sans+Pro:300,400|Pathway+Gothic+One", crossorigin: "anonymous"}
  ],
  meta: [
    {charset: "utf-8"},
    {"http-equiv": "X-UA-Compatible", "content": "IE=edge"},
    {name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"},
    {name: "description", content: desc},
    {property: "og:title", content: title},
    {property: "og:type", content: "article"},
    {property: "og:description", content: desc},
    {property: "fb:app_id", content: "1705281333093640"},
    {name: "mobile-web-app-capable", content: "yes"},
    {name: "apple-mobile-web-app-capable", content: "yes"},
    {name: "apple-mobile-web-app-status-bar-style", content: "black"},
    {name: "apple-mobile-web-app-title", content: title}
  ],
  title
};
