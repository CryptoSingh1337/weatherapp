const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const _ = require("lodash");

const app = express();
const port = 8080;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const apiKey = "bc3fe16715d85cd29e6bcc0b8be61695";
const unit = "&units=metric";

app.get("/", (req, res) => {
    const url = "https://api.openweathermap.org/data/2.5/weather?appid=" + apiKey + "&q=delhi" + unit;
    https.get(url, response => {
        if (response.statusCode === 200) {
            renderResponse(response, res);
        } else {
            res.send('<script>alert("Error Code: "' + response.statusCode + '"!")');
        }
    })
});

app.post("/", (req, res) => {
    const query = Number(req.body.queryType);
    let para_1, para_2;
    let url = "https://api.openweathermap.org/data/2.5/weather?appid=" + apiKey + "&";
    switch(query) {
        case 1: 
            para_1 = _.toLower(req.body.city_name);
            para_2 = _.toLower(req.body.c_code);
            url = url + "q=" + para_1 + "," + para_2 + unit;
            break;
        case 2:
            para_1 = req.body.lat;
            para_2 = req.body.long;
            url = url + "lat=" + para_1 + "&" + para_2 + unit;
            break;
        case 3:
            para_1 = req.body.zip_code;
            para_2 = _.toLower(req.body.c_code);
            url = url + "zip=" + para_1 + "," + para_2 + unit;
            break;
    }
    https.get(url, response => {
        if(response.statusCode === 200) {
            renderResponse(response, res);
        } else if(response.statusCode === 404) {
            res.send('<script>alert("404 - Error: Invalid Data!")</script>');
        } else {
            res.send('<script>alert("Error Code: ' + response.statusCode + '"!")</script>');
        }
    });
});

function renderResponse(response, res) {
    response.on("data", (data) => {
        const wData = JSON.parse(data);
        const wIco = wData.weather[0].icon;
        const wMain = wData.weather[0].main;
        const temp = wData.main.temp;
        const _location = wData.name;
        const wImage = "http://openweathermap.org/img/wn/" + wIco + "@2x.png";
        res.render("index", { temperature: temp, location: _location , imageurl: wImage, wName: wMain });
    });
}

app.get("*", (req,res) => {
    res.redirect("/");
});

app.listen(process.env.PORT || port, () => {
    console.log("Server started on port: " + port);
});