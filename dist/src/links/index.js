export class Link {
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
