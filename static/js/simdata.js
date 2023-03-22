Vue.use(vueClipboards);
Vue.config.devtools = true;
var apptest = new Vue({
	delimiters: ['${', '}'],
	el: "#apptest",
	data: {
		clipboarddata:"clipboard data",
		testvalue:'na',
		simdata:['value1'],
		},
	methods:{
		faction(){
			fetch('simdataapi').then(dat=>dat.json()).then(js => {
				this.simdata = js;
				this.plotbox();
			});
		},

		plotc3(){

			var chart = c3.generate({
				bindto: '#ch1',
				data: {
					json: this.simdata,
					type:'scatter',
					keys: {
						value:['EUI'],
					},	
				}
			});

		},


		plotbox(){

			let self = this
			var scf  = crossfilter(this.simdata);

//--Parameter enu items
	                var weamnu = dc.selectMenu('#weamnu');
			weadim = scf.dimension(d=>d.wea);
			weamnu
				.dimension(weadim)
				.group(weadim.group())
				.multiple(true)
				.title(d=>d.key)
				.numberVisible(3)
				.controlsUseVisibility(true);

	                var oamnu = dc.selectMenu('#oamnu');
			oadim = scf.dimension(d=>d.inp_oa);
			oamnu
				.dimension(oadim)
				.group(oadim.group())
				.multiple(true)
				.numberVisible(3)
				.controlsUseVisibility(true);

	                var eqmnu = dc.selectMenu('#eqmnu');
			eqdim = scf.dimension(d=>d.inp_equip);
			eqmnu
				.dimension(eqdim)
				.group(eqdim.group())
				.multiple(true)
				.title(d=>d.key)
				.numberVisible(3)
				.controlsUseVisibility(true);

	                var wallinsmnu = dc.selectMenu('#wallinsmnu');
			wallinsdim = scf.dimension(d=>d.inp_wallins);
			wallinsmnu
				.dimension(wallinsdim)
				.group(wallinsdim.group())
				.multiple(true)
				.title(d=>d.key)
				.numberVisible(3)
				.controlsUseVisibility(true);

	                var schmnu = dc.selectMenu('#schmnu');
			schdim = scf.dimension(d=>d.inp_sch);
			schmnu
				.dimension(schdim)
				.group(schdim.group())
				.multiple(true)
				.numberVisible(3)
				.controlsUseVisibility(true);

	                var idfmnu = dc.selectMenu('#idfmnu');
			idfdim = scf.dimension(d=>d.idf);
			idfmnu
				.dimension(idfdim)
				.group(idfdim.group())
				.multiple(true)
				.title(d=>d.key)
				.numberVisible(3)
				.controlsUseVisibility(true);

		        var winmnu = dc.selectMenu('#winmnu');
			windim = scf.dimension(d=>d.inp_winhei);
			winmnu
				.dimension(windim)
				.group(windim.group())
				.multiple(true)
				.title(d=>d.key)
				.numberVisible(3)
				.controlsUseVisibility(true);

		boxdim = scf.dimension(d=>d.wea);
			boxgrp = boxdim.group().reduce(
				function(p,v) {
					// keep array sorted for efficiency
					p.splice(d3.bisectLeft(p, v.EUI), 0, v.EUI);
					return p;
				},
				function(p,v) {
					p.splice(d3.bisectLeft(p, v.EUI), 1);
					return p;
				},
				function() {
					return [];
				}
			);

			function column_values(dim, cols) {
				var _groupAll = dim.groupAll().reduce(
					function(p, v) { // add
						cols.forEach(c=>p[c].splice(d3.bisectLeft(p[c], v[c]), 0, v[c]));
						return p;
					},
					function(p, v) { // remove
						cols.forEach(c=>p[c].splice(d3.bisectLeft(p[c], v[c]), 1));
						return p;
					},
					function() { // init
						var p = {};
						cols.forEach(c=>p[c] = []);
						return p;
					});
				return {
					all: function() {
						// or _.pairs, anything to turn the object into an array
						return d3.map(_groupAll.value()).entries();
						//return _groupAll.value();
					},
					top:function(n) {
						// or _.pairs, anything to turn the object into an array
						return d3.map(_groupAll.value()).entries().slice(0,n);
					},
					bottom:function(n) {
						// or _.pairs, anything to turn the object into an array
						return d3.map(_groupAll.value()).entries().slice(-n,Infinity);
					}

				};
			}
			
			disgrp = column_values(boxdim,["InteriorLighting_Electricity","Cooling_Electricity","Fans_Electricity","Heating_NaturalGas","EUI"])


			dc.config.defaultColors(d3.schemeSet1);
			var bp01 = dc.boxPlot("#euich");
			bp01
				.width(768)
				.height(480)
				.margins({top: 10, right: 50, bottom: 30, left: 50})
				.dimension(boxdim)
				.group(disgrp)
				.elasticY(true)
				.elasticX(true);


			  function reversible_group(group) {
			      return {
				  top: function(N) {
				      return group.top(N);
				  },
				  bottom: function(N) {
				      return group.top(Infinity).slice(-N).reverse();
				  }
			      };
			  }

			var sumtable = dc.dataTable("#sumtable")
			    .width(768)
			    .height(480)
			    .showSections(false)
			    .dimension(disgrp)
			    .columns([d=>d.key,d=>Math.round(d3.mean(d.value))]);


			function rec_count(g) {return {value:function(){return g.allFiltered().length;}}};
	                trec = dc.numberDisplay('#trec')
				 .group(rec_count(scf))
				 .valueAccessor(d=>d)


			scf.onChange(function(){
				//self.clipboarddata = disgrp.all().values();
				//self.clipboarddata = 4;
				self.clipboarddata=''
				disgrp.all().forEach(d=>self.clipboarddata =self.clipboarddata  + String(d.key)+'\t' + String(d3.mean(d.value))+'\n')
					});

			dc.renderAll()
		},


//Scatter plot
		plotchdc(){
			var scf  = crossfilter(this.simdata);
			var euidim = scf.dimension(d=>[d.index , d.EUI]);
			var euigrp = euidim.group();

			var eqdim = scf.dimension(d=>d.inp_equip);
			console.log(this.filtersn[0].min)

			eqdim.filter(d=>d>=this.filtersn[0].min);
			//		eqdim.filter(d=>d<=this.filtersn[0].max);

			var oadim = scf.dimension(d=>d.inp_oa);
			var wallinsdim = scf.dimension(d=>d.inp_wallins);

			var schdim = scf.dimension(d=>d.inp_sch);
			var idfdim = scf.dimension(d=>d.idf);
			var weadim = scf.dimension(d=>d.wea);


			/*
			var lceldim = scf.dimension(function(d) { return [d.index , d.Cooling_Electricity];});
			var fneldim = scf.dimension(function(d) { return [d.index , d.Fans_Electricity];});
			var htgadim = scf.dimension(function(d) { return [d.index , d.Heating_NaturalGas];});
			var clsndim = scf.dimension(function(d) { return [d.index , d.ClCoilSens];});

			var clltdim = scf.dimension(function(d) { return [d.index , d.ClCoilLat];});
			var htcldim = scf.dimension(function(d) { return [d.index , d.HtCoil];});
			*/

			dc.config.defaultColors(d3.schemeSet1);
			var chart = dc.scatterPlot("#ch1");
			chart
				.width(768)
				.height(580)
			// .x(d3.scaleLinear().domain(d3.extent(this.tdbs)))
				.x(d3.scaleLinear().domain([0,40000]))
				.brushOn(false)
				.yAxisLabel("EUI dc")
				.xAxisLabel("Index")
				.dimension(euidim)
				.group(euigrp)
			chart.render();
			dc.redrawAll()
		},

		openFile(event){
			let self = this
			var reader = new FileReader();
			reader.onload = function(e){
				var text1 = reader.result.split('\n').slice(-8761).join('\n');
				self.tdbs = d3.csvParseRows(text1,function(d,i){return +d[6]*1.8+32;});
				self.plotch()
			}
			reader.readAsText(event);
		},
	}
});


