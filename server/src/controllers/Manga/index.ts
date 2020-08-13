import puppeteer from 'puppeteer';

import env from '../../configs/enviroment';

interface ChapterDataType {
	chapter: number;
	link: string;
}

interface GenresDataType {
	title: string;
	link: string;
}

interface MangaTypes {
	title: string;
	link: string;
}

interface MangaScans {
	title: string;
	link: string;
}

interface MangaDataType {
	id: string;
	title: string;
	year: string;
	status: boolean;
	thumbnail: string;
	description: string;
	author: string;
	artist: string;
	type: MangaTypes[];
	scans: MangaScans[];
	genres: GenresDataType[];
	chapters: ChapterDataType[];
}

const RequestManga = async (
	manga: string,
): Promise<MangaDataType | ErrorResponseType> => {
	const requestUrl = `${env.baseUrl}/manga/${manga}`;

	const browser = await puppeteer.launch(env.browserConfig);
	const page = await browser.newPage();

	page.evaluateOnNewDocument(`
		Object.defineProperty(window, 'baseUrl', {
			get() {
				return '${env.baseUrl}'
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

	if (response?.status() !== 200 || response?.status() !== 302) {
		await browser.close();
		return { status: 404, err: 'Page not found...' } as ErrorResponseType;
	}

	const RequestData = await page
		.evaluate(() => {
			// manga id
			const id = window.mangaId;

			// manga title
			const titleElement = document.querySelector(
				'body > section > div > div > div > div > article > h1',
			) as HTMLHeadingElement;
			const title = titleElement.innerText;

			// manga thumbnail
			const thumbnailElement = document.querySelector(
				'body > section > div > div.box-content > div > div > div.widget > img',
			) as HTMLImageElement;
			const thumbnail = thumbnailElement.src;

			// manga genres
			const genresNodeList = document.querySelectorAll(
				'body > section > div > div > div > div > article > div.tags > a.tag',
			) as NodeListOf<HTMLAnchorElement>;
			const genresArray = Array.from(genresNodeList);
			const genres = genresArray.map((i) => {
				const titleGenre = i.innerText;

				const link = i.href.replace(
					new RegExp(`${window.baseUrl}/mangas/`, 'i'),
					'/genre/',
				);

				return { title: titleGenre, link } as GenresDataType;
			}) as GenresDataType[];

			// manga description
			const descriptionElement = document.querySelector(
				'body > section > div > div > div > div > article > div.text > div.paragraph',
			) as HTMLDivElement;
			const description = descriptionElement.innerText;

			// manga chapters
			const chaptersNodeList = document.querySelectorAll(
				'article > section > div.chapters > div.cap',
			) as NodeListOf<HTMLDivElement>;
			const chaptersArray = Array.from(chaptersNodeList);
			const chapters = chaptersArray.map((i) => {
				// chapter number
				const chapterElement = i.querySelector(
					'a.btn-caps',
				) as HTMLAnchorElement;
				const chapter = parseInt(chapterElement.innerText, 10);

				// chapter link
				const linkElement = i.querySelector(
					'div.card > div.pop-content > div.tags > a',
				) as HTMLAnchorElement;
				const link = linkElement.href.replace(
					new RegExp(`${window.baseUrl}/manga/`, ''),
					'',
				);

				return {
					chapter,
					link,
				} as ChapterDataType;
			}) as ChapterDataType[];

			// manga status
			const typeNodeElement = Array.from(
				document.querySelectorAll(
					'article > div.text > div.box-content > div > ul > li > div > strong',
				),
			).find((i) => i.innerHTML.trim() === 'Tipo:')
				?.parentNode as HTMLDivElement;
			const typeArray = Array.from(
				typeNodeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>,
			);
			const type = typeArray.map((i) => {
				// type title
				const titleType = i.innerText;

				// type link
				const link = i.href.replace(new RegExp(`${window.baseUrl}`, 'i'), '');

				return {
					title: titleType,
					link,
				} as MangaTypes;
			}) as MangaTypes[];

			// status
			const statusElement = Array.from(
				document.querySelectorAll(
					'article > div.text > div.box-content > div > ul > li > div > strong',
				),
			).find((i) => i.innerHTML.trim() === 'Status:')
				?.parentNode as HTMLDivElement;
			const statusString = statusElement.innerText
				.replace(new RegExp('Status:', 'i'), '')
				.trim();
			const status = !(statusString === 'Ativo');

			// year
			const yearElement = Array.from(
				document.querySelectorAll(
					'article > div.text > div.box-content > div > ul > li > div > strong',
				),
			).find((i) => i.innerHTML.trim() === 'Ano:')
				?.parentNode as HTMLDivElement;
			const year = yearElement.innerText
				.replace(new RegExp('ano:', 'i'), '')
				.trim();

			// author
			const authorElement = Array.from(
				document.querySelectorAll(
					'article > div.text > div.box-content > div > ul > li > div > strong',
				),
			).find((i) => i.innerHTML.trim() === 'Autor:')
				?.parentNode as HTMLDivElement;
			const author = authorElement.innerText
				.replace(new RegExp('Autor:', 'i'), '')
				.trim();

			// artist
			const artistElement = Array.from(
				document.querySelectorAll(
					'article > div.text > div.box-content > div > ul > li > div > strong',
				),
			).find((i) => i.innerHTML.trim() === 'Arte:')
				?.parentNode as HTMLDivElement;
			const artist = artistElement.innerText
				.replace(new RegExp('Arte:', 'i'), '')
				.trim();

			// scans
			const scansNodeList = Array.from(
				document.querySelectorAll(
					'article > div.text > div.box-content > div > ul > li > div > strong',
				),
			).find((i) => i.innerHTML.trim() === 'Scan(s):')
				?.parentNode as HTMLDivElement;
			const scansArray = Array.from(
				scansNodeList.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>,
			);
			const scans = scansArray.map((i) => {
				const titleScan = i.innerText;
				const link = i.href.replace(
					new RegExp(`${window.baseUrl}/scans/`, 'i'),
					'/scan/',
				);

				return {
					title: titleScan,
					link,
				} as MangaScans;
			}) as MangaScans[];

			return {
				id,
				title,
				thumbnail,
				status,
				year,
				type,
				author,
				artist,
				scans,
				genres,
				description,
				chapters,
			} as MangaDataType;
		})
		.catch((err) => {
			// eslint-disable-next-line no-console
			console.log(`Something bad happend...${err}`);
		});

	await browser.close();

	return RequestData as MangaDataType;
};

export default RequestManga;
