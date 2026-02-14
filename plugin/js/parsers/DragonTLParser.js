"use strict";

parserFactory.register("dragontl.net", () => new DragonTLParser());

class DragonTLParser extends Parser { // eslint-disable-line no-unused-vars
    constructor() {
        super();
    }

    // returns promise with the URLs of the chapters to fetch
    // promise is used because may need to fetch the list of URLs from internet
    async getChapterUrls(dom) {
        const tocList = dom.querySelectorAll(".mbs_toc_list");

        if (tocList.length === 0) {
            return [];
        } else if (tocList.length === 1) {
            return util.hyperlinksToChapterList(tocList[0]);
        }
        
        return [...tocList]
            .map(toc => util.hyperlinksToChapterList(toc, false, () => toc.previousSibling.textContent))
            .reduce((prev, curr) => [...prev, ...curr], []);
    }

    // returns the element holding the story content in a chapter
    findContent(dom) {
        return dom.querySelector(".fl-post-content");
    }

    // title of the story  (not to be confused with title of each chapter)
    extractTitleImpl(dom) {
        return dom.querySelector("h1");
    }

    // author of the story
    // Optional, if not provided, will default to "<unknown>"
    extractAuthor(dom) {
        const label = dom.querySelector(".mbs_story_summary > p:nth-child(3) > strong:nth-child(1)")?.textContent ?? "";
        
        const found = label.toLowerCase().startsWith("author:");
        if (!found) {
            return super.extractAuthor(dom);
        }

        return label.substring(label.indexOf(":") + 1).trim();
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
    extractSubject(dom) {
        const label = dom.querySelector(".mbs_story_summary > p:nth-child(2) > strong:nth-child(1)")?.textContent ?? "";
        
        const found = label.toLowerCase().startsWith("genre:");
        if (!found) {
            return super.extractAuthor(dom);
        }

        return label.substring(label.indexOf(":") + 1).trim();
    } 

    // Description of the story
    // Optional, Description for metadata, if not provided, will default to ""
    /*
    extractDescription(dom) {
        return dom.querySelector("div [property='description']").textContent.trim();
    }
    */

    // Optional, supply if need to do special manipulation of content
    // e.g. decrypt content
    /*
    customRawDomToContentStep(chapter, content) {
        // for example of this, refer to LnmtlParser
    }
    */

    // Optional, supply if need to do custom cleanup of content
    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingSelector(element, ".dtl-breadcrumbs");
        util.removeChildElementsMatchingSelector(element, ".mbs_toc_link");
        util.removeChildElementsMatchingSelector(element, ".mbs_prev");
        util.removeChildElementsMatchingSelector(element, ".mbs_next");
        util.removeChildElementsMatchingSelector(element, ".fl-post-content > div:last-child");
        util.removeChildElementsMatchingSelector(element, ".fl-post-content > div:last-child");
        super.removeUnwantedElementsFromContentElement(element);
    }

    // Optional, supply if individual chapter titles are not inside the content element
    findChapterTitle(dom) {
        return dom.querySelector(".mbs_posts_title");
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
    /*
    findCoverImageUrl(dom) {
        // Most common implementation is get first image in specified container. e.g. 
        return util.getFirstImgSrc(dom, "div.td-ss-main-sidebar");
    }
    */

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
        const nodeList = dom.querySelector(".mbs_story_summary")?.childNodes ?? [];
        return [...nodeList];
    }

    // Optional, Any cleanup operations to perform on the nodes
    // returned by getInformationEpubItemChildNodes
    /*
    cleanInformationNode(node) {
        return node;
    }
    */
}
