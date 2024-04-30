"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Link = void 0;
class Link {
    getLink(id, res) {
        console.log("heyy");
        res.redirect("https://elbundedistribuidora.com");
    }
    createLink(original, short) {
        const newUrl = {
            original,
            short,
            clicks: 0,
        };
    }
    deleteLink(id) { }
    editLink(id) { }
}
exports.Link = Link;
