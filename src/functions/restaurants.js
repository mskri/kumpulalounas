const cheerio = require("cheerio");
const rp = require("request-promise");
const fs = require("fs");
const path = require("path");
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
            const menu = [];

            daySelectors.forEach(d => {
                const element = $(`${d} .4u`).first();
                let secondaryFoods = $(element).find("h4 + p");

                const title = $(element)
                    .find("h3")
                    .text()
                    .split(" ");

                // TODO: fix äö showing as box w/ question mark
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
                // Savor's list is missing year so add it to make the dates
                // normalized between all restaurants
                const date = title[1] + new Date().getFullYear();

                menu.push({
                    day,
                    date,
                    foods,
                    pizzas,
                    salads
                });
            });

            return { name: "Savor", menu, url: options.uri };
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
            const days = ["maanantai", "tiistai", "keskiviikko", "torstai", "perjantai"];
            const menu = [];
            let index = 0;

            $("#inner-content")
                .children("p")
                .map((i, e) => {
                    const elem = $(e).text();
                    const indexOfElement = days.findIndex(day => elem.toLowerCase().indexOf(day) > -1);

                    if (indexOfElement > -1) {
                        // e.g. Maanantai 11.11
                        const dayAndDate = elem.split(" ");
                        const day = dayAndDate[0];
                        const date = dayAndDate[1] + `.${new Date().getFullYear()}`; // To make full date

                        index = indexOfElement;
                        menu[index] = {
                            day,
                            date,
                            foods: []
                        };
                    } else {
                        if (menu[index] != null) menu[index].foods.push(elem);
                    }
                });

            // Remove the pricing info from Friday
            if (menu[4] != null) menu[4].foods.splice(menu[4].foods.length - 5, 5);

            return { name: "Ravintola 911", menu, url: options.uri };
        })
        .catch(e => console.error(e));
}

async function getFactoryVallila() {
    return getFactory("Buffet Factory", "https://ravintolafactory.com/lounasravintolat/ravintolat/helsinki-vallila/");
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
            const menu = [];
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

                    const day = title[0].replace("\n", "").trim();
                    const date = title[1];

                    menu.push({
                        day,
                        date,
                        foods
                    });
                }
            });

            return { name, menu, url: options.uri };
        })
        .catch(e => console.error(e));
}

async function fetchMenus() {
    const savor = getSavor();
    // const bistro = getFactoryBistro();
    const vallila = getFactoryVallila();
    const ravintola911 = getRavintola911();

    var lastUpdated = format(new Date(), "YYYY-MM-DD[T]HH:mm:ssZ");

    return await Promise.all([savor, vallila, ravintola911]).then(restaurants => {
        return {
            lastUpdated,
            restaurants
        };
    });
}

async function storeData() {
    const data = await fetchMenus();
    const file = path.join(__dirname, "../../public/data.json");
    fs.writeFile(file, JSON.stringify(data), err => {
        if (err) console.log(err);
        console.log(`Successfully wrote data to ${file}`);
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
