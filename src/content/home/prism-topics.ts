/** PeoplePrism promo on the home page (legacy `PRISM_TOPICS` in `Home/index.jsx`). */
export interface PrismTopic {title: string; color: string; links: {label: string; href: string; more?: boolean}[]}

export const PRISM_TOPICS: PrismTopic[] = [
  {
    title: "Healthcare Access",
    color: "#00adac",
    links: [
      {label: "California Health Coverage", href: "/profile/geo/california#coverage"},
      {label: "New York Health Coverage", href: "/profile/geo/new-york#coverage"},
      {label: "Texas Health Coverage", href: "/profile/geo/texas#coverage"},
      {label: "and many more", href: "/search?dimension=Geography&hierarchy=State", more: true}
    ]
  },
  {title: "Food Pantry Access", color: "#E78F45", links: []},
  {title: "Food Insecurity", color: "#C73333", links: []},
  {title: "Skills & Job Market", color: "#057CB0", links: []}
];
