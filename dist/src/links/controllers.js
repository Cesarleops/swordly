export function createLink(req, res) {
    console.log("coming request");
    console.log("ma body", req.body);
    res.json({ ok: true });
}
export function getAllLinks(req, res) {
    console.log("hola que tal soy all links");
    res.send("looks like this works");
}
export function getSingleLink() { }
export function editLink() { }
export function deleteLink() { }
