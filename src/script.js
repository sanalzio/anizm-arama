/* -- Globals -- */


var json;

let overflowAnimeJsons = [];

var params = new URL(location.href).searchParams;
var hostname = "anizm.net";

var queryInpClicked = false;

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
const clearQueryBtn = document.getElementById("clear-query");
const queryInput = document.getElementById("query");

const messageContainer = document.getElementById("message-container");
const messageElement = document.getElementById("message");
const loaderElement = document.getElementById("main-loader");
const resultsContainer = document.getElementById("results-container");

const resultsCountP = document.getElementById("results-count-p");
const resultsCount = document.getElementById("results-count");

const faviconLink = document.getElementById("favicon");
const logoImg = document.getElementById("logo");
const logoSmallImg = document.getElementById("logo-small");

const logoBtn = document.getElementById("logo-btn");

const footer = document.getElementById("footer");

const scrollToTop = document.getElementById("scroll-to-top");

const html = document.documentElement;


/* -- Elements -- */




/* -- Functions -- */


String.prototype.differenceCount = function (target) {
    let maxLength = Math.max(this.length, target.length);
    let diffCount = 0;

    for (let i = 0; i < maxLength; i++) {
        if (this[i] !== target[i]) {
            diffCount++;
        }
    }

    return diffCount;
}


function showMessage(message, loader=false) {
    resultsContainer.style.display = "none";

    messageElement.innerHTML = message;

    if (loader)
        loaderElement.style.display = "inline-block";
    else
        loaderElement.style.display = "none";

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
        info_title,
        info_titleenglish
    } = animeJson;

    let otherNames = [info_othernames?.trim(), info_titleenglish, info_japanese]
        .filter(name => name && name.toLowerCase() !== info_title.toLowerCase())
        .join(", ") || "-";

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
            <span class="card-mal-score">${info_malpoint ? info_malpoint.toString() : "-"}</span>
        </div>
    </div>
    <div class="card-details">
        <a href="https://${hostname}/${info_slug}" class="card-title">${info_title}</a>
        <p class="card-other-titles-container">
            <span class="card-other-titles-label">Diğer isimler:</span>
            <span class="card-other-titles">${otherNames}</span>
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


