from datausa.visualize.models import Viz
from datausa.utils.data import attr_cache, fetch
from datausa.profile.abstract import BaseObject


class Section(BaseObject):
    """A section of a profile page that contains many horizontal text/viz topics.

    Attributes:
        attr (dict): Attribute of profile.
        description (str): Description of the Section, read from YAML configuration.
        profile (Profile): Profile the Section lives within.
        title (str): Title of the Section, read from YAML configuration.
        topics (List[dict]): List of the various topic dictionaries in the Section.

    """

    def __init__(self, config, profile, anchor=""):
        """Initializes a new Section class.

        Args:
            config (str): The YAML configuration file as one long string.
            profile (Profile): The Profile class instance this Section will be a part of.

        """

        # Set the attr and profile attributes
        self.attr = profile.attr
        self.attr_type = profile.attr_type
        self.anchor = anchor

        if "title" in config:
            self.title = config["title"]

        if "group" in config:
            self.group = config["group"]

        if "description" in config:
            self.description = config["description"]
            if not isinstance(self.description, list):
                self.description = [self.description]

        if "viz" in config:
            self.viz = Viz(config["viz"])

        if "topics" in config:
            self.topics = config["topics"]

            self.topics = [t for t in self.topics if self.allowed_levels(t)]

            # loop through the topics
            for topic in self.topics:

                if "description" in topic and not isinstance(topic["description"], list):
                    topic["description"] = [topic["description"]]

                def getHighlight(viz_obj):
                    ids = viz_obj["id"]
                    if not isinstance(ids, list):
                        ids = [ids]
                    if profile.attr_type in ids:
                        return self.attr["id"]
                    else:
                        return False

                if "stat" in topic:
                    topic["stat"] = [s for s in topic["stat"] if self.allowed_levels(s)]

                # instantiate the "viz" config into an array of Viz classes
                if "viz" in topic:
                    if not isinstance(topic["viz"], list):
                        topic["viz"] = [topic["viz"]]
                    topic["viz"] = [v for v in topic["viz"] if self.allowed_levels(v)]
                    topic["viz"] = [Viz(viz, getHighlight(viz)) for viz in topic["viz"]]

                if "miniviz" in topic:
                    topic["miniviz"] = Viz(topic["miniviz"], getHighlight(topic["miniviz"]))

                # fill selector if present
                if "select" in topic:
                    if isinstance(topic["select"]["data"], str):
                        if "param" not in topic["select"]:
                            topic["select"]["param"] = topic["select"]["data"]
                        topic["select"]["data"] = [v for k, v in attr_cache[topic["select"]["data"]].iteritems()]
                    elif isinstance(topic["select"]["data"], list):
                        topic["select"]["data"] = [fetch(v, False) for v in topic["select"]["data"]]

        if "sections" in config:
            self.sections = config["sections"]

        if "stats" in config:
            self.stats = config["stats"]

        if "facts" in config:
            self.facts = config["facts"]


    def __repr__(self):
        return u"Section: {}".format(self.title)
