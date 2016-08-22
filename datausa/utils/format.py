import math
from decimal import Decimal
from flask import request, url_for
from datausa.consts import AFFIXES, COLMAP, DICTIONARY, NEVERCONDENSE, PERCENTAGES, PROPORTIONS

def jinja_formatter(value, key=None):
    if isinstance(value, (int, float, Decimal)):
        return num_format(value, key)
    elif value in DICTIONARY:
        return DICTIONARY[value]
    else:
        return value.title()

def num_format(number, key=None, labels=True, condense=True, suffix=True):

    if number == float("inf"):
        return "N/A"

    if key:

        if "_moe" in key:
            key = key.replace("_moe", "")

        if key == "year":
            return number

        if "_rank" in key:

            ordinals = ('th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th')

            n = int(number)

            if n % 100 in (11, 12, 13):
                return u"{}{}".format("{:,}".format(n), ordinals[0])
            return u"{}{}".format("{:,}".format(n), ordinals[n % 10])

    # Converts the number to a float.
    n = float(number)

    if key and ("emp_thousands" in key or "employees_thousands" in key):
        n = n * 1000
    elif key == "value_millions":
        n = n * 1000000
    elif key == "output":
        n = n * 1000000000

    if key and key in PROPORTIONS:
        n = n * 100

    # Determines which index of "groups" to move the decimal point to.
    groups = ["", "k", "M", "B", "T"]
    if n < 999999.99 or not condense or (key and key in NEVERCONDENSE):
        m = 0
    else:
        m = max(0,min(len(groups)-1, int(math.floor(math.log10(abs(n))/3))))

    # Moves the decimal point and rounds the new number to specific decimals.
    n = n/10**(3*m)
    if key and key == "gini":
        n = round(n, 3)
    elif key and "rca" in key:
        n = round(n, 2)
    elif n > 99:
        n = int(n)
    elif n > 9:
        n = round(n, 1)
    elif n > 1:
        n = round(n, 1)
    else:
        n = round(n, 2)

    if Decimal(n) % 1 == 0:
        n = int(n)

    # Initializes the number suffix based on the group.
    n = u"{:,}".format(n)
    if suffix:
        n = u"{}{}".format(n, groups[m])

    if suffix and key and (key in PERCENTAGES or key in PROPORTIONS):
        n = u"{}%".format(n)

    if key and labels:
        affix = AFFIXES[key] if key in AFFIXES else None
        if affix:
            return u"{}{}{}".format(unicode(affix[0]), n, unicode(affix[1]))

    return n

def param_format(params):
    params["sumlevel"] = params.get("sumlevel", "all")
    params["year"] = params.get("year", "all")
    params["sort"] = params.get("sort", "desc")
    params["order"] = params.get("order", "")
    params["exclude"] = params.get("exclude", "")
    if "force" not in params:
        params["required"] = params.get("required", params["order"])

    if "show" in params and params["show"] == "skill" or params["year"] == "none":
        del params["year"]

    for optional in ["order", "exclude"]:
        if params[optional] == "":
            del params[optional]

    return params

def url_for_other_page(page, sort=None, order=None):
    args = request.view_args.copy()
    args['page'] = page
    if sort and order:
        args['sort'] = sort
        if order:
            args['order'] = order
    return url_for(request.endpoint, **args)
