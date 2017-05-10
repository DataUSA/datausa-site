# -*- coding: utf-8 -*-
import copy, json, re, requests
from flask import Blueprint, g, render_template, request, url_for, redirect, abort
from config import API
from datausa import app
from datausa.consts import AFFIXES, COLMAP, DICTIONARY, PERCENTAGES, PROPORTIONS, PER1000, PER10000, PER100000, SUMLEVELS
from datausa.story.models import StoryPreview
from datausa.utils.data import attr_cache, datafold, fetch, profile_cache, story_cache
from datausa.utils.format import num_format
from pagination import Pagination

from .home import HOMEFEED, TYPEMAP

mod = Blueprint("general", __name__)

@app.before_request
def before_request():
    g.cache_version = 44
    g.cart_limit = 5
    g.affixes = json.dumps(AFFIXES)
    g.colmap = json.dumps(COLMAP)
    g.dictionary = json.dumps(DICTIONARY)
    g.percentages = json.dumps(PERCENTAGES)
    g.proportions = json.dumps(PROPORTIONS)
    g.per1000 = json.dumps(PER1000)
    g.per10000 = json.dumps(PER10000)
    g.per100000 = json.dumps(PER100000)
    g.api = API
    g.compare = False

@mod.route("/")
def home():
    g.page_type = "home"
    g.video = request.args.get("video", False)

    feed = [copy.copy(f) for f in HOMEFEED]
    for box in feed:
        if "featured" not in box:
            box["featured"] = False
        if "/profile/" in box["link"]:
            attr_type = box["link"].split("/")[2]
            attr_id = box["link"].split("/")[3]
            attr = fetch(attr_id, attr_type)
            box["subtitle"] = attr["display_name"] if "display_name" in attr else attr["name"]
            section = [s for s in profile_cache[attr_type]["sections"] if s["anchor"] == box["section"]][0]
            box["section"] = {
                "title": section["title"],
                "icon": "/static/img/icons/{}.svg".format(box["section"])
            }
            sumlevel = attr["sumlevel"] if "sumlevel" in attr else attr["level"]
            if attr_type == "cip":
                sumlevel = (sumlevel + 1) * 2
            sumlevel = str(sumlevel)
            sumlevel = SUMLEVELS[attr_type][sumlevel]
            sumlevel = sumlevel["shortlabel"] if "shortlabel" in sumlevel else sumlevel["label"]
            box["type"] = {
                "icon": "/static/img/icons/{}.svg".format(attr_type),
                "title": "Profile",
                "type": TYPEMAP[attr_type],
                "depth": sumlevel.replace("_"," ")
            }
            img_type = "profile" if box["featured"] else "search"
            box["image"] = "/{}/{}/{}/img".format(img_type, attr_type, attr_id)
        elif "/story/" in box["link"]:
            box["type"] = {
                "icon": "/static/img/icons/about.svg",
                "title": TYPEMAP["story"],
                "type": "story"
            }
            story = [s for s in story_cache if s["story_id"] == box["link"].split("/")[2]][0]
            box["image"] = story["background_image"]
            box["title"] = story["title"]
            box["subtitle"] = story["description"]
            box["author"] = "By {}".format(story["authors"][0]["name"])
        elif "/map/" in box["link"]:
            box["type"] = {
                "icon": "/static/img/icons/demographics.svg",
                "title": TYPEMAP["map"],
                "type": "map"
            }
            box["viz"] = "geo_map"

    carousels = [
        {
            "title": "Youngest Counties in America",
            "url": "/api/?sumlevel=county&required=age&show=geo&year=latest&order=age&sort=asc"
        },
        {
            "title": "Most Popular College Majors",
            "url": "/api/?sumlevel=6&required=grads_total&show=cip&year=latest&order=grads_total&sort=desc"
        },
        {
            "title": "Highest Paying Industries",
            "url": "/api/?sumlevel=2&required=avg_wage&show=naics&year=latest&order=avg_wage&sort=desc&num_records:>4"
        },
        {
            "title": "Occupations with the Highest Part-time Salary",
            "url": "/api/?sumlevel=3&required=avg_wage_pt&show=soc&year=latest&order=avg_wage_pt&sort=desc&num_records:>4"
        }
    ]
    carouselMax = 20

    sumlevelMap = {
        "nation": "010",
        "state": "040",
        "county": "050",
        "msa": "310",
        "place": "160",
        "zip": "860",
        "tract": "140",
        "puma": "795"
    };

    for carousel in carousels:

        url = "{}{}&limit={}".format(API, carousel["url"], carouselMax)
        r = requests.get(url).json()

        show = re.findall(r"show=([a-z_0-9]+)", url)[0]
        order = re.findall(r"order=([a-z_0-9]+)", url)[0]
        sumlevel = re.findall(r"sumlevel=([a-z_0-9]+)", url)[0]
        if show == "geo":
            sumlevel = sumlevelMap[sumlevel]
        data = datafold(r)

        for d in data:
            attr_id = d[show]
            attr = fetch(attr_id, show)
            slug = attr["url_name"] if attr["url_name"] else attr_id
            d["title"] = attr["display_name"] if "display_name" in attr else attr["name"]
            d["subtitle"] = "{}: {}".format(DICTIONARY[order], num_format(d[order], order))
            d["link"] = "/profile/{}/{}".format(show, slug)
            d["image"] = "/search/{}/{}/img".format(show, attr_id)
            d["type"] = {
                "icon": "/static/img/icons/{}.svg".format(show),
                "title": SUMLEVELS[show][sumlevel]["label"],
                "type": TYPEMAP[show],
                "depth": "{}".format(sumlevel).replace("_", " ")
            }

        carousel["data"] = data
        carousel["source"] = r["source"]

    stories = StoryPreview.generate_list()[0]
    for i, story in enumerate(stories):
        stories[i] = {
            # "featured": i == 0,
            "link": "/story/{}".format(story.story_id),
            "image": story.background_image,
            "title": story.title,
            "subtitle": "By {}".format(story.authors[0]["name"]),
            "type": {
                "icon": "/static/img/icons/about.svg",
                "title": TYPEMAP["story"],
                "type": "story"
            }
        }

    carousels.insert(0, {
        "title": "Latest Stories",
        "data": stories
    })

    return render_template("general/home_v3.html", feed=feed, carousels=carousels)

