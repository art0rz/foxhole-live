import {
	CombinedMapData,
	combineDynamicWithStaticData,
	diffCombinedMapData,
	DiffedMapData,
	MapData,
	WarInfo,
	WarReport,
} from 'foxhole-warapi';
import fetch from 'node-fetch';

export async function getMaps(baseUrl: string): Promise<Array<string>> {
	const res = await fetch(`${baseUrl}/worldconquest/maps`);
	return (await res.json()) as Array<string>;
}
export async function getWarInfo(baseUrl: string): Promise<WarInfo> {
	const res = await fetch(`${baseUrl}/worldconquest/war`);
	return (await res.json()) as WarInfo;
}
export async function getWarReport(baseUrl: string, map: string): Promise<WarReport> {
	const res = await fetch(`${baseUrl}/worldconquest/warReport/${map}`);
	return (await res.json()) as WarReport;
}

export async function getStaticMapData(baseUrl: string, mapName: string): Promise<MapData> {
	const res = await fetch(`${baseUrl}/worldconquest/maps/${mapName}/static`);
	return (await res.json()) as MapData;
}
export async function getDynamicMapData(baseUrl: string, mapName: string): Promise<MapData> {
	const res = await fetch(`${baseUrl}/worldconquest/maps/${mapName}/dynamic/public`);
	return (await res.json()) as MapData;
}

export async function getStaticMapDataForMaps(baseUrl: string, maps: Array<string>): Promise<Record<string, MapData>> {
	return (await Promise.all(maps.map(map => getStaticMapData(baseUrl, map)))).reduce(
		(acc, mapData, index) => ({
			...acc,
			[maps[index]]: mapData,
		}),
		{}
	);
}

export async function getDynamicMapDataForMaps(baseUrl: string, maps: Array<string>): Promise<Record<string, MapData>> {
	return (await Promise.all(maps.map(map => getDynamicMapData(baseUrl, map)))).reduce(
		(acc, mapData, index) => ({
			...acc,
			[maps[index]]: mapData,
		}),
		{}
	);
}

export async function getWarReportForMaps(baseUrl: string, maps: Array<string>): Promise<Record<string, WarReport>> {
	return (await Promise.all(maps.map(map => getWarReport(baseUrl, map)))).reduce<Record<string, WarReport>>(
		(acc, mapData, index) => ({
			...acc,
			[maps[index]]: mapData,
		}),
		{}
	);
}

export function combineAllMapData(
	maps: Array<string>,
	dynamicMapData: Record<string, MapData>,
	staticMapData: Record<string, MapData>
): Record<string, Array<CombinedMapData>> {
	return maps.reduce((acc, map) => {
		const data = combineDynamicWithStaticData(dynamicMapData[map].mapItems, staticMapData[map].mapTextItems);
		return {
			...acc,
			[map]: data.sort((a, b) => a.mapItem.x + a.mapItem.y - (b.mapItem.x + b.mapItem.y)),
		};
	}, {});
}

export function diffCombinedMapDataByMap(
	maps: Array<string>,
	previousDynamicMapData: Record<string, MapData>,
	previousCombinedData: Record<string, Array<CombinedMapData>>,
	newDynamicMapData: Record<string, MapData>,
	newCombinedData: Record<string, Array<CombinedMapData>>
): Record<string, Array<DiffedMapData>> {
	return maps.reduce<Record<string, Array<DiffedMapData>>>((acc, map) => {
		if (
			newDynamicMapData[map].lastUpdated !== previousDynamicMapData![map].lastUpdated &&
			newCombinedData[map] !== undefined
		) {
			try {
				const diffData = diffCombinedMapData(previousCombinedData![map], newCombinedData[map]);

				return {
					...acc,
					[map]: [...(acc[map] || []), ...diffData],
				};
			} catch (e) {
				console.log(previousCombinedData, newCombinedData);
			}

			return acc;
		}

		return acc;
	}, {});
}
