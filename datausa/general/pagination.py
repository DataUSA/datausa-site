from math import ceil

class Pagination(object):
    ORDERS = ['', 'desc', 'asc']

    def __init__(self, page, per_page, total_count, sort, order=''):
        self.page = page
        self.per_page = per_page
        self.total_count = total_count
        self.sort = sort
        self.order = order

    @property
    def pages(self):
        return int(ceil(self.total_count / float(self.per_page)))

    @property
    def has_prev(self):
        return self.page > 1

    @property
    def has_next(self):
        return self.page < self.pages

    @property
    def next_order(self):
        return self.ORDERS[(self.ORDERS.index(self.order)+1)%len(self.ORDERS)]

    def iter_pages(self, left_edge=2, left_current=2,
                   right_current=5, right_edge=2):
        last = 0
        for num in xrange(1, self.pages + 1):
            if num <= left_edge or \
               (num > self.page - left_current - 1 and \
                num < self.page + right_current) or \
               num > self.pages - right_edge:
                if last + 1 != num:
                    yield None
                yield num
                last = num