@mod.route("/about/")
def about():
    g.page_type = "about"
    g.page_sub_type = "index"
    return render_template("about/index.html")

@mod.route("/about/datasets/")
def datasets():
    g.page_type = "about"
    g.page_sub_type = "datasets"
    return render_template("about/datasets.html")

@mod.route("/about/glossary/")
def glossary():
    g.page_type = "about"
    g.page_sub_type = "glossary"
    return render_template("about/glossary.html")

@mod.route("/about/api/")
def api():
    g.page_type = "about"
    g.page_sub_type = "api"
    return render_template("about/api.html")

@mod.route("/about/attributes/")
@mod.route("/about/attributes/<attr_type>/")
@mod.route("/about/attributes/<attr_type>/<sumlevel>/")
def attributes_redir(attr_type="geo", sumlevel=None):
    sumlevel_key = 'sumlevel' if attr_type == "geo" else 'shortlabel'
    sumlevels = {sv[sumlevel_key]:dict(sv.items() + [('id',sk)]) for sk, sv in SUMLEVELS[attr_type].items() if sk != "140" and sk != "860"}
    this_sumlevel = sumlevel or sumlevels.keys()[0]
    return redirect(url_for('.attributes', attr_type=attr_type, sumlevel=this_sumlevel, page=1))

