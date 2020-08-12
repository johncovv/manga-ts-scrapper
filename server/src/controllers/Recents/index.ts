import puppeteer from 'puppeteer';
import env from '../../configs/enviroment';

interface MangaItemDataType {
	id: number;
	title: string;
	thumbnail: string;
	genres: [string];
	description: string;
	link: string;
}

interface RequestDataType {
	length: number;
	pagination: number | undefined;
	list: MangaItemDataType[];
}

const RequestRecents = async (pagination: number): Promise<RequestDataType> => {
	const requestUrl = `${env.baseUrl}/lista-de-mangas/ordenar-por-atualizacoes${
		pagination ? `?page=${pagination}` : ``
	}`;

	let browser = null;

	try {
		browser = await puppeteer.launch();
		const page = await browser.newPage();

		page.evaluateOnNewDocument(`
			Object.defineProperty(window, 'baseUrl', {
				get() {
					return '${env.baseUrl}'
				}
			})
		`);

		const start = Date.now();

		await page.goto(requestUrl);

		const ResponseRecents = await page.evaluate(
			(): RequestDataType => {
				const pageElement = document.querySelector(
					'#wraper > div > ul > li.active',
				) as HTMLAnchorElement;

				const currentPage =
					pageElement && pageElement.textContent
						? parseInt(pageElement.textContent, 10)
						: undefined;

				const recentsNodeList = document.querySelectorAll(
					'#titulos-az > div > div > div.seriesList > ul > li > a',
				) as NodeListOf<HTMLAnchorElement>;

				const recentsListArray = Array.from(recentsNodeList);

				const recentsList = recentsListArray.map((i) => {
					// id
					const idElement = i as HTMLAnchorElement;
					const idSplited = idElement.href.split('/').slice(-1)[0];
					const id = parseInt(idSplited, 10);

					// title
					const titleElement = i.querySelector(
						'.series-info > span.series-title > h1',
					) as HTMLHeadingElement;

					const title = titleElement.textContent
						? titleElement.textContent
						: '';

					// thumbnail
					const thumbnailElement = i.querySelector(
						'.series-img > .cover-image',
					) as HTMLDivElement;

					const thumbnail = thumbnailElement.style.backgroundImage
						.slice(4, -1)
						.replace(/"/g, '');

					// genres
					const genresNodeList = i.querySelectorAll(
						'a > div.series-info > div > div > ul > li:not(.rating) > span > span',
					) as NodeListOf<HTMLSpanElement>;
					const genresListArray = Array.from(genresNodeList);
					const genres = genresListArray.map(({ textContent }) => textContent);

					// description
					const descriptionElement = i.querySelector(
						'div.series-info > span.series-desc',
					) as HTMLSpanElement;
					const description = descriptionElement.innerText;

					// link
					const link = idElement.href.replace(
						new RegExp(`${window.baseUrl}`, 'i'),
						'',
					);

					return {
						id,
						title,
						thumbnail,
						genres,
						description,
						link,
					} as MangaItemDataType;
				}) as MangaItemDataType[];

				return {
					length: recentsListArray.length,
					pagination: currentPage,
					list: recentsList,
				};
			},
		);

		console.log('Took', Date.now() - start, 'ms');

		return ResponseRecents as RequestDataType;
	} finally {
		if (browser) browser.close();
	}
};

export default RequestRecents;
