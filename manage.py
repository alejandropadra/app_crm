import sys
sys.stdout.reconfigure(line_buffering=True)

from app import create_app
from app import db, User 
from flask_script import Manager, Server, Shell
from flask_migrate import Migrate

from config import config

config_class = config['development']
app = create_app(config_class)
migrate = Migrate(app, db)

def make_shell_context():
    return dict(app=app, db=db, User=User)

if __name__ == '__main__':
    manager = Manager(app, with_default_commands=False)
    manager.add_command("runserver", Server(host="0.0.0.0", port=8000))
    manager.add_command("shell", Shell(make_context=make_shell_context))
    manager.run()