@mod.route("/about/attributes/<attr_type>/<sumlevel>/<int:page>/")
def attributes(attr_type, sumlevel, page):
    args = request.view_args.copy()
    g.page_type = "about"
    g.page_sub_type = "attributes"
    sumlevel_key = 'sumlevel' if attr_type == "geo" else 'shortlabel'
    sorting = request.args.get("sort")
    ordering = request.args.get("order", '')
    PER_PAGE = 100
    offset = PER_PAGE * (page - 1)

    sumlevels = {sv[sumlevel_key]:dict(sv.items() + [('id',sk)]) for sk, sv in SUMLEVELS[attr_type].items() if sk != "140" and sk != "860"}
    this_sumlevel = sumlevel or sumlevels.keys()[0]
    this_sumlevel = sumlevels[this_sumlevel]

    if attr_type == "geo":
        attrs = [a for a in attr_cache[attr_type].values() if a['sumlevel'] == this_sumlevel['id'] and 'pretty' in a]
        anchor_key = "url_name"
        name_key = "display_name"
    elif attr_type == "cip":
        attrs = [a for a in attr_cache[attr_type].values() if len(a['id']) == int(this_sumlevel['id'])]
        anchor_key = "id"
        name_key = "name"
    else:
        attrs = [a for a in attr_cache[attr_type].values() if str(a['level']) == this_sumlevel['id']]
        anchor_key = "id"
        name_key = "name"

    headers = [{"name":"ID", "id":"id", "key":"id"}, {"name":"Name", "id":"name", "key":name_key, "anchor_key":anchor_key}]

    # fetch parent State for PUMAs, Places and Counties
    if this_sumlevel["id"] in ['795', '160', '050']:
        headers = headers[:1] + [{"name":"State", "id":"state_name", "key":"state_name", "anchor_key":"state_anchor"},] + headers[1:]
        states = {a["id"][7:9]:a for a in attr_cache[attr_type].values() if a['sumlevel'] == "040" and 'pretty' in a}
        for a in attrs:
            state_id = a["id"][7:9]
            a["state_name"] = states[state_id]["name"]
            a["state_anchor"] = states[state_id]["url_name"]

    sort_key = name_key if sorting == "name" else sorting
    sort_key = sort_key or "id"
    isreversed = True if ordering == "asc" else False
    attrs = sorted(attrs, key=lambda x: x[sort_key], reverse=isreversed)

    count = len(attrs)
    attrs = attrs[offset:(offset+PER_PAGE)]
    if not attrs and page != 1:
        abort(404)

    pagination = Pagination(page, PER_PAGE, count, sorting, ordering)

    return render_template("about/attributes.html",
                            attr_type=attr_type,
                            anchor_key=anchor_key,
                            name_key=name_key,
                            sumlevels=sumlevels,
                            pagination=pagination,
                            this_sumlevel=this_sumlevel,
                            headers=headers,
                            attrs=attrs)

@mod.route("/about/usage/")
def usage():
    g.page_type = "about"
    g.page_sub_type = "usage"
    return render_template("about/usage.html")

