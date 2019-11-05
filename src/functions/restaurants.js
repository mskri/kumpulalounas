const cheerio = require("cheerio");
const rp = require("request-promise");
var fs = require("fs");
const format = require("date-fns/format");

const finDayNames = ["maanantai", "tiistai", "keskiviikko", "torstai", "perjantai"];

async function getSavor() {
    const options = {
        uri: "http://savor.fi/lounaslistat/vallila/",
        transform: function(body) {
            return cheerio.load(body, { normalizeWhitespace: true });
        }
    };

    return rp(options)
        .then($ => {
            const daySelectors = ["#ma", "#ti", "#ke", "#ke", "#to", "#pe"];
            const menuFi = [];
            const menuEn = [];

            daySelectors.forEach(d => {
                $(`${d} .4u`).each((_, element) => {
                    let secondaryFoods = $(element).find("h4 + p");

                    const title = $(element)
                        .find("h3")
                        .text()
                        .split(" ");

                    const foods = $(element)
                        .find("h3 + p")
                        .text()
                        .replace(/\t/g, "")
                        .split("\n")
                        .filter(s => s.length);

                    let pizzas = secondaryFoods
                        .first()
                        .text()
                        .split("\n");

                    let salads = secondaryFoods
                        .last()
                        .text()
                        .split("\n");

                    const day = title[0];
                    const date = title[1] + new Date().getFullYear();
                    const arr = finDayNames.includes(day.toLowerCase()) ? menuFi : menuEn;

                    arr.push({
                        day,
                        // Savor's list is missing year so add it to make the dates
                        // normalized between all restaurants
                        date,
                        foods,
                        pizzas,
                        salads
                    });
                });
            });

            return { restaurantName: "Savor", menus: { fi: menuFi, en: menuEn } };
        })
        .catch(e => console.error(e));
}

async function getFactoryBistro() {
    return getFactory("Bistro Factory", "https://ravintolafactory.com/lounasravintolat/ravintolat/bistro/");
}

async function getRavintola911() {
    const options = {
        uri: "http://www.ravintola911.fi/kumpulantien-lounaslista/",
        transform: function(body) {
            return cheerio.load(body, { normalizeWhitespace: true });
        }
    };

    return rp(options)
        .then($ => {
            const menuFi = [];
            const menuEn = [];
            let index = 0;

            $("#inner-content")
                .children("p")
                .map((i, e) => {
                    const txt = $(e).text();

                    if (txt.toLowerCase().indexOf("maanantai") > -1) {
                        index = 0;
                        menuFi[index] = {
                            day: "Maanantai",
                            date: "",
                            foods: []
                        };
                    }

                    if (txt.toLowerCase().indexOf("tiistai") > -1) {
                        index = 1;
                        menuFi[index] = {
                            day: "Tiistai",
                            date: "",
                            foods: []
                        };
                    }

                    if (txt.toLowerCase().indexOf("keskiviikko") > -1) {
                        index = 2;
                        menuFi[index] = {
                            day: "Keskiviikko",
                            date: "",
                            foods: []
                        };
                    }

                    if (txt.toLowerCase().indexOf("torstai") > -1) {
                        index = 3;
                        menuFi[index] = {
                            day: "Torstai",
                            date: "",
                            foods: []
                        };
                    }

                    if (txt.toLowerCase().indexOf("perjantai") > -1) {
                        index = 4;
                        menuFi[index] = {
                            day: "Perjantai",
                            date: "",
                            foods: []
                        };
                    }

                    menuFi[index].foods.push(txt);
                });

            // Removes the first element which is the day name + date
            menuFi[0].foods.shift();
            menuFi[1].foods.shift();
            menuFi[2].foods.shift();
            menuFi[3].foods.shift();
            menuFi[4].foods.shift();
            menuFi[4].foods.splice(menuFi[4].foods.length - 5, 5); // Remove the pricing info

            return { restaurantName: "Ravintola 911", menus: { fi: menuFi, en: menuEn } };
        })
        .catch(e => console.error(e));
}

async function getFactoryVallila() {
    return getFactory("Factory", "https://ravintolafactory.com/lounasravintolat/ravintolat/helsinki-vallila/");
}

async function getFactory(name, uri) {
    const options = {
        uri,
        transform: function(body) {
            return cheerio.load(body);
        }
    };

    return rp(options)
        .then($ => {
            const container = $("h2.lounaslista").siblings("h3");
            const menuFi = [];
            const menuEn = [];

            $("img").remove();

            // Finnish and English menu items are all inside the same div with same
            // strucutre, the array defines each day as [finItemIndex, engItemIndex]
            // so that we can pick both languages during the loop
            const daySelectors = [[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]];

            daySelectors.forEach(indexes => {
                for (let index of indexes) {
                    const element = container.eq(index);
                    const title = element.text().split(" ");

                    // Sometimes Factory menu does not have translations. Exit early when
                    // we detect a empty title is found
                    if (!title[0]) break;

                    let foods = element
                        .next("p")
                        .text()
                        .split("\n")
                        .filter(str => str.length);

                    // For some reason sometimes the menu has a image inside a <p> tag
                    // and another <p> tag as it's sibling with the food list. Other times
                    // the image is inside the same <p> tag where the food list is
                    if (foods.length === 0) {
                        foods = element
                            .next("p")
                            .next("p")
                            .text()
                            .split("\n")
                            .filter(str => str.length);
                    }

                    const day = title[0];
                    const date = title[1];
                    const arr = finDayNames.includes(day.toLowerCase()) ? menuFi : menuEn;

                    arr.push({
                        day,
                        date,
                        foods
                    });
                }
            });

            return { restaurantName: name, menus: { fi: menuFi, en: menuEn } };
        })
        .catch(e => console.error(e));
}

async function fetchMenus() {
    const savor = getSavor();
    const bistro = getFactoryBistro();
    const vallila = getFactoryVallila();
    const ravintola911 = getRavintola911();

    var lastUpdated = format(new Date(), "YYYY-MM-DD[T]HH:mm:ssZ");

    return await Promise.all([savor, vallila, ravintola911, bistro]).then(restaurants => {
        return {
            lastUpdated,
            restaurants
        };
    });
}

async function storeData() {
    const data = await fetchMenus();

    fs.writeFile("../../public/data.json", JSON.stringify(data), err => {
        if (err) console.log(err);
        console.log("Successfully written to file");
    });
}

async function logData() {
    const data = await fetchMenus();
    console.log(JSON.stringify(data));
}

module.exports = async (req, res) => {
    const data = await fetchMenus();
    console.log(data);
    res.json(data);
};

// logData();
