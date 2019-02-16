module.exports = function(app) {

  app.get("/api/datasets", (req, res) => {
    res.json(app.settings.cache.datasets);
  });

  app.get("/api/press", (req, res) => {
    res.json([
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
    ]).end();
  });

  app.get("/api/team", (req, res) => {
    res.json([
      {
        title: "Datawheel",
        members: [
          {
            name: "César Hidalgo",
            img: "/images/story/authors/hidalgo.png",
            title: "Co-founder",
            twitter: "https://twitter.com/cesifoti",
            about: [
              "César is the ABC Career Development Professor at the MIT Media Lab and director of the Lab's Collective Learning group. He has ten years of experience in metadata analysis and representation and has been involved in over 30 academic publications exploring its possible uses."
            ]
          },
          {
            name: "Dave Landry",
            img: "/images/story/authors/landry.png",
            title: "Co-founder",
            twitter: "https://twitter.com/davelandry",
            about: [
              "Dave holds a dual-degree in graphic design and multimedia studies from Northeastern University and has past experience in print design, video game production and as art director of Boston-based music magazine.",
              "When not hooked into his computers Dave likes to kick back with a cheesy comic book movie and go for long walks on the beach with is his four-legged friend, Lucy."
            ]
          },
          {
            name: "Alex Simoes",
            img: "/images/story/authors/simoes.png",
            title: "Co-founder",
            twitter: "https://twitter.com/ximoes",
            about: [
              "Alex comes to Datawheel from the MIT Media Lab, where he focused on data decision-making tools and using visual techniques to understand data, in addition to creating the OEC as his master's thesis.",
              "Besides data and design, Alex spends his free time engaging in every type of art. He even plays guitar in a band called The Hard Clean."
            ]
          },
          {
            name: "Jonathan Speiser",
            img: "/images/story/authors/speiser.png",
            title: "Chief Software Architect",
            twitter: "https://twitter.com/jspeis",
            about: [
              "Jonathan is a graduate of the MIT Media Lab by way of Goldman Sachs, where he worked as a software developer to improve the firm's virtualization and cloud computing infrastructure.",
              "Jonathan previously volunteered with the City of Cambridge Broadband Taskforce. On a good day, he may be spotted cheering at Fenway as the Red Sox lose to the Yankees."
            ]
          },
          {
            name: "Melissa Teng",
            img: "/images/story/authors/teng.png",
            title: "Designer",
            twitter: "https://twitter.com/melisteng",
            about: [
              "Melissa is a Sapient-trained web designer who graduated from Rice University with a degree in Economics. She's Datawheel's go-to design expert whose artistic skill ranges from the physical to the digital.",
              "On the side Melissa curates a gallery with artists from marginalized communities."
            ]
          },
          {
            name: "Matt Rosadini",
            img: "/images/story/authors/rosadini.png",
            title: "Administration",
            about: [
              "Matt is a graduate of Northeastern University who has spent his professional life encouraging young creative businesses. His professional talents include programming, operations and photography, among others.",
              "Matt balances his work life with a strong dose of niche hobbies: coin collecting, metal detecting, recreational bowling, reading and anything outdoors."
            ]
          },
          {
            name: "Walther Chen",
            img: "/images/story/authors/chen.png",
            title: "Full Stack Software Developer",
            about: [
              "In former lives, Walther was a lawyer and a martial arts instructor. Now he writes back-end services and wrangles data. On the side, he plays the game of Go and practices yoga."
            ]
          },
          {
            name: "Jimmy Mullen",
            img: "/images/story/authors/mullen.png",
            title: "Full Stack Engineer",
            about: [
              "Jimmy is a Northeastern University Computer Science graduate with over 10 years of experience in Game Design, Web Programming, and Distributed Databases.",
              "When not coding, Jimmy enjoys playing music, cycling, storytelling, board games, and inside jokes."
            ]
          },
          {
            name: "Francisco Abarzúa",
            img: "/images/story/authors/abarzua.png",
            title: "Full Stack Developer",
            about: [
              "Although Francisco attained a degree in Chemical Engineering from the University of Concepción, he enjoys experimenting with web and server technologies. He's worked on a diverse array of public service projects, including data visualization.",
              "He also enjoys murder mystery games, chats with friends, and disassembling things."
            ]
          },
          {
            name: "Carlos Navarrete",
            img: "/images/story/authors/navarrete.png",
            title: "Front-End Developer",
            about: [
              "Carlos is an industrial engineer that loves web programming. Since attending University of Concepción, he has tried to make technology more accessible to the people.",
              "When not coding, Carlos attempts to be a pastry cook. He is a real fan of milk caramel spread."
            ]
          },
          {
            name: "Pablo H. Paladino",
            img: "/images/story/authors/paladino.png",
            title: "Front-End Developer",
            about: [
              "Pala has a degree in System Analysis focused in frontend development and interactive data visualization. An open data activist, he has built solutions and interactive pieces based on data driven journalism. He previously worked as a software developer and consultant in the modernization units for both the Argentinian and Chilean governments.",
              "Music, soccer, bike and banana lover."
            ]
          },
          {
            name: "Victor Bebo",
            img: "/images/story/authors/bebo.png",
            title: "Operations Manager",
            about: [
              "Victor has a diverse employment background; he has worked at a sheet metal shop, as a plumber, and for a decade at Apple. In school he studied psychology & philosophy. He now handles logistics at Datawheel so the team can focus on their craft.",
              "When OOO you can find him playing video games, watching movies (preferably 35mm), at a table playing D&D, or watching Twitch Streams, typically while snugging his cat, Nebula."
            ]
          }
        ]
      },
      {
        title: "Deloitte",
        members: [
          {
            name: "Ann Perrin",
            img: "/images/story/authors/perrin.png",
            about: [
              "Ann is a senior research executive with Deloitte Services LP. She leads Deloitte's relationship with MIT Media Lab and is the co-leader of DataUSA. Starting in 1996, Ann launched and directed Deloitte Research and developed thought leadership capabilities across multiple industries (e.g. Consumer & Industrial Products, Energy, Financial Services, Healthcare & Life Sciences, and Technology, Media & Telecommunications) in the US, Europe and Japan. She has established collaborations with leading universities, technologists and institutes around the world to work on research, workshops and commercial projects. Ann brings over 20 years of experience researching disruptive technologies and the strategic, operational and organizational issues critical to performance. She is an author of multiple articles and reports that have been featured in publications such as the Financial Times, Wall Street Journal, Economist and Harvard Business Review.",
              "Ann holds a Bachelor of Arts from the University of California at Berkeley and Masters from the University of California at Los Angeles. She sits on the boards of the University of California Berkeley Foundation and the Berkeley Art Museum and Pacific Film Archive."
            ]
          },
          {
            name: "William Eggers",
            img: "/images/story/authors/eggers.png",
            twitter: "https://twitter.com/wdeggers",
            about: [
              "An author, columnist, consultant, and popular speaker for more than two decades, William Eggers is a leading authority on government reform. He is responsible for research and thought leadership for Deloitte's public sector industry practice.",
              "His nine books include The Solution Revolution: How Government, Business, and Social Enterprises are Teaming up to Solve Society's Biggest Problems (Harvard Business Review Press 2013). The book, which The Wall Street Journal calls \"pulsating with new ideas about civic and business and philanthropic engagement,\" was named to ten best books of the year lists.",
              "His other books include The Washington Post best seller If We Can Put a Man on the Moon: Getting Big Things Done in Government (Harvard Business Press, 2009), Governing by Network (Brookings, 2004), and The Public Innovator's Playbook (Deloitte Research 2009). He coined the term Government 2.0 in a book by the same name.",
              "His books have won numerous awards including the 2014 Axiom award for best book on business theory, the Louis Brownlow award for best book on public management, the Sir Antony Fisher award for best book promoting an understanding of the free economy, and the Roe Award for leadership and innovation in public policy research.",
              "A former manager of the Texas Performance Review, he has advised governments around the world. His commentary has appeared in dozens of major media outlets including the New York Times, Wall Street Journal, and the Chicago Tribune. He lives in Washington, DC with his wife Morgann."
            ]
          },
          {
            name: "Dr. Patricia Buckley",
            title: "Deloitte US Economist",
            img: "/images/story/authors/buckley.png",
            about: [
              "Patricia Buckley started at Deloitte in September 2012 as the Director for Economic Policy and Analysis with responsibility for contributing to Deloitte's Eminence Practice with a focus on economic policy.",
              "She regularly briefs members of Deloitte's executive leadership team on changes to the US economic outlook and is responsible for the US chapter of Deloitte's quarterly Global Economic Outlook and produces \"Issues by the Numbers,\" a data-driven examination of important economic policy issues. Additionally, she partners with various practice areas to produce topical eminence and is a frequent speaker at Deloitte events discussing current economic policy and trends.",
              "Previously, Patricia served as the Senior Economic Policy Advisor to four Secretaries of Commerce where she provided regular briefings to the Secretary in preparation for Cabinet meetings, press interviews, and discussions with business and foreign leaders.  While at Commerce, she served as policy point person for several key strategic initiatives related to maintaining U.S. competitiveness, revitalizing the manufacturing sector, and reforming the country's immigration system.  She also served as executive director to the Secretary's Advisory Committee on \"Measuring Innovation in the 21st Century.\" Earlier in her career, Patricia was an economist at the Manufacturers Alliance, a policy research organization, and the Joint Economic Committee of Congress.",
              "Patricia has a Ph.D. in Economics from Georgetown University and a B.S. degree in Economics from Clemson University."
            ]
          },
          {
            name: "Danny Bachman, Ph.D.",
            img: "/images/story/authors/bachman.png",
            twitter: "https://twitter.com/bachman_d",
            about: [
              "Danny Bachman is in charge of U.S. economic forecasting for Deloitte's Eminence and Strategy functions. He is an experienced U.S. and international macroeconomic forecaster and modeler. Dr. Bachman came to Deloitte from IHS economics, where he was in charge of IHS's Center for Forecasting and Modeling. Prior to that, he worked as a forecaster and economic analyst at the US Commerce Department, was responsible for U.S. economic forecasting and modeling at WEFA (previously Wharton Econometric Forecasting Associates) and taught international economics at Temple University. His first professional job was at Israel's Ministry of Finance.",
              "Dr. Bachman is a native of Philadelphia. He has a B.A. from Johns Hopkins and Ph.D. from Brown University. Dr. Bachman lives in Rockville, Maryland with his wife, but without his two millennial children, who-evidently defying the odds-have not returned home after college. Yet."
            ]
          },
          {
            name: "Peter Viechnicki",
            img: "/images/story/authors/viechnicki.png",
            about: [
              "Peter is a strategic analysis manager and data scientist in Deloitte Services LP's Public Sector Eminence group. His research focuses on opportunities created by new analytic techniques within Federal and State government programs. He has a particular passion for open data and standards.  Peter previously served as a federal officer in the US intelligence community, and has expertise in natural language processing and geospatial techniques."
            ]
          },
          {
            name: "Matt Gentile",
            img: "/images/story/authors/gentile.png",
            about: [
              "Matt is a principal and leader of Deloitte's Federal Strategic Risk Market Offering and Deloitte's Geospatial practice. Matthew is a recognized innovator and entrepreneur in the analytics community, dedicating the past 18 years to working at the intersection of commerce, public policy and geospatial technology. In his role at Deloitte, Matt has made significant contributions to the analytics community through advising Federal agencies and Fortune 500 companies on the collaborative exchange, display and analysis of data. Matt holds a Bachelor of Science from Indiana University and a Master degree from the Massachusetts Institute of Technology (MIT). In 2013, he was appointed to the National Geospatial Advisory Committee (NGAC) by the Secretary of the Interior to help inform the development and implementation of the National Spatial Data Infrastructure (NSDI) and the federal government's geospatial platform. Matt is also on the Advisory Board for Indiana University's School of Public and Environmental Affairs."
            ]
          }
        ]
      }
    ]).end();
  });

};