@mod.route("/about/press/")
def press():
    g.page_type = "about"
    g.page_sub_type = "press"

    press = [
        {
            "source": "The New York Times",
            "title": "Website Seeks to Make Government Data Easier to Sift Through",
            "link": "http://www.nytimes.com/2016/04/05/technology/datausa-government-data.html",
            "quote": "Data USA bills itself as \"the most comprehensive visualization of U.S. public data.\" It is free, and its software code is open source, meaning that developers can build custom applications by adding other data.... \"The goal was organize and visualize data in a way that a lot of people think about it,\" said Patricia Buckley, director of economic policy and analysis at Deloitte..."
        },
        {
            "source": "Fast Company Co.Exist",
            "title": "Learn Fascinating Tidbits About Your City, With This Government Data Mining Tool",
            "link": "http://www.fastcoexist.com/3058629/learn-fascinating-tidbits-about-your-city-with-this-government-data-mining-tool",
            "quote": "MIT and Deloitte have created Data USA, an unprecedented effort to make public data more accessible."
        },
        {
            "source": "The Atlantic CityLab",
            "title": "The One-Stop Digital Shop for Digestible Data on Your City",
            "link": "http://www.citylab.com/tech/2016/04/this-new-data-tool-brings-city-data-to-the-surface/476661/",
            "quote": "Enter DataUSA, a new, comprehensive, open-source visualization venture launched Monday by Massachusetts Institute of Technology's Media Labs and consulting firm Deloitte... It's essentially a one-stop shop for information that is easy to search, understand, embed, and build into new code."
        },
        {
            "source": "The Next Web",
            "title": "MIT's New Visualization Tool is a Goldmine for Data Nerds",
            "link": "http://thenextweb.com/us/2016/04/04/mits-new-visualization-tool-is-a-goldmine-for-data-nerds/",
            "quote": "MIT Media Lab, in partnership with Deloitte and the data visualization startup Datawheel, has just gone live with perhaps the most extensive tool ever created for mining and visualizing US government open data, called Data USA... The team behind it is already starting to tell stories using the data they've curated..."
        },
        {
            "source": "InfoWorld",
            "title": "Visualizing Data That Matters",
            "link": "http://www.infoworld.com/article/3051144/analytics/visualizing-data-that-matters.html",
            "quote": "For years I've seen various attempts to aggregate public data relevant to key issues of the day and make them available on the Internet in interactive graphical form. The latest effort, launching today, looks promising: Data USA is a free and open platform created collaboratively by Deloitte, MIT Media Lab, and Datawheel, a Media Lab spinoff."
        }
    ]
    return render_template("about/press.html", press=press)

