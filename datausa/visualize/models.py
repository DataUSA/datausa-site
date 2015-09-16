class Viz(object):
    """A visualization object to be built using D3plus.

    Attributes:
        config (dict): Configuration for D3plus
        data (List[dict]): A list of data dictionary objects that tell D3plus how to load and transform the data needed for the visualization.

    """

    def __init__(self, params):
        """Initializes a new Viz class.

        Args:
            config (str): The YAML configuration file as one long string.
            profile (Profile): The Profile class instance this Section will be a part of.

        """

        # force the data of params into a list

        # loop through each data and append to self.data

            # create a new dict containing the 'split' and 'static' params

            # Set fallback API params

            # create the data URL

            # store the params in the return dict

            # append the data dict to self.data

        # set self.config to the params

        # set the tooltip config using the function

    def attr_url(self):
        """str: URL to be used to load attribute data """

        # if 'attrs' in the config, return a URL

    def serialize(self):
        """dict: JSON dump of Viz attrs, config, and data """

    def tooltip(self):
        """List[str]: A list of important data keys to be displayed in tooltips """

        # check each data call for 'required' and 'order'

        # check the config for 'x' 'y' and 'size'
