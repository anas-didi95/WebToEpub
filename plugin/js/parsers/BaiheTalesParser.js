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

    // language used
    // Optional, if not provided, will default to ISO code for English "en"
    /*
    extractLanguage(dom) {
        return dom.querySelector("html").getAttribute("lang");
    }
    */

    // load EpubMetaInfo async in local variable to retieve with all other Metadata functions
    // Optional, will default to "return"
    /*
    async loadEpubMetaInfo(){
        let data = (await HttpClient.fetchJson(api)).json;
        this.subject = data.subject;
        ...
        return;
    }
    */

    // Genre of the story
    // Optional, Genre for metadata, if not provided, will default to ""
    /*
    extractSubject(dom) {
        let tags = [...dom.querySelectorAll("[property='genre']")];
        return tags.map(e => e.textContent.trim()).join(", ");
    }
    */

    // Description of the story
    // Optional, Description for metadata, if not provided, will default to ""
    extractDescription(dom) {
        return Array.from(dom.querySelectorAll("div.entry-content p.wp-block-paragraph"))
            .map(a => a.textContent.trim()).join("\n") ?? super.extractDescription(dom);
    }

    // Optional, supply if need to do special manipulation of content
    // e.g. decrypt content
    /*
    customRawDomToContentStep(chapter, content) {
        // for example of this, refer to LnmtlParser
    }
    */

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

    // Optional, if "next/previous chapter" are nested inside other elements,
    // this says how to find the highest parent element to remove
    /*
    findParentNodeOfChapterLinkToRemoveAt(link) {
        // The links may be wrapped, so need to walk up tree to find the 
        // highest element holding the chapter links.
        // e.g. Following code assumes links are sometimes enclosed in a <strong> tag
        // that is enclosed in a <p> tag.  We want to remove the <p> tag
        // and everything inside it
        let toRemove = util.moveIfParent(link, "strong");
        return util.moveIfParent(toRemove, "p");    
    }
    */

    // Optional, supply if cover image can usually be found on inital web page
    // Notes.
    //   1. If cover image is first image in content section, do not implement this function
    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "figure");
    }

    // Optional, supply if need to chase hyperlinks in page to get all chapter content
    // or site can send challenge pages for some chapters
    /*
    async fetchChapter(url) {
        return (await HttpClient.wrapFetch(url)).responseXML;

        // Handling to catch sites that send challenge pages
        // Note, need to implement isCustomError() and setCustomErrorResponse()
        let options = { parser: this };
        return (await HttpClient.wrapFetch(url, options)).responseXML;
    }
    */

    // Optional, supply these if site can send challenge pages for some chapters
    /*
    // return true if response is a challenge response
    isCustomError(response){
        return (response.responseXML.title == "Just a moment...");
    }

    // what to do if encounter challenge
    setCustomErrorResponse(url, wrapOptions){
        let newresp = {};
        newresp.url = url;
        newresp.wrapOptions = wrapOptions;
        newresp.response = {};
        newresp.response.url = this.RestToUrl(checkedresponse.response.url);
        newresp.response.status = 403;
        return newresp;
    }
    */

    // Optional, supply if need to modify DOM before normal processing steps
    /*
    preprocessRawDom(webPageDom) {
    }
    */

    // Optional, called when user presses the "Pack EPUB" button.
    // Implement if parser needs to do anything after user sets UI settings 
    // but before collecting pages
    /*
    onStartCollecting() {
    }
    */

    // Optional, Return elements from page
    // that are to be shown on epub's "information" page
    getInformationEpubItemChildNodes(dom) {
        const contents = Array.from(dom.querySelectorAll("div.entry-content p.wp-block-paragraph"));
        return contents.slice(0, contents.length - 1);
    }

    // Optional, Any cleanup operations to perform on the nodes
    // returned by getInformationEpubItemChildNodes
    /*
    cleanInformationNode(node) {
        return node;
    }
    */
}
