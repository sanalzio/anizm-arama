String.prototype.levenshteinDistance = function (target) {
	let strA = this;
	if (strA.length === 0) return target.length;
	if (target.length === 0) return strA.length;
	if (strA.length < target.length) [strA, target] = [ target, strA ];
	else if (strA === target) return 0;

	var costX = new Int32Array(strA.length + 1);
	for (let i = 0; i < costX.length; i++) costX[i] = i;
	var costY = new Int32Array(strA.length + 1);
	for (let i = 0; i < target.length; i++) {
		costY[0] = i + 1;
		for (let j = 0; j < strA.length; j++) {
			costY[j + 1] = Math.min(
				costY[j] + 1, // deletion
				costX[j + 1] + 1, // insertion
				strA[j] === target[i] ? costX[j] : (costX[j] + 1) // replacement
			);
		}
		[costX, costY] = [ costY, costX ];
	}
	return costX[strA.length];
}

const parseYear = (year) => {
    let parsedYear = year;
    if (year.length < 4 || year.toLowerCase() == "null") return false;
    if (year.length > 4) {
        let matchYear = year.match(/\d{4}/);
        if (matchYear) parsedYear = matchYear;
        else return false;
    }
    return parsedYear;
};
const getEpisodeCount = (lastEpisode) => {
    let episodeCount = lastEpisode[0].episode_sort;
    if (episodeCount < 1) episodeCount = 1;
    if (episodeCount > 9999 && lastEpisode[1])
        for (let i = 1; i < lastEpisode.length; i++) {
            if (lastEpisode[i].episode_sort && lastEpisode[i].episode_sort < 9999)
                episodeCount = lastEpisode[i].episode_sort + i;
        }
    return episodeCount;
};

function anizmSearch_generateCard(animeJson) {
    const {
        info_othernames,
        info_japanese,
        info_year,
        info_malpoint,
        info_title,
        info_titleenglish,
        lastEpisode
    } = animeJson;


    let otherNames = [info_titleenglish, info_othernames?.trim(), info_japanese]
        .filter(name => name && name.toLowerCase() !== info_title.toLowerCase())
        .join(", ") || "-";
    
    
    let year = "?";
    if (info_year) year = parseYear(info_year);

    return `\n - ${info_title} -\n Yıl: ${year}  Mal: ${info_malpoint?.toString() || "-"}  Eps: ${lastEpisode != undefined ? getEpisodeCount(lastEpisode).toString() : "-"}\ndiğer: ${otherNames}\n`;
}

function anizmSearch_printCards(animes) {
    const animeCount = animes.length;
    for (let i = 0; i < animeCount; i++) {
        const anime = animes[i];
        console.write(anizmSearch_generateCard(anime));
    }
}

