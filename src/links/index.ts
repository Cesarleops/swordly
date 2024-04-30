export type Links = {
  originalURL: string;
  shortURL: string;
  clicks: string;
};

export class Link {
  getLink(id: string, res: any) {
    console.log("heyy");
    res.redirect("https://elbundedistribuidora.com");
  }

  createLink(original: string, short: string) {
    const newUrl = {
      original,
      short,
      clicks: 0,
    };
  }

  deleteLink(id: string) {}

  editLink(id: string) {}
}
