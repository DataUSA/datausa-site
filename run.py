from datausa import app
from flask.ext.script import Manager

# set app debug mode to True
app.debug = True

# run the app through Manager
manager = Manager(app)

# run the new Manager instance
manager.run()