/*Test Function
var livingThings;

function test(){

	livingThings = crossfilter([
		{ name: 'Rusty',  type: 'human', legs: 2 },
		{ name: 'Alex',   type: 'human', legs: 2 },
		{ name: 'Lassie', type: 'dog',   legs: 4 },
		{ name: 'Spot',   type: 'dog',   legs: 4 },
		{ name: 'Polly',  type: 'bird',  legs: 2 },
		{ name: 'Fiona',  type: 'plant', legs: 0 }
	]);

	var n = livingThings.groupAll().reduceCount().value();
	var typeDimension = livingThings.dimension(function(d) { return d.type; });
	typeDimension.filter('dog')

};

*/


/* Test code
t0=performance.now()
t1=performance.now()
console.log(t1-t0)


var chart = dc.scatterPlot("#ch1");

fetch('simdataapi').then(dat=>dat.json()).then(js => {
	c = js;
});

var scf  = crossfilter(c);

eqdim = scf.dimension(d=>d.inp_equip);
eqdim.filter(d=>d<=1);

weadim = scf.dimension(d=>d.wea);
weadim.filter(d=>d=='Chicago_IL');

var euidim = scf.dimension(d=>[d.index , d.EUI]);
var euigrp = euidim.group();

var eqdim = scf.dimension(d=>d.inp_equip);

var oadim = scf.dimension(d=>d.inp_oa);
var wallinsdim = scf.dimension(d=>d.inp_wallins);

var schdim = scf.dimension(d=>d.inp_sch);
var idfdim = scf.dimension(d=>d.idf);
var weadim = scf.dimension(d=>d.wea);

//		eqdim.filter(d=>d>=10);
//		eqdim.filter(d=>d<=this.inp[1].max);

chart
	.brushOn(false)
	.x(d3.scaleLinear().domain([0,40000]))
	.dimension(euidim)
	.group(euigrp)
chart.render();



var paymentsRecord = [
	{date: "2011-11-14T16:17:54Z", quantity: 2, total: 190, tip: 80, type: "tab"},
	{date: "2011-11-14T16:20:19Z", quantity: 2, total: 190, tip: 80, type: "tab"},
	{date: "2011-11-14T16:28:54Z", quantity: 1, total: 300, tip: 50, type: "visa"},
	{date: "2011-11-14T16:30:43Z", quantity: 2, total: 90, tip: 20, type: "tab"},
	{date: "2011-11-14T16:48:46Z", quantity: 2, total: 90, tip: 40, type: "tab"},
	{date: "2011-11-14T16:53:41Z", quantity: 2, total: 90, tip: 60, type: "tab"},
	{date: "2011-11-14T16:54:06Z", quantity: 1, total: 100, tip: 80, type: "cash"},
	{date: "2011-11-14T16:58:03Z", quantity: 2, total: 90, tip: 20, type: "tab"},
	{date: "2011-11-14T17:07:21Z", quantity: 2, total: 90, tip: 60, type: "tab"},
	{date: "2011-11-14T17:22:59Z", quantity: 2, total: 90, tip: 40, type: "tab"},
	{date: "2011-11-14T17:25:45Z", quantity: 2, total: 200, tip: 40, type: "cash"},
	{date: "2011-11-14T17:29:52Z", quantity: 1, total: 200, tip: 80, type: "visa"}
];


var facts = crossfilter(paymentsRecord);

var scatterDimension = facts.dimension(d=>[d.total, d.tip]);
var scatterGroup = scatterDimension.group();

var scatter = dc.scatterPlot("#ch1"); 

scatter
	.dimension(scatterDimension)
	.brushOn(false)
	.group(scatterGroup)
	.x(d3.scaleLinear().domain([0,350]))
	.y(d3.scaleLinear().domain([-10,100]))
scatter.render();

var scatterDimension2 = facts.dimension(d=>d.tip);
scatterDimension2.filter(d=>d>80);


--crossfilter commands

crossfilter.size()
crossfilter.allFiltered() --print all filtered data
crossfilter.onChange(callbackFunction)

*/