function search(searchQuery) {

    const query = searchQuery.toLowerCase().replace(/[^a-z\s]/g, "");




    /* Search with title matches */
    let matchedAnimes = json
        .filter(
            (anime) =>
                (anime.info_titleoriginal &&
                    anime.info_titleoriginal
                        .toLowerCase()
                        .replace(/[^a-z\s]/g, "")
                        .includes(query)) ||
                (anime.info_titleenglish &&
                    anime.info_titleenglish
                        .toLowerCase()
                        .replace(/[^a-z\s]/g, "")
                        .includes(query)) ||
                (anime.info_othernames &&
                    anime.info_othernames
                        .toLowerCase()
                        .replace(/[^a-z\s]/g, "")
                        .includes(query))
        ).sort(
            (a, b) =>
                a.info_titleoriginal.differenceCount(query) -
                b.info_titleoriginal.differenceCount(query)
        );


    let matchedAnimesLength = matchedAnimes.length;

    if (matchedAnimesLength > 0) {

        resultsCount.innerHTML = matchedAnimesLength;
        resultsCountP.style.display = "block";

        if (matchedAnimesLength > 7) {
            printCards(matchedAnimes.slice(0,7));
            overflowAnimeJsons = matchedAnimes.slice(7);

            footer.style.display = "none";
            return;
        }

        printCards(matchedAnimes);
        return;
    }




    /* Search with title similarity */
    const tryCount = Math.floor(query.length / 2);

    if (tryCount > 0) for (let i = 1; i <= tryCount; i++) {

        matchedAnimes = json.filter(
            (anime) =>

                (anime.info_titleoriginal &&
                    anime.info_titleoriginal
                        .toLowerCase()
                        .replace(/[^a-z\s]/g, "")
                        .differenceCount(query) === i) ||

                (anime.info_titleenglish &&
                    anime.info_titleenglish
                        .toLowerCase()
                        .replace(/[^a-z\s]/g, "")
                        .differenceCount(query) === i) ||

                (anime.info_othernames &&
                    anime.info_othernames
                        .toLowerCase()
                        .replace(/[^a-z\s]/g, "")
                        .differenceCount(query) === i)

        );
    
    
        matchedAnimesLength = matchedAnimes.length;
    
        if (matchedAnimesLength > 0) {
    
            resultsCount.innerHTML = matchedAnimesLength;
            resultsCountP.style.display = "block";
    
            if (matchedAnimesLength > 7) {
                printCards(matchedAnimes.slice(0,7));
                overflowAnimeJsons = matchedAnimes.slice(7);
    
                footer.style.display = "none";
                return;
            }

            printCards(matchedAnimes);
            return;
        }

        continue;
    }




    /* Search with keywords */

    const queryForKeywords = searchQuery.toLowerCase().replace(/[^a-z\s"']/g, "");

    const prepareKeyword = inp => {
        let kw = inp;
        if (kw.match(/^".+"$|^'.+'$/))
            kw = kw.slice(1, -1);
        return kw;
    }

    let queryKeywords = query.match(/"[a-z\s']+"|'[a-z\s"]+'|[a-z]+/g);
    queryKeywords = queryKeywords.filter(el => el.match(/^".+"$|^'.+'$/) || prepareKeyword(el).length >= query.length / queryKeywords.length);


    matchedAnimes = json.filter(
        (anime) =>

            (anime.info_titleoriginal &&
                queryKeywords
                    .some(el => anime.info_titleoriginal
                    .toLowerCase()
                    .replace(/[^a-z\s"']/g, "")
                    .includes(prepareKeyword(el)))) ||

            (anime.info_titleenglish &&
                queryKeywords
                        .some(el => anime.info_titleenglish
                        .toLowerCase()
                        .replace(/[^a-z\s"']/g, "")
                        .includes(prepareKeyword(el)))) ||

            (anime.info_othernames &&
                queryKeywords
                        .some(el => anime.info_othernames
                        .toLowerCase()
                        .replace(/[^a-z\s"']/g, "")
                        .includes(prepareKeyword(el))))

    ).sort(
            (a, b) =>
                a.info_titleoriginal.differenceCount(query) -
                b.info_titleoriginal.differenceCount(query)
        );


    matchedAnimesLength = matchedAnimes.length;

    if (matchedAnimesLength > 0) {

        resultsCount.innerHTML = matchedAnimesLength;
        resultsCountP.style.display = "block";

        if (matchedAnimesLength > 7) {
            printCards(matchedAnimes.slice(0,7));
            overflowAnimeJsons = matchedAnimes.slice(7);

            footer.style.display = "none";
            return;
        }

        printCards(matchedAnimes);
        return;
    }


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


queryInput.addEventListener("input", () => {
    if (queryInput.value === "") {
        clearQueryBtn.style.display = "none";
    } else {
        clearQueryBtn.style.display = "flex";
    }
});


clearQueryBtn.addEventListener("click", () => {
    queryInput.value = "";
    clearQueryBtn.style.display = "none";
    queryInput.focus();
});


scrollToTop.addEventListener("click", () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
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

            footer.style.display = "flex";

        }

    }

    if (html.scrollTop >= window.innerHeight) {

        if (main.clientHeight - html.scrollTop - html.clientHeight < footer.clientHeight)
            scrollToTop.style.bottom = "calc(" +
                (
                    footer.clientHeight -
                    (
                        main.clientHeight -
                        html.scrollTop -
                        html.clientHeight
                    )
                ).toString() +
                "px + 1rem";

        else
            scrollToTop.style.bottom = "1rem";


        if (getComputedStyle(scrollToTop).display == "none")
            scrollToTop.style.display = "inline";
    }
    else if (getComputedStyle(scrollToTop).display != "none")
        scrollToTop.style.display = "none";

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

        /* if (!location.host.match(/[\d]{3}\.[\d]\.[\d]\.[\d]:[\d]{4}/)) */ queryInput.focus();
        showMessage("Aramaya başlayın...");

    } else {
        
        const query = decodeURI(params.get("q"));

        document.title = query + " - Anizm arama";

        queryInput.value = query;
        clearQueryBtn.style.display = "flex";

        showMessage("Aranıyor...", true);

        const req = await fetch("https://anizm.net/getAnimeListForSearch");
        json = await req.json();

        search(query);

    }

});
