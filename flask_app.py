from flask import Flask,render_template,request, make_response, send_file
from flask.ext.login import LoginManager,login_user ,UserMixin
from werkzeug import secure_filename
import os


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
	return "Hello, check address!"

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

@app.route('/bindataold',methods=['GET','POST'])
def bindataold():
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

@app.route("/simple.png")
def simple():
    import datetime
    import io
    import random

    from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
    from matplotlib.figure import Figure
    from matplotlib.dates import DateFormatter

    fig=Figure()
    ax=fig.add_subplot(111)
    x=[]
    y=[]
    now=datetime.datetime.now()
    delta=datetime.timedelta(days=1)
    for i in range(10):
        x.append(now)
        now+=delta
        y.append(random.randint(0, 1000))
    ax.plot_date(x, y, '-')
    ax.xaxis.set_major_formatter(DateFormatter('%Y-%m-%d'))
    fig.autofmt_xdate()
    canvas=FigureCanvas(fig)
    png_output = io.BytesIO()
    canvas.print_png(png_output)
    response=make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response

@app.route("/fft",methods=['GET','POST'])
def fig():
    if request.method=='GET':
        return render_template("fft.htm",error='none')
    if request.method=='POST':
        import matplotlib.pyplot as plt
        import numpy as np
        import io,base64
        freq =  request.form['freq']
        amp =  request.form['amp']
        fig = plt.figure()
        ax = fig.add_subplot(111)
        ax.plot(int(amp)*np.sin(int(freq)*np.pi*np.linspace(0,10000)/4))
        img = io.BytesIO()
        fig.savefig(img,format='png')
        img.seek(0)
        img = base64.b64encode(img.getvalue()).decode('utf-8')
        return render_template("bindata.htm",error=freq,image_data=img)

@app.route('/bindata', methods=['GET','POST'])
def getfile():
    if request.method=='GET':
        return render_template("bindata.htm",error='none')
    if request.method == 'POST':
        # for secure filenames. Read the documentation.
#        file = request.files['myfile']

        binrange = request.form['binrange']
        binfrom = request.form['binfrom']
        binto =  request.form['binto']
        weatherfile =  request.files['weatherfile']
        filename = secure_filename(weatherfile.filename)
#        with open(filename) as f:
#            error = f.readline()
        return render_template("bindata.htm",fname=weatherfile.filename,image_data=None,error=os.listdir())


        # os.path.join is used so that paths work in every operating system
#        file.save(os.path.join("wherever","you","want",filename))




        # You should use os.path.join here too.
#        with open("wherever/you/want/filename") as f:
#            file_content = f.read()

@app.route('/binplot', methods=['GET','POST'])
def bindata():
	return render_template("binplot.html")

def upload_file():
    if request.method == 'POST':
#            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            file = request.files['file']
            return secure_filename(file.filename)

    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <p><input type=file name=file>
         <input type=submit value=Upload>
    </form>
    '''



if __name__=='__main__':
	app.run(debug=True)