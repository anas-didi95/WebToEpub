"use strict";

parserFactory.register("lovelyblossoms.com", () => new LovelyblossomsParser());

class LovelyblossomsParser extends Parser { // eslint-disable-line no-unused-vars
    constructor() {
        super();
    }

    // returns promise with the URLs of the chapters to fetch
    // promise is used because may need to fetch the list of URLs from internet
    async getChapterUrls(dom) {
        return [...dom.querySelectorAll("li.wp-manga-chapter.free-chap a")]
            .map(a => util.hyperLinkToChapter(a))
            .reverse();
    }

    // returns the element holding the story content in a chapter
    findContent(dom) {
        return dom.querySelector("div.reading-content");
    }

    // Optional, supply if need to do custom cleanup of content
    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, "div:last-child");
        super.removeUnwantedElementsFromContentElement(element);
    }

    // Optional, supply if individual chapter titles are not inside the content element
    findChapterTitle(dom) {
        return dom.querySelector("h1#chapter-heading");
    }

    // Optional, supply if cover image can usually be found on inital web page
    // Notes.
    //   1. If cover image is first image in content section, do not implement this function
    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.summary_image");
    }

    // Optional, Return elements from page
    // that are to be shown on epub's "information" page
    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.post-content_item div.summary-content"), dom.querySelector("div.summary__content")];
    }
}
