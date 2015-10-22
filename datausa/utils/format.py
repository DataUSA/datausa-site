import math

dictionary = {
    "grads_total": "Graduates",
    "grads_native": "American Indian or Alaska Native",
    "grads_native_men": "Native Men",
    "grads_native_women": "Native Women",
    "grads_asian": "Asian",
    "grads_asian_men": "Asian Men",
    "grads_asian_women": "Asian Women",
    "grads_black": "Black",
    "grads_black_men": "Black Men",
    "grads_black_women": "Black Women",
    "grads_hispanic": "Hispanic",
    "grads_hispanic_men": "Hispanic Men",
    "grads_hispanic_women": "Hispanic Women",
    "grads_hawaiian": "Hawaiian",
    "grads_hawaiian_men": "Hawaiian Men",
    "grads_hawaiian_women": "Hawaiian Women",
    "grads_white": "White",
    "grads_white_men": "White Men",
    "grads_white_women": "White Women",
    "grads_multi": "Multi",
    "grads_multi_men": "Multi Men",
    "grads_multi_women": "Multi Women",
    "grads_unknown": "Unknown",
    "grads_unknown_men": "Unknown Men",
    "grads_unknown_women": "Unknown Women",
}

affixes = {
    "state_tuition": ["$", ""],
    "oos_tuition": ["$", ""],
    "avg_wage": ["$", ""]
}

def num_format(number, key=None, labels=True):

    if key:

        if key == "year":
            return number

        if "_rank" in key:

            ordinals = ('th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th')

            n = int(number)

            if n % 100 in (11, 12, 13):
                return u"{0}{1}".format("{:,}".format(n), ordinals[0])
            return u"{0}{1}".format("{:,}".format(n), ordinals[n % 10])

    # Converts the number to a float.
    n = float(number)

    # Determines which index of "groups" to move the decimal point to.
    groups = ["", "k", "M", "B", "T"]
    m = max(0,min(len(groups)-1, int(math.floor(math.log10(abs(n))/3))))

    # Moves the decimal point and rounds the new number to specific decimals.
    n = n/10**(3*m)
    if key and key == "eci":
        n = round(n, 2)
    elif n > 99:
        n = int(n)
    elif n > 9:
        n = round(n, 1)
    elif n > 1:
        n = round(n, 2)
    else:
        n = round(n, 3)

    # Initializes the number suffix based on the group.
    n = u"{0}{1}".format(n, groups[m])

    if key and labels:
        affix = affixes[key] if key in affixes else None
        if affix:
            return u"{}{}{}".format(unicode(affix[0]), n, unicode(affix[1]))

    return n
