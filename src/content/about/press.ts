/** Press coverage listed on /about/press (legacy `api/aboutRoute.js`). */
export interface PressItem {source: string; title: string; link: string; quote: string}

export const press: PressItem[] = [
      {
        source: "The New York Times",
        title: "Website Seeks to Make Government Data Easier to Sift Through",
        link: "http://www.nytimes.com/2016/04/05/technology/datausa-government-data.html",
        quote: "Data USA bills itself as \"the most comprehensive visualization of U.S. public data.\" It is free, and its software code is open source, meaning that developers can build custom applications by adding other data.... \"The goal was organize and visualize data in a way that a lot of people think about it,\" said Patricia Buckley, director of economic policy and analysis at Deloitte..."
      },
      {
        source: "Fast Company Co.Exist",
        title: "Learn Fascinating Tidbits About Your City, With This Government Data Mining Tool",
        link: "http://www.fastcoexist.com/3058629/learn-fascinating-tidbits-about-your-city-with-this-government-data-mining-tool",
        quote: "MIT and Deloitte have created Data USA, an unprecedented effort to make public data more accessible."
      },
      {
        source: "The Atlantic CityLab",
        title: "The One-Stop Digital Shop for Digestible Data on Your City",
        link: "http://www.citylab.com/tech/2016/04/this-new-data-tool-brings-city-data-to-the-surface/476661/",
        quote: "Enter DataUSA, a new, comprehensive, open-source visualization venture launched Monday by Massachusetts Institute of Technology's Media Labs and consulting firm Deloitte... It's essentially a one-stop shop for information that is easy to search, understand, embed, and build into new code."
      },
      {
        source: "The Next Web",
        title: "MIT's New Visualization Tool is a Goldmine for Data Nerds",
        link: "http://thenextweb.com/us/2016/04/04/mits-new-visualization-tool-is-a-goldmine-for-data-nerds/",
        quote: "MIT Media Lab, in partnership with Deloitte and the data visualization startup Datawheel, has just gone live with perhaps the most extensive tool ever created for mining and visualizing US government open data, called Data USA... The team behind it is already starting to tell stories using the data they've curated..."
      },
      {
        source: "InfoWorld",
        title: "Visualizing Data That Matters",
        link: "http://www.infoworld.com/article/3051144/analytics/visualizing-data-that-matters.html",
        quote: "For years I've seen various attempts to aggregate public data relevant to key issues of the day and make them available on the Internet in interactive graphical form. The latest effort, launching today, looks promising: Data USA is a free and open platform created collaboratively by Deloitte, MIT Media Lab, and Datawheel, a Media Lab spinoff."
      }
    ];
