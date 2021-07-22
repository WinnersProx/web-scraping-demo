import puppeteer from 'puppeteer';

import dotenv from 'dotenv';

dotenv.config({});

const hackerNewsUrl = 'https://news.ycombinator.com/';


const getHNFeed = async () => {
  const { HN_USERNAME, HN_PWD } = process.env || {};

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`${hackerNewsUrl}login?goto=news`);

  await page.type('[name=acct]', HN_USERNAME);
  await page.type('[name=pw]', HN_PWD);

  await page.click('[value=login]');

  const formatted = await page.evaluate(() => {
    // access logged in user via document.querySelector('#me').innerHTML;
    let itemsList = document.querySelector('.itemlist tbody').children;

    return Array.from(itemsList)
      .map((item) => {
        const title = item.querySelector('td.title:not([valign="top"]');
        const titleLink = title?.querySelector('a.storylink');

        const timeELement =
          title?.parentElement?.nextElementSibling?.querySelector('span.age');

        const url = titleLink?.getAttribute('href') || null;

        return {
          title: titleLink?.textContent,
          url,
          createdAt: timeELement?.getAttribute('title'),
        };
      })
      .filter((item) => item.title && item.url);
  });

  browser.close();

  return formatted;
};

// must get the csrf and some other required cookies in case they are required
const run = async () => {
  await getHNFeed()
    .then((data) => {
      console.log('data', data);
    })
    .catch((error) => {
      console.error('error occured', error);
      process.exit(1);
    });
};

run();