function anizmSearch_printMatchedAnimes(matchedAnimesLength) {

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

function searchAnz(rawQuery, messageFunc, noFoundMsg) {

    const options = new Object();
    const optionsRegexp = /(maxmalp|minmalp|malp|maxwords|minwords|wordcount|minyear|maxyear|year|maxeps|mineps|eps|sort|orderby):(\d+|\w+)/gi;
    const optionsRegexpMatches = [...rawQuery.matchAll(optionsRegexp)];

    if (optionsRegexpMatches)
        optionsRegexpMatches.forEach(optionMatch => {

            const key = optionMatch[1].toLowerCase();

            switch(key) {

                case "sort":
                case "orderby":
                    options[key] = optionMatch[2].toLowerCase();
                    break;

                case "year":
                    options[key] = optionMatch[2];
                    break;

                default:
                    options[key] = Number(optionMatch[2]);
                    break;
            }
        });

    const controllOptions = (title, year, malpoint, lastEpisode) => {

        if (
            (title == undefined && (options.maxwords || options.minwords || options.wordcount)) ||
            (malpoint == undefined && (options.maxmalp || options.minmalp || options.malp)) ||
            (year == undefined && (options.maxyear || options.minyear || options.year)) ||
            (lastEpisode == undefined && (options.maxeps || options.mineps || options.eps))
        ) return false;
    
        if (
            (options.maxmalp && malpoint > options.maxmalp) ||
            (options.minmalp && malpoint < options.minmalp) ||
            (options.malp && malpoint !== options.malp)
        ) return false;
    
    
        if (options.maxyear || options.minyear || options.year) {
    
            let parsedYear = parseYear(year);
            if (!parsedYear) return false;
    
            if (
                (options.maxyear && parsedYear > options.maxyear) ||
                (options.minyear && parsedYear < options.minyear) ||
                (options.year && parsedYear !== options.year)
            ) return false;
        }
    
    
        if (options.maxwords || options.minwords || options.wordcount) {
            const wordCount = title.split(" ").length;
            if (
                (options.maxwords && wordCount > options.maxwords) ||
                (options.minwords && wordCount < options.minwords) ||
                (options.wordcount && wordCount !== options.wordcount)
            ) return false;
        }
    
    
        if (options.maxeps || options.mineps || options.eps) {
            let episodeCount = getEpisodeCount(lastEpisode);
            if (
                (options.maxeps && episodeCount > options.maxeps) ||
                (options.mineps && episodeCount < options.mineps) ||
                (options.eps && episodeCount !== options.eps)
            ) return false;
        }
    
        return true;
    };

    const searchQuery = rawQuery.replace(optionsRegexp, "").replace(/\s\s+/g, " ").trim();
    const query = searchQuery.toLowerCase().replace(/[,.:;\-]/g, " ").replace(/\s\s+/g, " ").replace(/[^a-z\d\s]/g, "");





    /* options search */

    if (searchQuery.length === 0) {
        anizmSearch_matchedAnimes = globalThis.anizmDB.filter(
            (anime) => 

                controllOptions(
                    anime.info_titleoriginal,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode
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
                        let parsedYearA = parseYear(a.info_year);
                        let parsedYearB = parseYear(b.info_year);

                        if (options.orderby == "asc")
                            return Number(parsedYearA)-Number(parsedYearB);
                        return Number(parsedYearB)-Number(parsedYearA);
                    }
                    if (options.sort == "wordcount") {
                        if (options.orderby == "asc")
                            return a.info_titleoriginal.split(" ").length-b.info_titleoriginal.split(" ").length;
                        return b.info_titleoriginal.split(" ").length-a.info_titleoriginal.split(" ").length;
                    }
                    if (options.sort == "epcount" && a.lastEpisode != undefined && b.lastEpisode != undefined) {
                        if (options.orderby == "asc")
                            return getEpisodeCount(a.lastEpisode)-getEpisodeCount(b.lastEpisode);
                        return getEpisodeCount(b.lastEpisode)-getEpisodeCount(a.lastEpisode);
                    }
                }

                if (options.orderby == "desc")
                    return b.info_titleoriginal.localeCompare(a.info_titleoriginal);

                return a.info_titleoriginal.localeCompare(b.info_titleoriginal);
            }
        );


        if (anizmSearch_printMatchedAnimes(anizmSearch_matchedAnimes.length)) return;

        messageFunc(noFoundMsg);
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
                        anime.lastEpisode
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
                        let parsedYearA = parseYear(a.info_year);
                        let parsedYearB = parseYear(b.info_year);

                        if (options.orderby == "asc")
                            return Number(parsedYearA)-Number(parsedYearB);
                        return Number(parsedYearB)-Number(parsedYearA);
                    }
                    if (options.sort == "wordcount") {
                        if (options.orderby == "asc")
                            return a.info_titleoriginal.split(" ").length-b.info_titleoriginal.split(" ").length;
                        return b.info_titleoriginal.split(" ").length-a.info_titleoriginal.split(" ").length;
                    }
                    if (options.sort == "epcount" && a.lastEpisode != undefined && b.lastEpisode != undefined) {
                        if (options.orderby == "asc")
                            return getEpisodeCount(a.lastEpisode)-getEpisodeCount(b.lastEpisode);
                        return getEpisodeCount(b.lastEpisode)-getEpisodeCount(a.lastEpisode);
                    }
                }

                if (options.orderby == "desc")
                    return b.info_japanese.replace(/[\u3000-\u303f\s]/g, "").levenshteinDistance(japaneseQuery) -
                    a.info_japanese.replace(/[\u3000-\u303f\s]/g, "").levenshteinDistance(japaneseQuery);

                return a.info_japanese.replace(/[\u3000-\u303f\s]/g, "").levenshteinDistance(japaneseQuery) -
                b.info_japanese.replace(/[\u3000-\u303f\s]/g, "").levenshteinDistance(japaneseQuery);
            }
        );


        if (anizmSearch_printMatchedAnimes(anizmSearch_matchedAnimes.length)) return;

        messageFunc(noFoundMsg);
        return;
    }




    /* Search with title matches */
    let findedIn;

    anizmSearch_matchedAnimes = globalThis.anizmDB.filter(
        (anime) => {

            if (
                anime.info_titleoriginal &&
                anime.info_titleoriginal
                    .toLowerCase()
                    .replace(/[,.:;\-]/g, " ")
                    .replace(/\s\s+/g, " ")
                    .replace(/[^a-z\d\s]/g, "")
                    .includes(query) &&
                controllOptions(
                    anime.info_titleoriginal,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode
                )
            ) {

                if (findedIn == undefined) findedIn = 0;
                return true;
            }

            if (
                anime.info_titleenglish &&
                anime.info_titleenglish
                    .toLowerCase()
                    .replace(/[,.:;\-]/g, " ")
                    .replace(/\s\s+/g, " ")
                    .replace(/[^a-z\d\s]/g, "")
                    .includes(query) &&
                controllOptions(
                    anime.info_titleenglish,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode
                )
            ) {

                if (findedIn == undefined) findedIn = 1;
                return true;
            }

            if (
                anime.info_othernames &&
                anime.info_othernames
                    .toLowerCase()
                    .replace(/[,.:;\-]/g, " ")
                    .replace(/\s\s+/g, " ")
                    .replace(/[^a-z\d\s]/g, "")
                    .includes(query) &&
                controllOptions(
                    undefined,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode
                )
            ) {

                return true;
            }

            if (
                anime.info_studios &&
                anime.info_studios
                    .toLowerCase()
                    .replace(/[,.:;\-]/g, " ")
                    .replace(/\s\s+/g, " ")
                    .replace(/[^a-z\d\s]/g, "")
                    .includes(query) &&
                controllOptions(
                    undefined,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode
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
                    let parsedYearA = parseYear(a.info_year);
                    let parsedYearB = parseYear(b.info_year);

                    if (options.orderby == "asc")
                        return Number(parsedYearA)-Number(parsedYearB);
                    return Number(parsedYearB)-Number(parsedYearA);
                }
                if (options.sort == "wordcount") {
                    if (options.orderby == "asc")
                        return a.info_titleoriginal.split(" ").length-b.info_titleoriginal.split(" ").length;
                    return b.info_titleoriginal.split(" ").length-a.info_titleoriginal.split(" ").length;
                }
                if (options.sort == "epcount" && a.lastEpisode != undefined && b.lastEpisode != undefined) {
                    if (options.orderby == "asc")
                        return getEpisodeCount(a.lastEpisode)-getEpisodeCount(b.lastEpisode);
                    return getEpisodeCount(b.lastEpisode)-getEpisodeCount(a.lastEpisode);
                }
                if (options.sort == "title") {
                    if (options.orderby == "desc")
                        return (findedIn === 1 && a.info_titleenglish && b.info_titleenglish) ? b.info_titleenglish.localeCompare(a.info_titleenglish) : b.info_titleoriginal.localeCompare(a.info_titleoriginal);
                    return (findedIn === 1 && a.info_titleenglish && b.info_titleenglish) ? a.info_titleenglish.localeCompare(b.info_titleenglish) : a.info_titleoriginal.localeCompare(b.info_titleoriginal);
                }
            }

            if (options.orderby == "desc") {

                if (findedIn === 1 && a.info_titleenglish && b.info_titleenglish)
                    return b.info_titleenglish.toLowerCase().replace(/[^a-z\d\s]/g, "").levenshteinDistance(query) - a.info_titleenglish.toLowerCase().replace(/[^a-z\d\s]/g, "").levenshteinDistance(query)
                else
                    return b.info_titleoriginal.toLowerCase().replace(/[^a-z\d\s]/g, "").levenshteinDistance(query) - a.info_titleoriginal.toLowerCase().replace(/[^a-z\d\s]/g, "").levenshteinDistance(query)
            }

            if (findedIn === 1 && a.info_titleenglish && b.info_titleenglish)
                return a.info_titleenglish.toLowerCase().replace(/[^a-z\d\s]/g, "").levenshteinDistance(query) - b.info_titleenglish.toLowerCase().replace(/[^a-z\d\s]/g, "").levenshteinDistance(query)
            else
                return a.info_titleoriginal.toLowerCase().replace(/[^a-z\d\s]/g, "").levenshteinDistance(query) - b.info_titleoriginal.toLowerCase().replace(/[^a-z\d\s]/g, "").levenshteinDistance(query)
        }
    );


    if (anizmSearch_printMatchedAnimes(anizmSearch_matchedAnimes.length)) return;




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
        .replace(/[,.:;\-]/g, " ")
        .replace(/[^a-z\d"'\s]+/g, "")
        .match(/"[a-z\d\s']+"|[a-z\d]+/g)
        .filter(el =>
            el.length > 1 &&
            el.length >= (searchQuery.length / 2) / searchQuery.split(" ").length
        );
    if (forcedKeywords) normalKeywords = normalKeywords.filter(el => !forcedKeywords.includes(el));

    const keywordsSort = matched => matched.sort((a, b) => {
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
                let parsedYearA = parseYear(a.info_year);
                let parsedYearB = parseYear(b.info_year);

                if (options.orderby == "asc")
                    return Number(parsedYearA)-Number(parsedYearB);
                return Number(parsedYearB)-Number(parsedYearA);
            }
            if (options.sort == "wordcount") {
                if (options.orderby == "asc")
                    return a.info_titleoriginal.split(" ").length-b.info_titleoriginal.split(" ").length;
                return b.info_titleoriginal.split(" ").length-a.info_titleoriginal.split(" ").length;
            }
            if (options.sort == "epcount" && a.lastEpisode != undefined && b.lastEpisode != undefined) {
                if (options.orderby == "asc")
                    return getEpisodeCount(a.lastEpisode)-getEpisodeCount(b.lastEpisode);
                return getEpisodeCount(b.lastEpisode)-getEpisodeCount(a.lastEpisode);
            }
            if (options.sort == "title") {
                if (options.orderby == "desc")
                    return b.info_titleoriginal.localeCompare(a.info_titleoriginal);
                return a.info_titleoriginal.localeCompare(b.info_titleoriginal);
            }
        }

        if (options.orderby == "desc")
            return (
                b.info_titleoriginal.toLowerCase().replace(/[^a-z\d\s]/g, "").levenshteinDistance(query) -
                a.info_titleoriginal.toLowerCase().replace(/[^a-z\d\s]/g, "").levenshteinDistance(query)
            );

        return (
            a.info_titleoriginal.toLowerCase().replace(/[^a-z\d\s]/g, "").levenshteinDistance(query) -
            b.info_titleoriginal.toLowerCase().replace(/[^a-z\d\s]/g, "").levenshteinDistance(query)
        );
    });

    // every keywords necessary search
    anizmSearch_matchedAnimes = keywordsSort(globalThis.anizmDB.filter(
        (anime) =>

            (anime.info_titleoriginal &&
                normalKeywords.every(el =>
                    anime.info_titleoriginal
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .includes(el)
                ) &&
                forcedKeywords.every(el =>
                    anime.info_titleoriginal
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .includes(prepareKeyword(el))
                ) &&
                controllOptions(
                    anime.info_titleoriginal,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode
                )) ||

            (anime.info_titleenglish &&
                normalKeywords.every(el =>
                    anime.info_titleenglish
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .includes(el)
                ) &&
                forcedKeywords.every(el =>
                    anime.info_titleenglish
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .includes(prepareKeyword(el))
                ) &&
                controllOptions(
                    anime.info_titleenglish,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode
                )) ||

            (anime.info_othernames &&
                normalKeywords.every(el =>
                    anime.info_othernames
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .includes(el)
                ) &&
                forcedKeywords.every(el =>
                    anime.info_othernames
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .includes(prepareKeyword(el))
                ) &&
                controllOptions(
                    undefined,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode
                ))
    ));


    if (anizmSearch_printMatchedAnimes(anizmSearch_matchedAnimes.length)) return;


    // normal keywords search
    anizmSearch_matchedAnimes = keywordsSort(globalThis.anizmDB.filter(
        (anime) =>

            (anime.info_titleoriginal &&
                (
                    normalKeywords.length == 0 ||
                    normalKeywords.some(el =>
                        anime.info_titleoriginal
                            .toLowerCase()
                            .replace(/[^a-z\d\s]/g, "")
                            .includes(el))
                ) &&
                forcedKeywords.every(el =>
                    anime.info_titleoriginal
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .includes(prepareKeyword(el))
                ) &&
                controllOptions(
                    anime.info_titleoriginal,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode
                )) ||

            (anime.info_titleenglish &&
                (
                    normalKeywords.length == 0 ||
                    normalKeywords.some(el =>
                        anime.info_titleenglish
                            .toLowerCase()
                            .replace(/[^a-z\d\s]/g, "")
                            .includes(el))
                ) &&
                forcedKeywords.every(el =>
                    anime.info_titleenglish
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .includes(prepareKeyword(el))
                ) &&
                controllOptions(
                    anime.info_titleenglish,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode
                )) ||

            (anime.info_othernames &&
                (
                    normalKeywords.length == 0 ||
                    normalKeywords.some(el =>
                        anime.info_othernames
                            .toLowerCase()
                            .replace(/[^a-z\d\s]/g, "")
                            .includes(el))
                ) &&
                forcedKeywords.every(el =>
                    anime.info_othernames
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .includes(prepareKeyword(el))
                ) &&
                controllOptions(
                    undefined,
                    anime.info_year,
                    anime.info_malpoint,
                    anime.lastEpisode
                ))
    ));

    
    
    if (anizmSearch_printMatchedAnimes(anizmSearch_matchedAnimes.length)) return;




    /* Search with title similarity */
    const tryCount = Math.floor(query.length / 2);

    if (tryCount > 0) for (let i = 1; i <= tryCount; i++) {

        anizmSearch_matchedAnimes = globalThis.anizmDB.filter(
            (anime) =>

                (anime.info_titleoriginal &&
                    anime.info_titleoriginal
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .levenshteinDistance(query) === i &&
                    controllOptions(
                        anime.info_titleoriginal,
                        anime.info_year,
                        anime.info_malpoint,
                        anime.lastEpisode
                    )) ||

                (anime.info_titleenglish &&
                    anime.info_titleenglish
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .levenshteinDistance(query) === i &&
                    controllOptions(
                        anime.info_titleenglish,
                        anime.info_year,
                        anime.info_malpoint,
                        anime.lastEpisode
                    )) ||

                (anime.info_othernames &&
                    anime.info_othernames
                        .toLowerCase()
                        .replace(/[^a-z\d\s]/g, "")
                        .levenshteinDistance(query) === i &&
                    controllOptions(
                        undefined,
                        anime.info_year,
                        anime.info_malpoint,
                        anime.lastEpisode
                    ))

        ).sort(
            (a, b) => {

                if (options.sort == "malp" && a.info_malpoint != undefined && b.info_malpoint != undefined) {
                    if (options.orderby == "asc")
                        return a.info_malpoint-b.info_malpoint;
                    return b.info_malpoint-a.info_malpoint;
                }
                if (options.sort == "year" && a.info_year != undefined && b.info_year != undefined) {
                    let parsedYearA = parseYear(a.info_year);
                    let parsedYearB = parseYear(b.info_year);

                    if (options.orderby == "asc")
                        return Number(parsedYearA)-Number(parsedYearB);
                    return Number(parsedYearB)-Number(parsedYearA);
                }
                if (options.sort == "wordcount") {
                    if (options.orderby == "asc")
                        return a.info_titleoriginal.split(" ").length-b.info_titleoriginal.split(" ").length;
                    return b.info_titleoriginal.split(" ").length-a.info_titleoriginal.split(" ").length;
                }
                if (options.sort == "epcount" && a.lastEpisode != undefined && b.lastEpisode != undefined) {
                    if (options.orderby == "asc")
                        return getEpisodeCount(a.lastEpisode)-getEpisodeCount(b.lastEpisode);
                    return getEpisodeCount(b.lastEpisode)-getEpisodeCount(a.lastEpisode);
                }

                return 0
            }
        );


        if (anizmSearch_printMatchedAnimes(anizmSearch_matchedAnimes.length)) return;

        continue;
    }


    messageFunc(noFoundMsg);
}

var anizmSearch_matchedAnimes;
globalThis.anizmDB = require("./testdb.json");





searchAnz(


    `a`,


    console.log,
    "Sonuç bulunamadı."
);
