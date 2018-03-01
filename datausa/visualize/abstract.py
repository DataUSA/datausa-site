class BaseObject(object):
    def allowed_levels(self, obj):
        """bool: Returns whether or not a topic/viz is allowed for a specific profile """
        retBool = True

        if "allowed" in obj:
            first, second = obj["allowed"].split(":")
            levels = [t for t in second.split(",")]

            for l in levels:
                if l.startswith("!"):
                    if l[1:] == first:
                        retBool = False
                elif l != first:
                    retBool = False

        return retBool
