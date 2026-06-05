"use strict";

parserFactory.register("katreadingcafe.com", () => new KatReadingCafeParser());

class KatReadingCafeParser extends Parser { // eslint-disable-line no-unused-vars
    constructor() {
        super();
    }

    // returns promise with the URLs of the chapters to fetch
    // promise is used because may need to fetch the list of URLs from internet
    async getChapterUrls(dom) {
        const menuList = [...dom.querySelectorAll("div.eplister ul li a")];

        const chapterList = menuList.map(o => {
            var ch = o.querySelector("div.epl-num").innerText;
            var title = o.querySelector("div.epl-title").innerText;
            
            return {
                sourceUrl: o.href,
                title: `${ch ? ch + ": " : ""}${title}`
            };
        });

        return chapterList.reverse();
    }

    // returns the element holding the story content in a chapter
    findContent(dom) {
        return dom.querySelector("div.epcontent");
    }

    // title of the story  (not to be confused with title of each chapter)
    extractTitleImpl(dom) {
        // typical implementation is find node with the Title and return name from title
        // NOTE. Can return Title as a string, or an  HTML element
        return dom.querySelector("h1.entry-title");
    }

    // Optional, supply if need to do custom cleanup of content
    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, "div.ckb-wrap");
        super.removeUnwantedElementsFromContentElement(element);
    }

    // Optional, supply if cover image can usually be found on inital web page
    // Notes.
    //   1. If cover image is first image in content section, do not implement this function
    findCoverImageUrl(dom) {
        // Most common implementation is get first image in specified container. e.g. 
        return util.getFirstImgSrc(dom, "div.sertothumb");
    }

    // Optional, Return elements from page
    // that are to be shown on epub's "information" page
    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.sersys p")];
    }
}
