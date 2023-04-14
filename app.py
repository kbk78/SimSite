from flask import Flask,render_template,request, make_response, send_file, jsonify
from werkzeug.utils import secure_filename
import json,os
import pandas as pd
import numpy as np

app=Flask(__name__)
app.secret_key='this is my secret'

@app.route('/')
def home():
	return "Hello, check address! \n \\simdata \n \\bindatadc \n \\binplot "

@app.route('/simdata')
def simdata():
	return render_template("simdata.html")


@app.route('/simdataapi',methods=['GET','POST'])
def simdataapi():
#    return  jsonify(pd.read_csv('EUI.csv').iloc[:5000,:].replace(np.NAN,'nan').to_dict(orient = 'records'))
    return  jsonify(pd.read_csv('EUI.csv').replace(np.NAN,'nan').to_dict(orient = 'records'))


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

@app.route('/binplot', methods=['GET','POST'])
def bindata():
	return render_template("binplot.html")


@app.route('/binplotdc', methods=['GET','POST'])
def bindatadc():
	return render_template("vuebinplotdc.html")


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
