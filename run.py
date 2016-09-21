import os
from datausa import app
# from flask.ext.script import Manager

if __name__ == '__main__':
    app.debug = True
    extra_dirs = ["datausa/html"]
    extra_files = extra_dirs[:]
    for extra_dir in extra_dirs:
        for dirname, dirs, files in os.walk(extra_dir):
            for filename in files:
                filename = os.path.join(dirname, filename)
                if os.path.isfile(filename):
                    extra_files.append(filename)
    app.run(extra_files=extra_files)
    # manager = Manager(app)
    # manager.run(extra_files=extra_files)
