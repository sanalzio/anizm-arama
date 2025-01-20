/* -- Globals -- */


var json;

let overflowAnimeJsons = [];

var params = new URL(location.href).searchParams;
var hostname = "anizm.net";

const faviconPath = {
    orange: "./assets/favicon/orange.ico",
    green: "./assets/favicon/green.png",
    blue: "./assets/favicon/blue.png",
    pink: "./assets/favicon/pink.png"
}
const logoPath = {
    orange: "./assets/logo/orange.webp",
    green: "./assets/logo/green.webp",
    blue: "./assets/logo/blue.webp",
    pink: "./assets/logo/pink.webp"
}
const logoSmallPath = {
    orange: "./assets/icon/orange.png",
    green: "./assets/icon/green.png",
    blue: "./assets/icon/blue.png",
    pink: "./assets/icon/pink.png"
}


/* -- Globals -- */




/* -- Elements -- */


const themeLink = document.getElementById("theme-link");
const themeSelect = document.getElementById("theme-select");

const searchBtn = document.getElementById("search-btn");
const queryInput = document.getElementById("query");

const messageContainer = document.getElementById("message-container");
const messageElement = document.getElementById("message");
const loaderIcon = document.getElementById("loader-icon");
const resultsContainer = document.getElementById("results-container");

const resultsCountP = document.getElementById("results-count-p");
const resultsCount = document.getElementById("results-count");

const faviconLink = document.getElementById("favicon");
const logoImg = document.getElementById("logo");
const logoSmallImg = document.getElementById("logo-small");

const logoBtn = document.getElementById("logo-btn");

const html = document.documentElement;


/* -- Elements -- */




/* -- Functions -- */


function showMessage(message, loader=false) {
    resultsContainer.style.display = "none";

    messageElement.innerHTML = message;

    if (loader)
        loaderIcon.style.display = "inline-block";
    else
        loaderIcon.style.display = "none";

    messageContainer.style.display = "inline-block";
}


var decodeEntities = (function () {
    var element = document.createElement("div");

    function decodeHTMLEntities(str) {
        if (str && typeof str === "string") {
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, "");
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gim, "");
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = "";
        }

        return str;
    }

    return decodeHTMLEntities;
})();


function generateCard(animeJson) {
    const {
        info_othernames,
        info_japanese,
        info_summary,
        info_slug,
        info_poster,
        info_year,
        info_malpoint,
        info_title
    } = animeJson;

    const otherNames = info_othernames?.trim() || "-";
    const displayOtherNames = (otherNames === "-" ? info_japanese : `${otherNames}, ${info_japanese}`) || "-";

    const decodedSummary = decodeEntities(info_summary || "");
    const synopsis = (decodedSummary.match(/(?<=>)[^<]+/g)?.join(" ") || decodedSummary).trim();

    return `
<div class="result-card">
    <div class="card-left">
        <a href="https://${hostname}/${info_slug}">
            <img width="255px" height="321px" class="card-poster" src="https://anizm.net/storage/pcovers/${info_poster}" alt="${info_slug}-poster">
        </a>
        <div class="card-left-under">
            <span class="card-year">${info_year || "-"}</span>
            <span class="card-mal-score">${info_malpoint?.toString() || "-"}</span>
        </div>
    </div>
    <div class="card-details">
        <a href="https://${hostname}/${info_slug}" class="card-title">${info_title}</a>
        <p class="card-other-titles-container">
            <span class="card-other-titles-label">Diğer isimler:</span>
            <span class="card-other-titles">${displayOtherNames}</span>
        </p>
        <p class="card-synopsis">${synopsis}</p>
    </div>
</div>`;
}



function showResults() {
    messageContainer.style.display = "none";
    resultsContainer.style.display = "flex";
}


function switchTheme(themeId) {
    if ( themeId != "blue" &&
    themeId != "green" &&
    themeId != "pink" &&
    themeId != "orange" ) {
        return;
    }

    faviconLink.href = faviconPath[themeId];
    logoImg.src = logoPath[themeId];
    logoSmallImg.src = logoSmallPath[themeId];

    themeSelect.value = themeId
    themeLink.href = `styles/${themeId}_theme.css`;
}


function printCards(matchedAnimes) {

    for (let i = 0; i < matchedAnimes.length; i++) {
        const animeJson = matchedAnimes[i];
        resultsContainer.innerHTML += generateCard(animeJson);
    }

    showResults();

}


function search(query) {

    const matchedAnimes = json.filter(
        (anime) =>
            (anime.info_titleoriginal &&
                anime.info_titleoriginal
                    .toLowerCase()
                    .includes(query)) ||
            (anime.info_titleenglish &&
                anime.info_titleenglish
                    .toLowerCase()
                    .includes(query)) ||
            (anime.info_othernames &&
                anime.info_othernames
                    .toLowerCase()
                    .includes(query))/*  ||
            (anime.info_japanese &&
                anime.info_japanese
                    .toLowerCase()
                    .includes(query)) */
    );


    let matchedAnimesLength = matchedAnimes.length;

    if (matchedAnimesLength > 0) {

        resultsCount.innerHTML = matchedAnimesLength;
        resultsCountP.style.display = "block";

        if (matchedAnimesLength > 7) {
            printCards(matchedAnimes.slice(0,7));
            overflowAnimeJsons = matchedAnimes.slice(7);
        }

        else
            printCards(matchedAnimes);

    }
    else
        showMessage("Sonuç bulunamadı.");

}


/* -- Functions -- */




/* -- Event listeners -- */


themeSelect.addEventListener("change", () => {

    location.hash = "#theme=" + themeSelect.value;
    switchTheme(themeSelect.value);

});


searchBtn.addEventListener("click", () => {

    let hostnameParameter = "";

    if (params.get("hostname"))
        hostnameParameter = "hostname=" + hostname + "&";

    location.search = "?" + hostnameParameter + "q=" + encodeURI(queryInput.value);

});


queryInput.addEventListener("keypress", function (event) {

    if (event.key === "Enter") {

        event.preventDefault();

        searchBtn.click();
    }
});


window.addEventListener("scroll", () => {

    if (overflowAnimeJsons.length > 0 && html.offsetHeight + html.scrollTop >= html.scrollHeight) {

        if (overflowAnimeJsons.length > 7) {

            printCards(overflowAnimeJsons.slice(0,7));
            overflowAnimeJsons = overflowAnimeJsons.slice(7);

        }

        else {

            printCards(overflowAnimeJsons);
            overflowAnimeJsons = {};

        }

    }
});


/* -- Event listeners -- */




document.addEventListener("DOMContentLoaded", async () => {

    if (location.hash.length > 0) {
        switchTheme(location.hash.slice(7));
    }

    if (params.get("hostname")) {
        hostname = params.get("hostname");
        logoBtn.href = "https://" + hostname;
    }


    if (!params.get("q")) {

        queryInput.focus();
        showMessage("Aramaya başlayın...");

    } else {
        
        const query = decodeURI(params.get("q"));

        document.title = query + " - Anizm arama";

        queryInput.value = query;

        if (query.length > 2) {

            showMessage("Aranıyor...", true);

            const req = await fetch("https://anizm.net/getAnimeListForSearch");
            json = await req.json();

            search(query.toLowerCase());

        }
        else {
            showMessage("En az 3 karakterli bir arama yapınız.");
        }

    }

});
