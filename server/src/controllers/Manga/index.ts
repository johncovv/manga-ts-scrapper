import puppeteer from 'puppeteer';

import env from '../../configs/enviroment';

interface ChapterDataType {
	id: number;
	chapter: number;
	link: string;
}

interface MangaDataType {
	id: number;
	title: string;
	thumbnail: string;
	genres: [{ id: number; title: string; link: string }];
	description: string;
	chapters: ChapterDataType[];
}

const RequestManga = async (
	manga: string,
	mangaId: string,
): Promise<MangaDataType> => {
	const requestUrl = `${env.baseUrl}/manga/${manga}/${mangaId}`;

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
				return '${mangaId}'
			}
		});
		Object.defineProperty(window, 'mangaTitle', {
			get() {
				return '${manga}'
			}
		});
  `);

	await page.goto(requestUrl);

	const RequestData = await page.evaluate(() => {
		// id
		const id = parseInt(window.mangaId, 10);

		// title
		const titleElement = document.querySelector(
			'#series-data > div.series-info > span.series-title > h1',
		) as HTMLHeadingElement;
		const title = titleElement.innerText || '';

		// thumbnail
		const thumbnailElement = document.querySelector(
			'#series-data > div.series-img > div.cover > img',
		) as HTMLImageElement;
		const thumbnail = thumbnailElement.src;

		// genres
		const genresNodeList = document.querySelectorAll(
			'#series-data > div.series-info > div.carousel > div > ul > li > a',
		) as NodeListOf<HTMLAnchorElement>;
		const genresListArray = Array.from(genresNodeList);
		const genres = genresListArray.map((i) => {
			const href = i.href
				.replace(new RegExp(`${window.baseUrl}/mangas/`, 'i'), '')
				.split('/');

			return {
				id: parseInt(href[1], 10),
				title: i.querySelector('span')?.textContent || '',
				link: `/mangas/${href[0]}/${href[1]}`,
			};
		});

		// description
		const descriptionElement = document.querySelector(
			'#series-data > div.series-info > span.series-desc',
		) as HTMLSpanElement;
		const description = descriptionElement.innerText;

		// chapters
		const chaptersNodeList = document.querySelectorAll(
			'#chapter-list > div.container-box > ul > li > a',
		) as NodeListOf<HTMLAnchorElement>;
		const chaptersListArray = Array.from(chaptersNodeList);
		const chapters = chaptersListArray.map((i) => {
			// chapter id
			const chapterIdElement = i as HTMLAnchorElement;
			const chapterId = parseInt(
				chapterIdElement.getAttribute('data-id-chapter') || '',
				10,
			);

			// chapter number
			const chapterElement = i.querySelector(
				'div.chapter-info > div.chapter-info-text > span.cap-text',
			) as HTMLSpanElement;
			const chapter = parseInt(
				chapterElement.innerText.replace(/Capítulo/i, '').trim(),
				10,
			);

			// chapter link
			const link = `/manga/${window.mangaTitle}/${chapterId}/capitulo-${chapter}`;

			return { id: chapterId, chapter, link } as ChapterDataType;
		}) as ChapterDataType[];

		return {
			id,
			title,
			thumbnail,
			genres,
			description,
			chapters,
		} as MangaDataType;
	});
	// await browser.close();

	return RequestData as MangaDataType;
};

export default RequestManga;
