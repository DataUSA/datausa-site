class Section(object):
    """A section of a profile page that contains many horizontal text/viz topics.

    Attributes:
        attr (dict): Attribute of profile.
        description (str): Description of the Section, read from YAML configuration.
        profile (Profile): Profile the Section lives within.
        title (str): Title of the Section, read from YAML configuration.
        topics (List[dict]): List of the various topic dictionaries in the Section.

    """

    def __init__(self, config, profile):
        """Initializes a new Section class.

        Args:
            config (str): The YAML configuration file as one long string.
            profile (Profile): The Profile class instance this Section will be a part of.

        """

        # Set the attr and profile attributes

        # regex to find all keys matching <<*>>

        # loop through each key

            # split the key at a blank space to find params

            # if Section has a function with the same name as the key

                # convert params into a dict, splitting at pipes

                # run the Section function, passing the params as kwargs

                # replace all instances of key with the returned value

        # load the config through the YAML interpreter and set title, description, and topics

        # loop through the topics

            # if the topic has a "viz" key

                # instantiate the "viz" config into a Viz class

    def id(self, **kwargs):
        """str: The id of attribute taking into account the dataset and grainularity of the Section """

        # if there is a specified dataset in kwargs

            # if the attribute is a CIP and the dataset is PUMS, return the parent CIP code

    def name(self, **kwargs):
        """str: The attribute name """

        # if there is a specified dataset, use the id function

    def top(self, **kwargs):
        """str: A text representation of a top statistic or list of statistics """

        # create a params dict to use in the URL request

        # set the section's attribute ID in params

        # get output key from either the value in kwargs (while removing it) or 'name'

        # if the output key is not name, then add it to the params as a 'required' key

        # add the remaining kwargs into the params dict

        # set default params

        # if no required param is set, set it to the order param

        # convert params into a url query string

        # make the API request using the params, converting it to json and running it through the datafold util

        # if the output key is 'name', fetch attributes for each return and create an array of 'name' values
        # else create an array of the output key for each returned datapoint

        # coerce all values to strings

        # if there's more than 1 value, prefix the last string with 'and'

        # if there's only 2 values, return the list joined with a space

        # otherwise, return the list joined with commans
