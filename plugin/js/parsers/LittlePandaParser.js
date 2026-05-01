"use strict";

parserFactory.register("littlepandatranslations.com", () => new LittlePandaParser());

class LittlePandaParser extends Parser { // eslint-disable-line no-unused-vars
    constructor() {
        super();
    }

    // returns promise with the URLs of the chapters to fetch
    // promise is used because may need to fetch the list of URLs from internet
    async getChapterUrls(dom) {
        let menu = dom.querySelector("ol.chapter-group__list");
        return util.hyperlinksToChapterList(menu);
    }

    // returns the element holding the story content in a chapter
    findContent(dom) {
        return dom.querySelector("section#chapter-content");
    }

    // Optional, supply if need to do custom cleanup of content
    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, "span.ts-honeypot");
        util.removeChildElementsMatchingSelector(element, "div.navigation-buttons");
        util.removeChildElementsMatchingSelector(element, "hr.wp-block-separator");
        super.removeUnwantedElementsFromContentElement(element);
    }

    // Optional, supply if individual chapter titles are not inside the content element
    findChapterTitle(dom) {
        return dom.querySelector("h1.chapter__title");
    }

    // Optional, supply if cover image can usually be found on inital web page
    // Notes.
    //   1. If cover image is first image in content section, do not implement this function
    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "figure.story__thumbnail");
    }

    // Optional, Return elements from page
    // that are to be shown on epub's "information" page
    getInformationEpubItemChildNodes(dom) {
        const summary = dom.querySelector("section.story__summary");
        return [...summary.querySelectorAll("p")];
    }
}
