from flask import Flask,render_template,request
from flask.ext.login import LoginManager,login_user ,UserMixin

app=Flask(__name__)
app.secret_key='this is my secret'

login_manager = LoginManager()
login_manager.init_app(app)

class User(UserMixin):
    '''Simple User class'''
    USERS = {
        # username: password
        'admin': 'password',
        'mary': 'love peter'
    }

    def __init__(self, id):
        if id in self.USERS:
            self.id = id
            self.password = self.USERS[id]

    @classmethod
    def get(self_class, id):
        '''Return user instance of id, return None if not exist'''
        try:
            return self_class(id)
        except:
            return None

@login_manager.user_loader
def load_user(userid):
    return User.get(userid)

@app.route('/')
def home():
	return "Hello, World this is my first app!"

@app.route('/welcome')
def welcome():
	return render_template("welcome.htm")

@app.route('/theme')
def theme():
	return render_template("theme.htm")

@app.route('/eapp')
def eapp():
	return render_template("eapp.htm")

@app.route('/login',methods=['GET','POST'])
def login():
	if request.method=='POST':
		user =  User.get(request.form['username'])
		if (user and user.password == request.form['password']):
			login_user(user)
			return render_template("login.htm",error=user.id)
		else:
			return render_template("login.htm",error='Username or password incorrect')
	return render_template("login.htm",error='none')

@app.route('/bindata',methods=['GET','POST'])
def bindata():
    import numpy as np
    import matplotlib.pylab as plt
    import pandas as pd
    if request.method=='GET':
        return render_template("bindata.htm",error='none')
    if request.method=='POST':
        freq =  User.get(request.form['freq'])
        amp =  User.get(request.form['amp'])
        r = np.linspace(0,1000,1)
        plt.plot(amp*np.sin(r*np.pi/4*freq))
    return render_template("bindata.htm",error='none')

if __name__=='__main__':
	app.run(debug=True)