from datausa.consts import SUMLEVELS


class BaseObject(object):
    def allowed_levels(self, obj):
        """bool: Returns whether or not a topic/viz is allowed for a specific profile """
        if "sumlevel" in obj:
            levels = [t for t in obj["sumlevel"].split(",")]
            if self.attr_type == "geo":
                level = SUMLEVELS["geo"][self.attr["id"][:3]]["sumlevel"]
            else:
                level = len(self.attr["id"])

            if "!" in obj["sumlevel"]:
                return not "!{}".format(level) in levels
            else:
                return level in levels
        elif "allowed" in obj:
            first, second = obj["allowed"].split(":")
            if second.startswith("!"):
                second = second[1:]
                return first != second
            else:
                return first == second

        return True
