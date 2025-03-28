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

function anizmSearch_generateCard(animeJson) {
    const {
        info_othernames,
        info_japanese,
        info_year,
        info_malpoint,
        info_title,
        info_titleenglish
    } = animeJson;

    let otherNames = [info_othernames?.trim(), info_titleenglish, info_japanese]
        .filter(name => name && name.toLowerCase() !== info_title.toLowerCase())
        .join(", ") || "-";

    return `\n - ${info_title} -\n  Yıl: ${info_year || "-"}  Mal: ${info_malpoint?.toString() || "-"}\ndiğer: ${otherNames}\n`;
}

function anizmSearch_printCards(animes) {
    const animeCount = animes.length;
    for (let i = 0; i < animeCount; i++) {
        const anime = animes[i];
        console.write(anizmSearch_generateCard(anime));
    }
}

function anizmSearch_printMatchedAnimes() {
    let matchedAnimesLength = anizmSearch_matchedAnimes.length;

    if (matchedAnimesLength > 0) {

        anizmSearch_printCards(anizmSearch_matchedAnimes);

        console.log("\n" + matchedAnimesLength.toString() + " resuts found.");

        anizmSearch_matchedAnimes = new Array();

        return true;
    }
}

function isJapanese(str) {
    return str.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u30f2-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/) !== null;
}

