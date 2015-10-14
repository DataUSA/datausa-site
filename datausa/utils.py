import functools, gzip, math, requests
from flask import after_this_request, request
from config import API
from datausa import cache, app
from cStringIO import StringIO as IO

def datafold(data):
    """List[dict]: combines the headers and data from an API call """
    return [dict(zip(data["headers"], d)) for d in data["data"]]

def datasplit(data):
    data = [v for (k,v) in data.items()]
    headers = [k for (k,v) in data[0].items()]
    data = [[v for (k, v) in d.items()] for d in data]
    return {"data": data, "headers": headers}

def fetch(attr_id, attr_type):
    """dict: Returns an attribute dict container information like 'name' and 'color' """
    if attr_type in attr_cache and attr_id in attr_cache[attr_type]:
        return attr_cache[attr_type][attr_id]
    return {"id": attr_id, "name": attr_id}

@cache.memoize()
def build_attr_cache():
    app.logger.info("Loading attr data from API...")
    req = requests.get("{}/attrs/list".format(API))
    response_json = req.json()
    attr_names = response_json["data"]

    results = {}

    for attr_name in attr_names:
        app.logger.info("Loading attr data for: {}".format(attr_name))

        r = requests.get("{}/attrs/{}".format(API, attr_name))
        attr_list = datafold(r.json())
        results[attr_name] = {obj["id"]: obj for obj in attr_list}
    app.logger.info("Attr cache setup complete.")
    return results

attr_cache = build_attr_cache()

''' Decorator for returning gzipped content via http://flask.pocoo.org/snippets/122/ '''
def gzipped(f):
    @functools.wraps(f)
    def view_func(*args, **kwargs):

        @after_this_request
        def zipper(response):
            accept_encoding = request.headers.get('Accept-Encoding', '')

            if 'gzip' not in accept_encoding.lower():
                return response

            response.direct_passthrough = False

            if (response.status_code < 200 or
                response.status_code >= 300 or
                'Content-Encoding' in response.headers):
                return response
            gzip_buffer = IO()
            gzip_file = gzip.GzipFile(mode='wb',
                                      fileobj=gzip_buffer)
            gzip_file.write(response.data)
            gzip_file.close()

            response.data = gzip_buffer.getvalue()
            response.headers['Content-Encoding'] = 'gzip'
            response.headers['Vary'] = 'Accept-Encoding'
            response.headers['Content-Length'] = len(response.data)

            return response

        return f(*args, **kwargs)

    return view_func


affixes = {
    "state_tuition": ["$", ""],
    "oos_tuition": ["$", ""],
    "avg_wage": ["$", ""]
}


def num_format(number, key=None, labels=True):

    if key and "_rank" in key:

        ordinals = ('th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th')

        n = int(number)
        if n % 100 in (11, 12, 13):
            return u"{0}{1}".format(n, ordinals[0])
        return u"{0}{1}".format(n, ordinals[n % 10])

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
    n = u"{0}{1}".format(n,groups[m])

    if key and labels:
        affix = affixes[key] if key in affixes else None
        if affix:
            return u"{}{}{}".format(unicode(affix[0]), n, unicode(affix[1]))

    return n
