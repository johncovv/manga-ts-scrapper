import puppeteer from 'puppeteer';

import env from '../../configs/enviroment';

interface PagesDataType {
	page: number;
	source: string;
}

interface GenresDataType {
	title: string;
	link: string;
}

interface ChapterDataType {
	title: string;
	chapter: number;
	manga: string;
	genres: GenresDataType[];
	pages: PagesDataType[];
}

const RequestManga = async (
	manga: string,
	chapter: string,
): Promise<ChapterDataType | ErrorResponseType> => {
	const requestUrl = `${env.baseUrl}/manga/${manga}/${chapter}`;

	const browser = await puppeteer.launch(env.browserConfig);
	const page = await browser.newPage();

	page.evaluateOnNewDocument(`
		Object.defineProperty(window, 'baseUrl', {
			get() {
				return '${env.baseUrl}'
			}
		});
		Object.defineProperty(window, 'chapter', {
			get() {
				return '${chapter}'
			}
		});
		Object.defineProperty(window, 'mangaId', {
			get() {
				return '${manga}'
			}
		});
	`);

	process.on('unhandledRejection', (reason, p) => {
		// eslint-disable-next-line no-console
		console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
	});

	const response = await page.goto(requestUrl);

	if (response?.status() === 404) {
		await browser.close();
		return { status: 404, err: 'Page not found...' } as ErrorResponseType;
	}

	const RequestData = await page
		.evaluate(() => {
			// image page
			const pagesNodeList = document.querySelectorAll(
				'#slider > a.read-slide',
			) as NodeListOf<HTMLAnchorElement>;
			const pagesArray = Array.from(pagesNodeList);
			const pages = pagesArray.map((i, index) => ({
				page: index + 1,
				source: i.querySelector('img')?.src || 'Not found...',
			}));

			// chapter
			const chapterNumber = parseInt(window.chapter, 10);

			// title
			const titleElement = document.querySelector(
				'#navigation > div > header > div > div > h1 > a',
			) as HTMLAnchorElement;
			const title = titleElement.innerText;

			// manga link
			const mangaLink = `/manga/${window.mangaId}`;

			// genres
			const genresNodeListParent = Array.from(
				document.querySelectorAll(
					'body > section > div > div > ul > li > strong',
				),
			).find((i) => i.innerHTML.trim() === 'Categoria(s):')
				?.parentNode as HTMLLIElement;
			const genresNodeList = genresNodeListParent.querySelectorAll(
				'a',
			) as NodeListOf<HTMLAnchorElement>;
			const genresArray = Array.from(genresNodeList);
			const genres = genresArray.map(({ href, innerText }) => ({
				title: innerText,
				link: href
					.replace(new RegExp(`${window.baseUrl}/mangas/`, 'i'), '/genre/')
					.slice(0, -1),
			})) as GenresDataType[];

			return {
				title,
				chapter: chapterNumber,
				manga: mangaLink,
				genres,
				pages,
			} as ChapterDataType;
		})
		.catch((err) => {
			// eslint-disable-next-line no-console
			console.log(`Something bad happend...${err}`);
			return {
				status: 502,
				err:
					'Erro interno, caso o erro persista, entre em contato. tt@johncovv',
			} as ErrorResponseType;
		});

	// await browser.close();

	return RequestData as ChapterDataType;
};

export default RequestManga;
