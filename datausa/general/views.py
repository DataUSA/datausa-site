# -*- coding: utf-8 -*-
import copy, datetime, json, re, requests
from flask import Blueprint, g, render_template, request, url_for, redirect, abort
from config import API
from datausa import app
from datausa.consts import AFFIXES, COLLECTIONYEARS, COLMAP, DICTIONARY, GLOSSARY,  PERCENTAGES, PROPORTIONS, PER1000, PER10000, PER100000, SUMLEVELS
from datausa.story.models import StoryPreview
from datausa.utils.data import attr_cache, datafold, fetch, profile_cache, story_cache
from datausa.utils.format import num_format
from pagination import Pagination
from datausa.map.views import mapdata

from .home import HOMEFEED, TYPEMAP

mod = Blueprint("general", __name__)

@app.before_request
def before_request():
    g.cache_version = 55
    g.cart_limit = 5
    g.affixes = json.dumps(AFFIXES)
    g.collectionyears = json.dumps(COLLECTIONYEARS)
    g.colmap = json.dumps(COLMAP)
    g.dictionary = json.dumps(DICTIONARY)
    g.glossary = json.dumps(GLOSSARY)
    g.percentages = json.dumps(PERCENTAGES)
    g.proportions = json.dumps(PROPORTIONS)
    g.per1000 = json.dumps(PER1000)
    g.per10000 = json.dumps(PER10000)
    g.per100000 = json.dumps(PER100000)
    g.api = API
    g.compare = False

TILEMAX = 5

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

footMap = {
    "geo": 36190,
    "naics": 301,
    "soc": 525,
    "cip": 2319
}

def tileAPI(column):
    url = "{}{}&limit={}".format(API, column["url"], TILEMAX)
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
        # d["subtitle"] = "{}: {}".format(DICTIONARY[order], num_format(d[order], order))
        d["subtitle"] = SUMLEVELS[show][sumlevel]["label"]
        d["link"] = "/profile/{}/{}".format(show, slug)
        d["image"] = "/search/{}/{}/img".format(show, attr_id)
        d["type"] = {
            "icon": "/static/img/icons/{}.svg".format(show),
            "title": SUMLEVELS[show][sumlevel]["label"],
            "type": TYPEMAP[show],
            "depth": "{}".format(sumlevel).replace("_", " ")
        }

    column["icon"] = "/static/img/icons/{}.svg".format(show)
    column["data"] = data
    column["source"] = r["source"]
    if show in footMap:
        column["footer"] = {
            "link": "/search/?kind={}".format(show),
            "text": "{} more".format(num_format(footMap[show]))
        }
    return column

def tileProfiles(profiles):
    for i, page in enumerate(profiles):
        show, slug = page.split("/")
        attr = fetch(slug, show)
        attr_id = attr["id"]
        sumlevel = attr["sumlevel"] if "sumlevel" in attr else attr["level"]
        profiles[i] = {
            "image": "/search/{}/{}/img".format(show, attr_id),
            "link": "/profile/{}".format(page),
            "title": attr["display_name"] if "display_name" in attr else attr["name"],
            # "subtitle": SUMLEVELS[show][str(sumlevel)]["label"],
            "type": {
                "icon": "/static/img/icons/{}.svg".format(show),
                "title": SUMLEVELS[show][str(sumlevel)]["label"],
                "type": TYPEMAP[show],
                "depth": "{}".format(sumlevel).replace("_", " ")
            }
        }
    return profiles

def tileMaps(maps):
    new = ["total_reimbursements_b"]
    titles = {
        "total_reimbursements_b": "Medicare Reimbursements"
    }

    for i, link in enumerate(maps):
        level = re.findall(r"level=([^&,]+)", link)[0]
        key = re.findall(r"key=([^&,]+)", link)[0]
        sumlevel = SUMLEVELS["geo"][sumlevelMap[level]]["label"]
        maps[i] = {
            "new": True if key.split(":")[0] in new else False,
            "link": link,
            "image": "/static/img/home/maps/{}.png".format(key.split(":")[0]),
            "title": "{} by {}".format(titles[key] if key in titles else DICTIONARY[key], sumlevel),
            "type": {
                "icon": "/static/img/icons/map.svg",
                "title": sumlevel,
                "type": "map"
            }
        }
    return maps

