"use strict";

parserFactory.register("love4baihe.blogspot.com", () => new LovingBaiheParser());

class LovingBaiheParser extends Parser { // eslint-disable-line no-unused-vars
    constructor() {
        super();
    }

    // returns promise with the URLs of the chapters to fetch
    // promise is used because may need to fetch the list of URLs from internet
    async getChapterUrls(dom) {
        const parseSourceUrl = (el) => el.querySelector("a").href;
        const parseTitle = (el) => el.querySelector("span.chapternum").innerText.trim();
        const links = Array.from(dom.querySelectorAll("div#chapters ul li.relative")).reverse();

        return links.map(el => ({
            sourceUrl: parseSourceUrl(el),
            title: parseTitle(el),
            newArc: null
        }));
    }

    // returns the element holding the story content in a chapter
    findContent(dom) {
        return dom.querySelector("article");
    }

    // title of the story  (not to be confused with title of each chapter)
    extractTitleImpl(dom) {
        return dom.querySelector("h1[itemprop='name']");
    }

    // Description of the story
    // Optional, Description for metadata, if not provided, will default to ""
    extractDescription(dom) {
        return dom.querySelector("div#syn-target").innerText.trim() ?? super.extractDescription(dom);
    }

    // Optional, supply if need to do custom cleanup of content
    removeUnwantedElementsFromContentElement(element) {
        element.querySelector("img")?.remove();
        util.removeChildElementsMatchingSelector(element, "h2");
        super.removeUnwantedElementsFromContentElement(element);
    }

    // Optional, supply if individual chapter titles are not inside the content element
    findChapterTitle(dom) {
        return dom.querySelector("article span b");
    }

    // Optional, supply if cover image can usually be found on inital web page
    // Notes.
    //   1. If cover image is first image in content section, do not implement this function
    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "header");
    }

    // Optional, Return elements from page
    // that are to be shown on epub's "information" page
    getInformationEpubItemChildNodes(dom) {
        return [dom.querySelector("div#syn-target")];
    }
}
