import { combineDynamicWithStaticData, determineEventStatusType, DiffedMapData, Event, MapData } from 'foxhole-warapi';
import { FetchError } from 'node-fetch';

import {
	combineAllMapData,
	diffCombinedMapDataByMap,
	getDynamicMapDataForMaps,
	getMaps,
	getStaticMapDataForMaps,
} from './war-api';
import getRequiredEnvironmentVariable from './getRequiredEnvironmentVariable';

const warApiBaseUrl = getRequiredEnvironmentVariable('WARAPI_BASE_URL');
async function warApiEventsUpdater(callback: (event: Event, diff: DiffedMapData) => unknown, interval: number) {
	const maps = await getMaps(warApiBaseUrl);
	let previousDynamicMapData: Record<string, MapData> | undefined;
	let combinedPreviousData: Record<string, ReturnType<typeof combineDynamicWithStaticData>> | undefined;

	const staticMapData = await getStaticMapDataForMaps(warApiBaseUrl, maps);

	async function update() {
		console.log('Updating...');
		let dynamicMapData: Awaited<ReturnType<typeof getDynamicMapDataForMaps>>;
		try {
			dynamicMapData = await getDynamicMapDataForMaps(warApiBaseUrl, maps);
		} catch (e) {
			console.log('Failed');
			console.log((e as FetchError).name, (e as FetchError).message);
			return;
		}
		const combinedData = combineAllMapData(maps, dynamicMapData, staticMapData);

		if (previousDynamicMapData !== undefined && combinedPreviousData !== undefined) {
			const diffed = diffCombinedMapDataByMap(
				maps,
				previousDynamicMapData,
				combinedPreviousData,
				dynamicMapData,
				combinedData
			);

			Object.keys(diffed).forEach(map => {
				if (diffed[map].length > 0) {
					diffed[map].forEach(diffData => {
						const event = determineEventStatusType(diffData);

						if (event) {
							callback(event, diffData);
						}
					});
				}
			});
		}
		combinedPreviousData = combinedData;
		previousDynamicMapData = dynamicMapData;
	}

	setInterval(update, interval);

	update();
}

export default warApiEventsUpdater;
