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

    var lastUpdated = format(new Date(), "YYYY-MM-DD[T]HH:mm:ssZ");

    return await Promise.all([savor, vallila, bistro]).then(restaurants => {
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

module.exports = async (req, res) => {
    const data = await fetchMenus();
    res.json(data);
};
