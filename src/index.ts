import cheerio from 'cheerio';
import axios from 'axios';

const hackerNewsUrl = 'https://news.ycombinator.com/';

/**
 * Hacker news Scrapper
 * @returns Promise<Array<any>>
 */
const scrapHackerNewsPosts = async () => {
  return axios
    .get(hackerNewsUrl)
    .then((res) => {
      const $ = cheerio.load(res.data);
      const itemsList = $('.itemlist tbody').children();

      return Array.from(itemsList).map((item) => {
        const title = $(item).children('.title');
        const titleLink = title.find('a.storylink');
        const timeELement = title.parent().next().find('span.age');

        const url = titleLink.attr('href') || null;

        return {
          title: titleLink.text(),
          url,
          createdAt: timeELement.attr('title'),
        };
      });
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
};

scrapHackerNewsPosts().then((posts) => {
  console.log('posts', posts);
});
