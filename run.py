from datausa import app
from flask.ext.script import Manager

if __name__ == '__main__':
    app.debug = True
    manager = Manager(app)
    manager.run()
