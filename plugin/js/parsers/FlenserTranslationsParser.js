"use strict";

parserFactory.register("flenser-tl.nz", () => new FlenserTranslationsParser());

class FlenserTranslationsParser extends Parser { // eslint-disable-line no-unused-vars
    constructor() {
        super();
    }

    // returns promise with the URLs of the chapters to fetch
    // promise is used because may need to fetch the list of URLs from internet
    async getChapterUrls(dom, chapterUrlsUI) {
        const mainToc = util.hyperlinksToChapterList(dom.querySelector("#main-content ul"));

        const finalToc = [];
        chapterUrlsUI.showTocProgress(mainToc);
        for (const toc of mainToc) {
            await this.rateLimitDelay();
            const newDom = (await HttpClient.wrapFetch(toc.sourceUrl)).responseXML;
            const subToc = [...util.hyperlinksToChapterList(newDom.querySelector("#main-content ul"))];

            if (subToc.length > 0) {
                subToc[0].newArc = toc.title;
                finalToc.push(...subToc);
            } else {
                finalToc.push(toc);
            }
        }

        return finalToc;
    }

    // returns the element holding the story content in a chapter
    findContent(dom) {
        return dom.querySelector("#main-content main");
    }

    // Optional, supply if individual chapter titles are not inside the content element
    findChapterTitle(dom) {
        return dom.querySelector("nav.breadcrumb-nav li:last-child").textContent;
    }

    // Optional, Return elements from page
    // that are to be shown on epub's "information" page
    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelector("#main-content main").children]
            .map(a => {
                util.removeChildElementsMatchingSelector(a, "svg");
                return a;
            });
    }
}
