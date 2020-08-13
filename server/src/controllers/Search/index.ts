import puppeteer from 'puppeteer';

import env from '../../configs/enviroment';

interface SearchItem {
	title: string;
	thumbnail: string;
	link: string;
	description: string;
}

interface SearchDataType {
	length: number;
	results: SearchItem[];
}

const RequestSearch = async (
	searchText: string,
): Promise<SearchDataType | ErrorResponseType> => {
	const requestUrl = `${env.baseUrl}/find/${searchText.replace(
		/[^a-zA-Z0-9À-ž\s]/gi,
		' ',
	)}`;

	if (searchText.length < 2) {
		return {
			status: 400,
			err: 'Please send at least 2 characters!',
			requested: `/search/${searchText}`,
		} as ErrorResponseType;
	}

	const browser = await puppeteer.launch(env.browserConfig);
	const page = await browser.newPage();

	page.evaluateOnNewDocument(`
		Object.defineProperty(window, 'baseUrl', {
			get() {
				return '${env.baseUrl}'
			}
		});
		Object.defineProperty(window, 'searched', {
			get() {
				return '${searchText}'
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
			// searchContainer
			const searchNodeList = document.querySelectorAll(
				'body > div > main.box-content > table.table.table-search > tbody > tr',
			) as NodeListOf<HTMLTableRowElement>;
			const searchArray = Array.from(searchNodeList);

			const results = searchArray.map((i) => {
				// result title
				const titleElement = i.querySelector(
					'td > h4 > a',
				) as HTMLAnchorElement;
				const title = titleElement.innerText;

				// result thumbnail
				const thumbnailElement = i.querySelector(
					'td > a > img.manga',
				) as HTMLImageElement;
				const thumbnail = thumbnailElement.src;

				// result link
				const link = titleElement.href.replace(
					new RegExp(`${window.baseUrl}`, 'i'),
					'',
				);

				// result description
				const descriptionElement = i.querySelector(
					'td > div.entry-content',
				) as HTMLDivElement;
				const description = descriptionElement.innerText;

				return { title, thumbnail, link, description } as SearchItem;
			});

			const searchedElement = document.querySelector(
				'body > div > header > h1.title',
			) as HTMLHeadingElement;
			const searchedMatch = searchedElement.innerText.match(/"(.*)"/) as [
				string,
			];
			const searched = searchedMatch ? searchedMatch.slice(-1)[0] : '';

			return { searched, length: results.length, results } as SearchDataType;
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

	await browser.close();

	return RequestData as SearchDataType;
};

export default RequestSearch;
