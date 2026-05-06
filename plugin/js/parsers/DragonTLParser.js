"use strict";

parserFactory.register("dragontl.net", () => new DragonTLParser());

class DragonTLParser extends Parser { // eslint-disable-line no-unused-vars
    constructor() {
        super();
    }

    // returns promise with the URLs of the chapters to fetch
    // promise is used because may need to fetch the list of URLs from internet
    async getChapterUrls(dom) {
        const tocList = dom.querySelectorAll("ul.mbs_toc_list");
       
        if (tocList.length === 0) return [];
        else if (tocList.length === 1) return util.hyperlinksToChapterList(tocList[0]);

        return [...tocList]
            .map(toc => util.hyperlinksToChapterList(toc, false, () => toc.previousSibling.textContent))
            .reduce((prev, curr) => [...prev, ...curr], []);
    }

    // returns the element holding the story content in a chapter
    findContent(dom) {
        return dom.querySelector("div.mbs_posts_text");
    }

    // title of the story  (not to be confused with title of each chapter)
    extractTitleImpl(dom) {
        return dom.querySelector("h1.title");
    }

    // Optional, supply if individual chapter titles are not inside the content element
    findChapterTitle(dom) {
        return dom.querySelector("h2.mbs_posts_title");
    }

    // Optional, supply if cover image can usually be found on inital web page
    // Notes.
    //   1. If cover image is first image in content section, do not implement this function
    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.fl-post-content");
    }

    // Optional, Return elements from page
    // that are to be shown on epub's "information" page
    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.mbs_story_summary p")];
    }
}
