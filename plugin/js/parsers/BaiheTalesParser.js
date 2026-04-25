"use strict";

parserFactory.register("baihetales.wordpress.com", () => new BaiheTalesParser());

class BaiheTalesParser extends Parser { // eslint-disable-line no-unused-vars
    constructor() {
        super();
    }

    // returns promise with the URLs of the chapters to fetch
    // promise is used because may need to fetch the list of URLs from internet
    async getChapterUrls(dom, chapterUrlsUI) {
        const chaptersFromDom = (dom) => {
            const urls = dom.querySelector("ul.wp-block-post-template");
            return util.hyperlinksToChapterList(urls);
        };        
        const nextTocPageUrl = (dom) => dom.querySelector("nav a.wp-block-query-pagination-next")?.href;

        return (await this.walkTocPages(dom, chaptersFromDom, nextTocPageUrl, chapterUrlsUI));
    }

    // returns the element holding the story content in a chapter
    findContent(dom) {
        return dom.querySelector("article.post");
    }

    // title of the story  (not to be confused with title of each chapter)
    extractTitleImpl(dom) {
        return dom.querySelector("h1.entry-title").textContent.trim();
    }

    // author of the story
    extractAuthor(dom) {
        const label = dom.querySelector(".wp-block-media-text__content > p:nth-child(2)");
        return label?.textContent.replace("Author:", "").trim() ?? super.extractAuthor(dom);
    }

    // Description of the story
    // Optional, Description for metadata, if not provided, will default to ""
    extractDescription(dom) {
        return Array.from(dom.querySelectorAll("div.entry-content p.wp-block-paragraph"))
            .map(a => a.textContent.trim()).join("\n") ?? super.extractDescription(dom);
    }

    // Optional, supply if need to do custom cleanup of content
    removeUnwantedElementsFromContentElement(element) {
        const end = element.querySelector("hr");
        while (end.nextElementSibling) {
            end.nextElementSibling.remove();
        }
        end.remove();
        util.removeChildElementsMatchingSelector(element, "footer");
        super.removeUnwantedElementsFromContentElement(element);
    }

    // Optional, supply if individual chapter titles are not inside the content element
    findChapterTitle(dom) {
        return dom.querySelector("h1.entry-title");
    }

    // Optional, supply if cover image can usually be found on inital web page
    // Notes.
    //   1. If cover image is first image in content section, do not implement this function
    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "figure");
    }

    // Optional, Return elements from page
    // that are to be shown on epub's "information" page
    getInformationEpubItemChildNodes(dom) {
        const contents = Array.from(dom.querySelectorAll("div.entry-content p.wp-block-paragraph"));
        return contents.slice(0, contents.length - 1);
    }
}
