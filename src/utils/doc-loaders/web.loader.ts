import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";

const webLoader = async ( url: string ) => {
  const loader = new PuppeteerWebBaseLoader( url, {
    gotoOptions: {
      waitUntil: "domcontentloaded"
    },
    launchOptions: {
      headless: true,
    },
  } );

  const docs = await loader.load();

  return docs;
};

export { webLoader };