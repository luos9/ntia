'use strict'; //treat silly mistakes as run-time errors

//set width,height and colors
var width = 500;
var height = 960;
var active = d3.select(null);

var highColor = '#2c7fb8'
var lowColor = '#edf8b1'

// D3 Projection
var projection = d3.geoAlbersUsa()
    .translate([width / 1.1, height / 3.6]) // translate to center of screen
    .scale([1000]); // scale things down so see entire US

// Define path generator
var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
    .projection(projection); // tell path generator to use albersUsa projection

//the SVG element to add visual content to
var svg = d3.select('#visContainer')
    .append('svg')
    .attr('height', width) //can adjust size as desired
    .attr('width', height);
    
var g = svg.append("g")
    .style("stroke-width", "1.5px");

var div = d3.select("#visContainer")
	.append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

//the main visualization function that enables loading
//different data column of the data set
function choosedata(datacol,domainname) {
    d3.csv("energy.csv", function(data) {
        var minVal = d3.min(data, function(d) { return parseFloat(d[datacol]) })
        var maxVal = d3.max(data, function(d) { return parseFloat(d[datacol]) })
        var ramp = d3.scaleLinear().domain([minVal, maxVal]).range([lowColor, highColor])
        //var ramp = d3.scaleLinear().domain([0, 1]).range([lowColor, highColor])
            // Load GeoJSON data and merge with states data
        //d3.json("https://raw.githubusercontent.com/alignedleft/d3-book/master/chapter_12/us-states.json", function(json) {
        d3.json("us-states.json", function(json) {

            // Loop through each state data value in the .csv file
            for (var i = 0; i < data.length; i++) {

                // Grab State Name
                var dataState = data[i].state;

                // Grab data value 
                var dataValue = data[i][datacol];

                // Find the corresponding state inside the GeoJSON
                for (var j = 0; j < json.features.length; j++) {
                    var jsonState = json.features[j].properties.name;

                    if (dataState == jsonState) {

                        // Copy the data value into the JSON
                        json.features[j].properties.value = dataValue;

                        // Stop looking through the JSON
                        break;
                    }
                }
            }

            //create tooltip when user hover on the map to show specific data
            var tooltip = d3.select("#tooltip")
                .append("div")
                .style("visibility", "hidden")

            //remove the old map before draw the new map
            svg.selectAll("path").remove();

            // Bind the data to the SVG and create one path per GeoJSON feature
            svg.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("class", "feature")
                .style("stroke", "#fff")
                .style("stroke-width", "1")
                .style("fill", function(d) { return ramp(d.properties.value) })
                .on("mouseover", function(d) {
                    div.transition()        
      	                .duration(200)      
                        .style("opacity", .9);     
                    div.text(Math.round(d.properties.value*1000)/10 + "% people in " + d.properties.name +Tooltip[domainname][datacol])
                        .style("left", (d3.event.pageX) + "px")     
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function() { 
                    div.transition()        
                        .duration(500)      
                        .style("opacity", 0);  
                })

            svg.append("path")
                // needs to modify
                .datum(topojson.mesh(json, json.features, function(a, b) { return a !== b; }))
                .attr("class", "mesh")
                .attr("d", path);


            // add a legend
            //set legend width and height
            var w = 165,
                h = 450;

            //create an area in the visualization for legend
            var key = d3.select("#visContainer")
                .append("svg")
                .attr("width", w)
                .attr("height", h)
                .attr("class", "legend");

            var legend = key.append("defs")
                .append("svg:linearGradient")
                .attr("id", "gradient")
                .attr("x1", "100%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "100%")
                .attr("spreadMethod", "pad")

            //set begin and end color for legend
            legend.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", highColor)
                .attr("stop-opacity", 1);

            legend.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", lowColor)
                .attr("stop-opacity", 1);

            //draw a bar to show color and corresponding data
            key.append("rect")
                .attr("width", w - 110)
                .attr("height", h-5)
                .style("fill", "url(#gradient)")
                .attr("transform", "translate(0,10)");

            //Create a linear scale for the y values. 
            var y = d3.scaleLinear()
                .range([h-5, 14])
                .domain([minVal, maxVal]);
                //.domain([0, 1]);


            //Define a right axis for the y-scale
            var yAxis = d3.axisRight(y);

            //Append a <g> element to the key to contain the yAxis.
            key.append("g")
                .attr("class", "y axis")
                .call(yAxis);
        });
        
    })
};


//set the default visualization
//var location = ['homeInternetUser','workInternetUser','travelingInternetUser','schoolInternetUser','libCommInternetUser','cafeInternetUser']
var myData=
   // {State:'location',freq:['homeInternetUser','workInternetUser','travelingInternetUser','schoolInternetUser','libCommInternetUser','cafeInternetUser']}];
   {"Internet Usage By Locations":['homeInternetUser','workInternetUser','travelingInternetUser','cafeInternetUser','libCommInternetUser','schoolInternetUser'],
   "Internet Usage By Devices":['mobilePhoneUser','laptopUser','tabletUser','tvBoxUser','wearableUser','internetUser'],
   "Main Reason for not going online at home":['noNeedInterestMainReason','tooExpensiveMainReason','noComputerMainReason','canUseElsewhereMainReason','privSecMainReason','unavailableMainReason'],
   "Online Activities":['healthRecordsUser','webUser','homeIOTUser','callConfUser','healthInfoUser','jobSearchUser','eCommerceUser','audioUser','onlineClassUser','teleworkUser','emailUser','healthMonitoringUser','financeUser','locationServicesUser','socialNetworkUser','textIMUser','videoUser'],
    "Internet service technologies":['wiredHighSpeedAtHome','mobileAtHome','satelliteAtHome','dialUpAtHome','mobileOutsideHome'],
    "Home Internet Bundling":['homeIncludedInternet','tvInBundle','homePhoneInBundle','mobilePhoneInBundle','homeSecInBundle'],
    "Most Important Aspect of Home Internet Usage":['reliabilityMostImportant','speedMostImportant','affordabilityMostImportant','dataCapMostImportant','mobilityMostImportant','serviceMostImportant']
};
var Tooltip=
   // {State:'location',freq:['homeInternetUser','workInternetUser','travelingInternetUser','schoolInternetUser','libCommInternetUser','cafeInternetUser']}];
   {'Internet Usage By Locations':{'homeInternetUser':' use Internet at home',
    'workInternetUser': ' use Internet at work',
    'travelingInternetUser':' use Internet in travels',
    'schoolInternetUser':' use Internet in school',
    'libCommInternetUser': ' use Internet in public',
    'cafeInternetUser': ' use Internet in cafe'},
    'Internet Usage By Devices':{'laptopUser':' use Internet on laptop',
    'mobilePhoneUser':' use Internet on mobile phone',
    'tvBoxUser':' use Internet on tvBox',
    'tabletUser':' use Internet on tablet',
    'wearableUser':' use Internet on wearable devices',
    'internetUser': ' use Internet'},
    'Main Reason for not going online at home':{'noNeedInterestMainReason':' don\'t use Internet because of no need/interest'
    ,'tooExpensiveMainReason':' don\'t use Internet because it\'s too expensive'
    ,'noComputerMainReason':' don\'t use Internet because of no computer',
    'canUseElsewhereMainReason':' don\'t use Internet because can use elsewhere',
    'privSecMainReason':' don\'t use Internet because of privacy concern',
    'unavailableMainReason':' don\'t use Internet because Internet not available'},
    "Online Activities":{'healthRecordsUser':'use Internet for health record'
    ,'webUser':'use Internet for websites'
    ,'homeIOTUser':'use Internet for home IOT device'
    ,'callConfUser':'use Internet for call conference',
    'healthInfoUser':'use Internet for health information',
    'jobSearchUser':'use Internet for job searching',
    'eCommerceUser':'use Internet for ecommerce',
    'audioUser':'use Internet for audio',
    'onlineClassUser':'use Internet for online class'
    ,'teleworkUser':'use Internet for telework',
    'emailUser':'use Internet for email',
    'healthMonitoringUser':'use Internet for health monitor',
    'financeUser':'use Internet for finance',
    'locationServicesUser':'use Internet for location service',
    'socialNetworkUser':'use Internet for social network ',
    'textIMUser':'use Internet for text message',
    'videoUser':'use Internet for health video'},
    "Internet service technologies":{'wiredHighSpeedAtHome':'have access of wired HighSpeed Internet At Home',
    'mobileAtHome':'have access of mobile Internet At Home'
    ,'satelliteAtHome':'have access of satellite Internet At Home',
    'dialUpAtHome':'have access of dial up Internet At Home',
    'mobileOutsideHome':'have access of mobile Internet outside Home'},
    "Home Internet Bundling":{'homeIncludedInternet':'Internet Bundling included in Home Plan',
    'tvInBundle':'Internet Bundling included in tv Plan',
    'homePhoneInBundle':'Internet Bundling included in Home Phone Plan',
    'mobilePhoneInBundle':'Internet Bundling included in mobile phone Plan',
    'homeSecInBundle':'Internet Bundling included in Home security Plan'},
    "Most Important Aspect of Home Internet Usage":{'reliabilityMostImportant':'think reliability is the most important',
    'speedMostImportant':'think speed is the most important',
    'affordabilityMostImportant':'think affordability is the most important',
    'dataCapMostImportant':'think data Cap is the most important',
    'mobilityMostImportant':'think mobility is the most important',
    'serviceMostImportant':'think customer service is the most important'}
}

choosedata(myData['Internet Usage By Locations'][0],'Internet Usage By Locations')
var selected = "Internet Usage By Locations"
var currentSelect = selected//[selected.length - 1]
//An example of handling multiple buttons!
d3.select('select').on('change', function Myfunction() {
    var selection = d3.select(d3.event.target)['_groups'][0]["0"].selectedOptions["0"].text;
    currentSelect = selection;
    choosedata(myData[selection][0],selection)

     if (selection == "Internet Usage By Devices") {
        d3.select("#DeviceDiv").attr('style',"display: '';");
        d3.select("#LocationDiv").attr('style',"display: none;");
        d3.select("#ReasonDiv").attr('style',"display: none;");
        d3.select("#OnlineDiv").attr('style',"display: none;");
        d3.select("#HomeBundDiv").attr('style',"display: none;");
        d3.select("#IntSevDiv").attr('style',"display: none;");
        d3.select("#MostDiv").attr('style',"display: none;");
    }
    else if (selection == "Internet Usage By Locations") {
        d3.select("#LocationDiv").attr('style',"display: '';");
        d3.select("#DeviceDiv").attr('style',"display: none;");
        d3.select("#ReasonDiv").attr('style',"display: none;");
        d3.select("#OnlineDiv").attr('style',"display: none;");
        d3.select("#HomeBundDiv").attr('style',"display: none;");
        d3.select("#IntSevDiv").attr('style',"display: none;");
        d3.select("#MostDiv").attr('style',"display: none;");
    }
     else if (selection == "Main Reason for not going online at home"){
        d3.select("#ReasonDiv").attr('style',"display: '';");
        d3.select("#DeviceDiv").attr('style',"display: none;")
        d3.select("#LocationDiv").attr('style', "display: none;")
        d3.select("#OnlineDiv").attr('style',"display: none;");
        d3.select("#HomeBundDiv").attr('style',"display: none;");
        d3.select("#IntSevDiv").attr('style',"display: none;");
        d3.select("#MostDiv").attr('style',"display: none;");
    }
    else if (selection == "Online Activities"){
        d3.select("#ReasonDiv").attr('style',"display: none;");
        d3.select("#DeviceDiv").attr('style',"display: none;")
        d3.select("#LocationDiv").attr('style', "display: none;")
        d3.select("#OnlineDiv").attr('style',"display: '';");
        d3.select("#HomeBundDiv").attr('style',"display: none;");
        d3.select("#IntSevDiv").attr('style',"display: none;");
        d3.select("#MostDiv").attr('style',"display: none;");
    }  
    else if (selection == "Internet service technologies"){
        d3.select("#ReasonDiv").attr('style',"display: none;");
        d3.select("#DeviceDiv").attr('style',"display: none;")
        d3.select("#LocationDiv").attr('style', "display: none;")
        d3.select("#OnlineDiv").attr('style',"display: none;");
        d3.select("#HomeBundDiv").attr('style',"display: none;");
        d3.select("#IntSevDiv").attr('style',"display: '';");
        d3.select("#MostDiv").attr('style',"display: none;");
    }  
    else if (selection == "Home Internet Bundling"){
        d3.select("#ReasonDiv").attr('style',"display: none;");
        d3.select("#DeviceDiv").attr('style',"display: none;")
        d3.select("#LocationDiv").attr('style', "display: none;")
        d3.select("#OnlineDiv").attr('style',"display: none;");
        d3.select("#HomeBundDiv").attr('style',"display: '';");
        d3.select("#IntSevDiv").attr('style',"display: none;");
        d3.select("#MostDiv").attr('style',"display: none;");
    }  
    else if (selection == "Most Important Aspect of Home Internet Usage"){
        d3.select("#ReasonDiv").attr('style',"display: none;");
        d3.select("#DeviceDiv").attr('style',"display: none;")
        d3.select("#LocationDiv").attr('style', "display: none;")
        d3.select("#OnlineDiv").attr('style',"display: none;");
        d3.select("#HomeBundDiv").attr('style',"display: none;");
        d3.select("#IntSevDiv").attr('style',"display: none;");
        d3.select("#MostDiv").attr('style',"display: '';");
    }  
})  

d3.selectAll('button').on('click', function() {
    var whichButton = d3.select(d3.event.target).attr('id');
    whichButton = Number(whichButton)
    choosedata(myData[currentSelect][whichButton],currentSelect)
});