@mod.route("/")
def home():
    g.page_type = "home"

    carousels = []

    maps = [
        "/map/?level=county&key=total_reimbursements_b",
        "/map/?level=county&key=income_below_poverty:pop_poverty_status,income_below_poverty,income_below_poverty_moe,pop_poverty_status,pop_poverty_status_moe",
        "/map/?level=state&key=high_school_graduation",
        "/map/?level=county&key=children_in_singleparent_households",
        "/map/?level=state&key=violent_crime"
    ]

    mapTotal = 0
    for section in mapdata:
        mapTotal = mapTotal + len(mapdata[section])

    carousels.append({
        "title": "Maps",
        "icon": "/static/img/icons/demographics.svg",
        "data": tileMaps(maps),
        "footer": {
            "link": "/map",
            "text": "{} more".format(mapTotal - TILEMAX)
        }
    })

    carousels.append({
        "title": "Cities & Places",
        "icon": "/static/img/icons/geo.svg",
        "data": tileProfiles(["geo/new-york-ny", "geo/los-angeles-county-ca", "geo/florida", "geo/suffolk-county-ma", "geo/illinois"]),
        "footer": {
            "link": "/search/?kind=geo",
            "text": "{} more".format(num_format(footMap["geo"] - TILEMAX))
        }
    })

    carousels.append({
        "rank": "naics",
        "title": "Industries",
        "icon": "/static/img/icons/naics.svg",
        "data": tileProfiles(["naics/622", "naics/23", "naics/31-33", "naics/722Z", "naics/44-45"]),
        "footer": {
            "link": "/search/?kind=naics",
            "text": "{} more".format(num_format(footMap["naics"] - TILEMAX))
        }
    })

    carousels.append({
        "rank": "soc",
        "title": "Jobs",
        "icon": "/static/img/icons/soc.svg",
        "data": tileProfiles(["soc/252020", "soc/151131", "soc/1110XX", "soc/412031", "soc/291141"]),
        "footer": {
            "link": "/search/?kind=soc",
            "text": "{} more".format(num_format(footMap["soc"] - TILEMAX))
        }
    })

    carousels.append({
        "rank": "cip",
        "title": "Higher Education",
        "icon": "/static/img/icons/cip.svg",
        "data": tileProfiles(["cip/513801", "cip/110701", "cip/520201", "cip/420101", "cip/240101"]),
        "footer": {
            "link": "/search/?kind=cip",
            "text": "{} more".format(num_format(footMap["cip"] - TILEMAX))
        }
    })

    cartDatasets = [
        {
            "url": "{}/api/?required=patients_diabetic_medicare_enrollees_65_75_lipid_test_total&show=geo&sumlevel=county&year=all".format(API),
            "slug": "map_patients_diabetic_medicare_enrollees_65_75_lipid_test_total_ county",
            "image": "/static/img/splash/naics/5417.jpg",
            "title": "Diabetic Lipid Tests by County",
            "new": 1
        },
        {
            "url": "{}/api/?required=adult_smoking&show=geo&sumlevel=state&year=all".format(API),
            "slug": "map_adult_smoking_ state",
            "image": "/static/img/splash/naics/3122.jpg",
            "title": "Adult Smoking by State"
        },
        {
            "url": "{}/api/?required=leg_amputations_per_1000_enrollees_total&show=geo&sumlevel=county&year=all".format(API),
            "slug": "map_leg_amputations_per_1000_enrollees_total_ county",
            "image": "/static/img/splash/naics/62.jpg",
            "title": "Leg Amputations by County",
            "new": 1
        },
        {
            "url": "{}/api/?required=pop%2Cpop_moe&show=geo&sumlevel=county&year=all".format(API),
            "slug": "map_pop_ county",
            "image": "/static/img/splash/cip/45.jpg",
            "title": "Population by County"
        },
        {
            "url": "{}/api/?required=median_property_value%2Cmedian_property_value_moe&show=geo&sumlevel=county&year=all".format(API),
            "slug": "map_median_property_value_ county",
            "image": "/static/img/splash/geo/05000US25019.jpg",
            "title": "Median Property Value by County"
        }
    ]

    carousels.append({
        "rank": "cart",
        "title": "Download",
        "icon": "/static/img/cart-big.png",
        "data": cartDatasets,
        "footer": {
            "link": "/cart",
            "text": "View Cart"
        }
    })

    stories = StoryPreview.generate_list()[0]
    story_order = ["opioid-addiction", "poverty-health", "worker-evolution", "medicare-physicians", "hardest-working"]
    stories.sort(key=lambda story: story_order.index(story.story_id.split("_")[1]) if story.story_id.split("_")[1] in story_order else TILEMAX)
    now = datetime.datetime.now()
    for i, story in enumerate(stories):
        delta = now - story._date_obj
        stories[i] = {
            "new": int(delta.days) < 30,
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

    carousels.append({
        "rank": "story",
        "title": "Latest Stories",
        "icon": "/static/img/icons/about.svg",
        "data": stories[:TILEMAX],
        "footer": {
            "link": "/story/",
            "text": "{} more".format(len(stories) - TILEMAX)
        }
    })

    return render_template("general/home.html", carousels=carousels)

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