function searchAnz(rawQuery) {
    
    const options = new Object();
    const optionsRegexp = /(maxmalp|minmalp|maxwords|minwords|minyear|maxyear|sort|orderby):(\d+|\w+)/gi;
    const optionsRegexpMatches = [...rawQuery.matchAll(optionsRegexp)];

    if (optionsRegexpMatches)
        optionsRegexpMatches.forEach(optionMatch => {
            const key = optionMatch[1].toLowerCase();
            options[key] = key == "sort" || key == "orderby" ? optionMatch[2].toLowerCase() : Number(optionMatch[2]);
        });

    const searchQuery = rawQuery.replace(optionsRegexp, "").replace(/\s\s+/g, " ").trim();
    const query = searchQuery.toLowerCase().replace(/[^a-z\d\s]/g, "");

    const controllOptions = (title, year, malpoint) => {

        if (title == undefined && (options.maxwords || options.minwords)) return false;
        if (malpoint == undefined && (options.maxmalp || options.minmalp)) return false;
        if (year == undefined && (options.maxyear || options.minyear)) return false;

        if (options.maxyear && year > options.maxyear) return false;
        if (options.minyear && year < options.minyear) return false;

        if (options.maxmalp && malpoint > options.maxmalp) return false;
        if (options.minmalp && malpoint < options.minmalp) return false;

        if (title == undefined) return false;
        const wordCount = title.split(" ").length;
        if (options.maxwords && wordCount > options.maxwords) return false;
        if (options.minwords && wordCount < options.minwords) return false;

        return true;
    };




    /* options search */

    if (searchQuery.length === 0) {
        anizmSearch_matchedAnimes = globalThis.anizmDB.filter(
            (anime) => 

                controllOptions(
                    anime.info_titleoriginal,
                    anime.info_year,
                    anime.info_malpoint,
                )

        ).sort(
            (a, b) => {

                if (options.sort) {

                    if (options.sort == "malp" && a.info_malpoint != undefined && b.info_malpoint != undefined) {
                        if (options.orderby == "asc")
                            return a.info_malpoint-b.info_malpoint;
                        return b.info_malpoint-a.info_malpoint;
                    }
                    if (options.sort == "year" && a.info_year != undefined && b.info_year != undefined) {
                        if (options.orderby == "asc")
                            return a.info_year-b.info_year;
                        return b.info_year-a.info_year;
                    }
                    if (options.sort == "wordcount") {
                        if (options.orderby == "asc")
                            return a.info_titleoriginal.split(" ").length-b.info_titleoriginal.split(" ").length;
                        return b.info_titleoriginal.split(" ").length-a.info_titleoriginal.split(" ").length;
                    }
                }

                if (options.orderby == "desc")
                    return b.info_titleoriginal.localeCompare(a.info_titleoriginal);

                return a.info_titleoriginal.localeCompare(b.info_titleoriginal);
            }
        );


        if (anizmSearch_printMatchedAnimes()) return;
        
        console.log("Sonuç bulunamadı.");
        return;
    }




    /* Japanese title search */

    if (isJapanese(searchQuery)) {

        const japaneseQuery = searchQuery.replace(/[\u3000-\u303f\s]/g, "");

        anizmSearch_matchedAnimes = globalThis.anizmDB.filter(
            (anime) =>
    
                (anime.info_japanese &&
                    anime.info_japanese
                        .replace(/[\u3000-\u303f\s]/g, "")
                        .includes(japaneseQuery) &&
                    controllOptions(
                        undefined,
                        anime.info_year,
                        anime.info_malpoint,
                    ))

        ).sort(
            (a, b) => {

                if (options.sort) {

                    if (options.sort == "malp" && a.info_malpoint != undefined && b.info_malpoint != undefined) {
                        if (options.orderby == "asc")
                            return a.info_malpoint-b.info_malpoint;
                        return b.info_malpoint-a.info_malpoint;
                    }
                    if (options.sort == "year" && a.info_year != undefined && b.info_year != undefined) {
                        if (options.orderby == "asc")
                            return a.info_year-b.info_year;
                        return b.info_year-a.info_year;
                    }
                    if (options.sort == "wordcount") {
                        if (options.orderby == "asc")
                            return a.info_titleoriginal.split(" ").length-b.info_titleoriginal.split(" ").length;
                        return b.info_titleoriginal.split(" ").length-a.info_titleoriginal.split(" ").length;
                    }
                }

                if (options.orderby == "desc")
                    return b.info_japanese.replace(/[\u3000-\u303f\s]/g, "").differenceCount(japaneseQuery) -
                    a.info_japanese.replace(/[\u3000-\u303f\s]/g, "").differenceCount(japaneseQuery);

                return a.info_japanese.replace(/[\u3000-\u303f\s]/g, "").differenceCount(japaneseQuery) -
                b.info_japanese.replace(/[\u3000-\u303f\s]/g, "").differenceCount(japaneseQuery);
            }
        );


        if (anizmSearch_printMatchedAnimes()) return;
    }




    /* Search with title matches */
    let findedIn = undefined;

    anizmSearch_matchedAnimes = globalThis.anizmDB.filter(
        (anime) => {

            if (
                anime.info_titleoriginal &&
                anime.info_titleoriginal
                    .toLowerCase()
                    .replace(/[^a-z\d\s]/g, "")
                    .includes(query) &&
                controllOptions(
                    anime.info_titleoriginal,
                    anime.info_year,
                    anime.info_malpoint,
                )
            ) {

                if (!findedIn) findedIn = 0;
                return true;
            }

            if (
                anime.info_titleenglish &&
                anime.info_titleenglish
                    .toLowerCase()
                    .replace(/[^a-z\d\s]/g, "")
                    .includes(query) &&
                controllOptions(
                    anime.info_titleenglish,
                    anime.info_year,
                    anime.info_malpoint,
                )
            ) {

                if (!findedIn) findedIn = 1;
                return true;
            }

            if (
                anime.info_othernames &&
                anime.info_othernames
                    .toLowerCase()
                    .replace(/[^a-z\d\s]/g, "")
                    .includes(query) &&
                controllOptions(
                    undefined,
                    anime.info_year,
                    anime.info_malpoint,
                )
            ) {

                return true;
            }

        }

    ).sort(
        (a, b) => {

            if (options.sort) {

                if (options.sort == "malp" && a.info_malpoint != undefined && b.info_malpoint != undefined) {
                    if (options.orderby == "asc")
                        return a.info_malpoint-b.info_malpoint;
                    return b.info_malpoint-a.info_malpoint;
                }
                if (options.sort == "year" && a.info_year != undefined && b.info_year != undefined) {
                    if (options.orderby == "asc")
                        return a.info_year-b.info_year;
                    return b.info_year-a.info_year;
                }
                if (options.sort == "wordcount") {
                    if (options.orderby == "asc")
                        return a.info_titleoriginal.split(" ").length-b.info_titleoriginal.split(" ").length;
                    return b.info_titleoriginal.split(" ").length-a.info_titleoriginal.split(" ").length;
                }
            }

            if (options.orderby == "desc") {

                if (findedIn === 0 || (!a.info_titleenglish && b.info_titleenglish))
                    return b.info_titleoriginal.toLowerCase().replace(/[^a-z\d\s]/g, "").differenceCount(query) - a.info_titleoriginal.toLowerCase().replace(/[^a-z\d\s]/g, "").differenceCount(query)
                else
                    return b.info_titleenglish.toLowerCase().replace(/[^a-z\d\s]/g, "").differenceCount(query) - a.info_titleenglish.toLowerCase().replace(/[^a-z\d\s]/g, "").differenceCount(query)
            }

            if (findedIn === 0 || (!a.info_titleenglish && b.info_titleenglish))
                return a.info_titleoriginal.toLowerCase().replace(/[^a-z\d\s]/g, "").differenceCount(query) - b.info_titleoriginal.toLowerCase().replace(/[^a-z\d\s]/g, "").differenceCount(query)
            else
                return a.info_titleenglish.toLowerCase().replace(/[^a-z\d\s]/g, "").differenceCount(query) - b.info_titleenglish.toLowerCase().replace(/[^a-z\d\s]/g, "").differenceCount(query)
        }
    );


    if (anizmSearch_printMatchedAnimes()) return;




    /* Search with keywords */

    const prepareKeyword = inp => {
        let kw = inp;
        if (kw.match(/^".+"$/))
            kw = kw.slice(1, -1);
        return kw;
    }

    let forcedKeywords = searchQuery
        .toLowerCase()
        .replace(/[^a-z\d"'\s]+/g, "")
        .match(/"[a-z\d\s']+"/g) || new Array();

    let normalKeywords = searchQuery
        .toLowerCase()
        .replace(/[^a-z\d"'\s]+/g, "")
        .match(/"[a-z\d\s']+"|[a-z\d]+/g);
    if (forcedKeywords) normalKeywords = normalKeywords.filter(el => !forcedKeywords.includes(el));

    anizmSearch_matchedAnimes = globalThis.anizmDB.filter(
            (anime) =>

                (anime.info_titleoriginal &&
                    normalKeywords.some((el) =>
                        anime.info_titleoriginal
                            .toLowerCase()
                            .replace(/[^a-z\d\s]/g, "")
                            .includes(el)
                    ) &&
                    forcedKeywords.every((el) =>
                        anime.info_titleoriginal
                            .toLowerCase()
                            .replace(/[^a-z\d\s]/g, "")
                            .includes(prepareKeyword(el))
                    ) &&
                    controllOptions(
                        anime.info_titleoriginal,
                        anime.info_year,
                        anime.info_malpoint
                    )) ||

                (anime.info_titleenglish &&
                    normalKeywords.some((el) =>
                        anime.info_titleenglish
                            .toLowerCase()
                            .replace(/[^a-z\d\s]/g, "")
                            .includes(el)
                    ) &&
                    forcedKeywords.every((el) =>
                        anime.info_titleenglish
                            .toLowerCase()
                            .replace(/[^a-z\d\s]/g, "")
                            .includes(prepareKeyword(el))
                    ) &&
                    controllOptions(
                        anime.info_titleenglish,
                        anime.info_year,
                        anime.info_malpoint
                    )) ||

                (anime.info_othernames &&
                    normalKeywords.some((el) =>
                        anime.info_othernames
                            .toLowerCase()
                            .replace(/[^a-z\d\s]/g, "")
                            .includes(el)
                    ) &&
                    forcedKeywords.every((el) =>
                        anime.info_othernames
                            .toLowerCase()
                            .replace(/[^a-z\d\s]/g, "")
                            .includes(
                                prepareKeyword(el, anime.info_titleoriginal)
                            )
                    ) &&
                    controllOptions(
                        undefined,
                        anime.info_year,
                        anime.info_malpoint
                    ))

        )
        .sort((a, b) => {
            if (options.sort) {
                if (
                    options.sort == "malp" &&
                    a.info_malpoint != undefined &&
                    b.info_malpoint != undefined
                ) {
                    if (options.orderby == "asc")
                        return a.info_malpoint - b.info_malpoint;
                    return b.info_malpoint - a.info_malpoint;
                }
                if (
                    options.sort == "year" &&
                    a.info_year != undefined &&
                    b.info_year != undefined
                ) {
                    if (options.orderby == "asc")
                        return a.info_year - b.info_year;
                    return b.info_year - a.info_year;
                }
            }

            if (options.orderby == "desc")
                return (
                    b.info_titleoriginal.toLowerCase().replace(/[^a-z\d\s]/g, "").differenceCount(query) -
                    a.info_titleoriginal.toLowerCase().replace(/[^a-z\d\s]/g, "").differenceCount(query)
                );

            return (
                a.info_titleoriginal.toLowerCase().replace(/[^a-z\d\s]/g, "").differenceCount(query) -
                b.info_titleoriginal.toLowerCase().replace(/[^a-z\d\s]/g, "").differenceCount(query)
            );
        });


    if (anizmSearch_printMatchedAnimes()) return;




    /* Search with title similarity */
    const tryCount = Math.floor(query.length / 2);

    if (tryCount > 0) for (let i = 1; i <= tryCount; i++) {

        anizmSearch_matchedAnimes = globalThis.anizmDB.filter(
            (anime) =>

                (anime.info_titleoriginal &&
                    anime.info_titleoriginal
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .differenceCount(query) === i &&
                    controllOptions(
                        anime.info_titleoriginal,
                        anime.info_year,
                        anime.info_malpoint,
                    )) ||

                (anime.info_titleenglish &&
                    anime.info_titleenglish
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .differenceCount(query) === i &&
                    controllOptions(
                        anime.info_titleenglish,
                        anime.info_year,
                        anime.info_malpoint,
                    )) ||

                (anime.info_othernames &&
                    anime.info_othernames
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .differenceCount(query) === i &&
                    controllOptions(
                        undefined,
                        anime.info_year,
                        anime.info_malpoint,
                    ))

        ).sort(
            (a, b) =>{

                if (options.sort) {

                    if (options.sort == "malp" && a.info_malpoint != undefined && b.info_malpoint != undefined) {
                        if (options.orderby == "asc")
                            return a.info_malpoint-b.info_malpoint;
                        return b.info_malpoint-a.info_malpoint;
                    }
                    if (options.sort == "year" && a.info_year != undefined && b.info_year != undefined) {
                        if (options.orderby == "asc")
                            return a.info_year-b.info_year;
                        return b.info_year-a.info_year;
                    }
                    if (options.sort == "wordcount") {
                        if (options.orderby == "asc")
                            return a.info_titleoriginal.split(" ").length-b.info_titleoriginal.split(" ").length;
                        return b.info_titleoriginal.split(" ").length-a.info_titleoriginal.split(" ").length;
                    }
                }
            }
        );


        if (anizmSearch_printMatchedAnimes()) return;

        continue;
    }


    console.log("Sonuç bulunamadı.");
}

var anizmSearch_matchedAnimes;
globalThis.anizmDB = require("./testdb.json");





searchAnz(`tante wa mou shindeiru`);
