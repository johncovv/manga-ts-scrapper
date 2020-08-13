import puppeteer from 'puppeteer-extra';

import env from '../../configs/enviroment';

interface MangaItemDataType {
	title: string;
	thumbnail: string;
	link: string;
}

interface RequestDataType {
	length: number;
	pagination: number;
	list: MangaItemDataType[];
}

const RequestRecents = async (
	pagination: number,
): Promise<RequestDataType | ErrorResponseType> => {
	const requestUrl = `${env.baseUrl}/lancamentos/${
		pagination ? `/page/${pagination}` : ``
	}`;
	const browser = await puppeteer.launch(env.browserConfig);
	const page = await browser.newPage();

	page.evaluateOnNewDocument(`
		Object.defineProperty(window, 'baseUrl', {
			get() {
				return '${env.baseUrl}'
			}
		})
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

	const ResponseRecents = await page
		.evaluate(() => {
			// current page
			const paginationElement = document.querySelector(
				'#lancamentos > div > div > div > span.current',
			) as HTMLSpanElement;
			const pageCurrent = paginationElement.textContent || '';

			// recents node element
			const containerItemElement = document.querySelectorAll(
				'#dados > div > div > div.block-lancamentos',
			) as NodeListOf<HTMLDivElement>;
			const itemListArray = Array.from(containerItemElement);

			const recentsList = itemListArray.map((i) => {
				// thumbnail
				const thumbnailElement = i.querySelector(
					'div.column-img > a.image-lancamento > img',
				) as HTMLImageElement;
				const thumbnail = thumbnailElement.src || '';

				// link
				const linkElement = i.querySelector(
					'div.column-img > a.image-lancamento',
				) as HTMLAnchorElement;
				const link = linkElement.href.replace(`${window.baseUrl}`, '') || '';

				// title
				const titleElement = i.querySelector(
					'div.column-content > div.content-lancamento > h4 > a',
				) as HTMLAnchorElement;
				const title = titleElement.textContent || '';

				return {
					title,
					thumbnail,
					link,
				} as MangaItemDataType;
			});

			return {
				length: recentsList.length,
				pagination: parseInt(pageCurrent, 10),
				list: recentsList,
			} as RequestDataType;
		})
		.catch((err) => {
			// eslint-disable-next-line no-console
			console.log(`Something bad happend...${err}`);
		});

	await browser.close();

	return ResponseRecents as RequestDataType;
};

export default RequestRecents;