@mod.route("/about/team/")
def team():
    g.page_type = "about"
    g.page_sub_type = "team"
    datawheel = [
        {
            "name": u"César Hidalgo",
            "img": "/static/img/story/authors/hidalgo.png",
            "title": "Co-founder",
            "twitter": "https://twitter.com/cesifoti",
            "about": [
                u"César is the ABC Career Development Professor at the MIT Media Lab and director of the Lab's Macro Connections group. He has ten years of experience in metadata analysis and representation and has been involved in over 30 academic publications exploring its possible uses."
            ]
        },
        {
            "name": "Dave Landry",
            "img": "/static/img/story/authors/landry.png",
            "title": "Co-founder",
            "twitter": "https://twitter.com/davelandry",
            "about": [
                "Dave holds a dual-degree in graphic design and multimedia studies from Northeastern University and has past experience in print design, video game production and as art director of Boston-based music magazine.",
                "When not hooked into his computers Dave likes to kick back with a cheesy comic book movie and go for long walks on the beach with is his four-legged friend, Lucy."
            ]
        },
        {
            "name": "Alex Simoes",
            "img": "/static/img/story/authors/simoes.png",
            "title": "Co-founder",
            "twitter": "https://twitter.com/ximoes",
            "about": [
                "Alex comes to Datawheel from the MIT Media Lab, where he focused on data decision-making tools and using visual techniques to understand data, in addition to creating the OEC as his master's thesis.",
                "Besides data and design, Alex spends his free time engaging in every type of art. He even plays guitar in a band called The Hard Clean."
            ]
        },
        {
            "name": "Jonathan Speiser",
            "img": "/static/img/story/authors/speiser.png",
            "title": "Chief Software Architect",
            "twitter": "https://twitter.com/jspeis",
            "about": [
                "Jonathan is a graduate of the MIT Media Lab by way of Goldman Sachs, where he worked as a software developer to improve the firm's virtualization and cloud computing infrastructure.",
                "Jonathan previously volunteered with the City of Cambridge Broadband Taskforce. On a good day, he may be spotted cheering at Fenway as the Red Sox lose to the Yankees."
            ]
        },
        {
            "name": "Melissa Teng",
            "img": "/static/img/story/authors/teng.png",
            "title": "Designer",
            "twitter": "https://twitter.com/melisteng",
            "about": [
                "Melissa is a Sapient-trained web designer who graduated from Rice University with a degree in Economics. She's Datawheel's go-to design expert whose artistic skill ranges from the physical to the digital.",
                "On the side Melissa curates a gallery with artists from marginalized communities."
            ]
        },
        {
            "name": "Matt Rosadini",
            "img": "/static/img/story/authors/rosadini.png",
            "title": "Administration",
            "about": [
                "Matt is a graduate of Northeastern University who has spent his professional life encouraging young creative businesses. His professional talents include programming, operations and photography, among others.",
                "Matt balances his work life with a strong dose of niche hobbies: coin collecting, metal detecting, recreational bowling, reading and anything outdoors."
            ]
        }
    ]
    deloitte = [
        {
            "name": "Ann Perrin",
            "img": "/static/img/story/authors/perrin.png",
            "about": [
                "Ann is a senior research executive with Deloitte Services LP. She leads Deloitte's relationship with MIT Media Lab and is the co-leader of DataUSA. Starting in 1996, Ann launched and directed Deloitte Research and developed thought leadership capabilities across multiple industries (e.g. Consumer & Industrial Products, Energy, Financial Services, Healthcare & Life Sciences, and Technology, Media & Telecommunications) in the US, Europe and Japan. She has established collaborations with leading universities, technologists and institutes around the world to work on research, workshops and commercial projects. Ann brings over 20 years of experience researching disruptive technologies and the strategic, operational and organizational issues critical to performance. She is an author of multiple articles and reports that have been featured in publications such as the Financial Times, Wall Street Journal, Economist and Harvard Business Review.",
                "Ann holds a Bachelor of Arts from the University of California at Berkeley and Masters from the University of California at Los Angeles. She sits on the boards of the University of California Berkeley Foundation and the Berkeley Art Museum and Pacific Film Archive."
            ]
        },
        {
            "name": "William Eggers",
            "img": "/static/img/story/authors/eggers.png",
            "twitter": "https://twitter.com/wdeggers",
            "about": [
                "An author, columnist, consultant, and popular speaker for more than two decades, William Eggers is a leading authority on government reform. He is responsible for research and thought leadership for Deloitte's public sector industry practice.",
                "His nine books include The Solution Revolution: How Government, Business, and Social Enterprises are Teaming up to Solve Society's Biggest Problems (Harvard Business Review Press 2013). The book, which The Wall Street Journal calls \"pulsating with new ideas about civic and business and philanthropic engagement,\" was named to ten best books of the year lists.",
                "His other books include The Washington Post best seller If We Can Put a Man on the Moon: Getting Big Things Done in Government (Harvard Business Press, 2009), Governing by Network (Brookings, 2004), and The Public Innovator's Playbook (Deloitte Research 2009). He coined the term Government 2.0 in a book by the same name.",
                "His books have won numerous awards including the 2014 Axiom award for best book on business theory, the Louis Brownlow award for best book on public management, the Sir Antony Fisher award for best book promoting an understanding of the free economy, and the Roe Award for leadership and innovation in public policy research.",
                "A former manager of the Texas Performance Review, he has advised governments around the world. His commentary has appeared in dozens of major media outlets including the New York Times, Wall Street Journal, and the Chicago Tribune. He lives in Washington, DC with his wife Morgann."
            ]
        },
        {
            "name": "Dr. Patricia Buckley",
            "title": "Deloitte US Economist",
            "img": "/static/img/story/authors/buckley.png",
            "about": [
                "Patricia Buckley started at Deloitte in September 2012 as the Director for Economic Policy and Analysis with responsibility for contributing to Deloitte's Eminence Practice with a focus on economic policy.",
                "She regularly briefs members of Deloitte's executive leadership team on changes to the US economic outlook and is responsible for the US chapter of Deloitte's quarterly Global Economic Outlook and produces \"Issues by the Numbers,\" a data-driven examination of important economic policy issues. Additionally, she partners with various practice areas to produce topical eminence and is a frequent speaker at Deloitte events discussing current economic policy and trends.",
                "Previously, Patricia served as the Senior Economic Policy Advisor to four Secretaries of Commerce where she provided regular briefings to the Secretary in preparation for Cabinet meetings, press interviews, and discussions with business and foreign leaders.  While at Commerce, she served as policy point person for several key strategic initiatives related to maintaining U.S. competitiveness, revitalizing the manufacturing sector, and reforming the country's immigration system.  She also served as executive director to the Secretary's Advisory Committee on \"Measuring Innovation in the 21st Century.\" Earlier in her career, Patricia was an economist at the Manufacturers Alliance, a policy research organization, and the Joint Economic Committee of Congress.",
                "Patricia has a Ph.D. in Economics from Georgetown University and a B.S. degree in Economics from Clemson University."
              ]
        },
        {
            "name": "Danny Bachman, Ph.D.",
            "img": "/static/img/story/authors/bachman.png",
            "twitter": "https://twitter.com/bachman_d",
            "about": [
                "Danny Bachman is in charge of U.S. economic forecasting for Deloitte's Eminence and Strategy functions. He is an experienced U.S. and international macroeconomic forecaster and modeler. Dr. Bachman came to Deloitte from IHS economics, where he was in charge of IHS's Center for Forecasting and Modeling. Prior to that, he worked as a forecaster and economic analyst at the US Commerce Department, was responsible for U.S. economic forecasting and modeling at WEFA (previously Wharton Econometric Forecasting Associates) and taught international economics at Temple University. His first professional job was at Israel's Ministry of Finance.",
                "Dr. Bachman is a native of Philadelphia. He has a B.A. from Johns Hopkins and Ph.D. from Brown University. Dr. Bachman lives in Rockville, Maryland with his wife, but without his two millennial children, who-evidently defying the odds-have not returned home after college. Yet."
            ]
        },
        {
            "name": "Peter Viechnicki",
            "img": "/static/img/story/authors/viechnicki.png",
            "about": [
                "Peter is a strategic analysis manager and data scientist in Deloitte Services LP's Public Sector Eminence group. His research focuses on opportunities created by new analytic techniques within Federal and State government programs. He has a particular passion for open data and standards.  Peter previously served as a federal officer in the US intelligence community, and has expertise in natural language processing and geospatial techniques."
            ]
        },
        {
            "name": "Daniel Byler",
            "title": "Data Scientist, Deloitte Services LP",
            "img": "/static/img/story/authors/byler.png",
            "about": [
                "Daniel Byler is a data scientist with Deloitte Services LP where he manages a portfolio of quantitative projects across Deloitte's research agenda. Prior to his current role, he supported clients in large federal agencies on data-focused projects."
            ]
        },
        {
            "name": "Matt Gentile",
            "img": "/static/img/story/authors/gentile.png",
            "about": [
                "Matt is a principal and leader of Deloitte's Federal Strategic Risk Market Offering and Deloitte's Geospatial practice. Matthew is a recognized innovator and entrepreneur in the analytics community, dedicating the past 18 years to working at the intersection of commerce, public policy and geospatial technology. In his role at Deloitte, Matt has made significant contributions to the analytics community through advising Federal agencies and Fortune 500 companies on the collaborative exchange, display and analysis of data. Matt holds a Bachelor of Science from Indiana University and a Master degree from the Massachusetts Institute of Technology (MIT). In 2013, he was appointed to the National Geospatial Advisory Committee (NGAC) by the Secretary of the Interior to help inform the development and implementation of the National Spatial Data Infrastructure (NSDI) and the federal government's geospatial platform. Matt is also on the Advisory Board for Indiana University's School of Public and Environmental Affairs."
            ]
        }
    ]
    return render_template("about/team.html", teams=({"name": "datawheel", "members": datawheel}, {"name": "deloitte", "members": deloitte}))
