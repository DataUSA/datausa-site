from datausa.consts import SUMLEVELS
from datausa.utils.data import fetch

class BaseObject(object):
    def allowed_levels(self, obj):
        """bool: Returns whether or not a topic/viz is allowed for a specific profile """
        if "sumlevel" in obj:
            levels = [t for t in obj["sumlevel"].split(",")]
            if self.attr_type == "geo":
                level = SUMLEVELS["geo"][self.attr["id"][:3]]["sumlevel"]
            elif self.attr_type == "university":
                if self.attr["carnegie"] != None:
                    level = "2"
                elif self.attr["carnegie_parent"] != None:
                    level = "1"
                else:
                    level = "0"
            else:
                level = len(self.attr["id"])

            if "!" in obj["sumlevel"]:
                return not "!{}".format(level) in levels
            else:
                return level in levels
        elif "allowed" in obj:
            first, second = obj["allowed"].split(":")
            if first == "<<id>>":
                first = self.attr["id"]
            levels = [t for t in second.split(",")]

            for l in levels:
                if l.startswith("!"):
                    if l[1:] == first:
                        return False
                elif l != first:
                    return False

        return True
