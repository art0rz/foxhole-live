// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import timedMemoization from 'lib/timedMemoization';
import {
	combineAllMapData,
	getDynamicMapDataForMaps,
	getMaps,
	getStaticMapDataForMaps,
	getWarInfo,
	getWarReportForMaps,
} from 'lib/war-api';
import getRequiredEnvironmentVariable from 'lib/getRequiredEnvironmentVariable';
import { CombinedMapData, WarInfo, WarReport } from 'foxhole-warapi';

const timeout = 1000 * 60; // 1 minute
const baseUrl = getRequiredEnvironmentVariable('WARAPI_BASE_URL');

const maps = timedMemoization(() => getMaps(baseUrl), timeout);
const warInfo = timedMemoization(() => getWarInfo(baseUrl), timeout);

const staticMapData = timedMemoization(async () => getStaticMapDataForMaps(baseUrl, await maps.getData()), timeout);
const dynamicMapData = timedMemoization(async () => getDynamicMapDataForMaps(baseUrl, await maps.getData()), timeout);
const warReportData = timedMemoization(async () => getWarReportForMaps(baseUrl, await maps.getData()), timeout);

export interface WarResponse {
	warInfo: WarInfo;
	maps: Record<
		string,
		{
			mapData: Array<CombinedMapData>;
			warReport: WarReport;
		}
	>;
}

async function SocketHandler(req: NextApiRequest, res: NextApiResponse<WarResponse>) {
	const [mapsData, warInfoData] = await Promise.all([maps.getData(), warInfo.getData()]);
	const [staticMapsData, dynamicMapsData, warReportsData] = await Promise.all([
		await staticMapData.getData(),
		await dynamicMapData.getData(),
		await warReportData.getData(),
	]);

	const combinedMapData = Object.entries(combineAllMapData(mapsData, dynamicMapsData, staticMapsData)).reduce<
		Record<
			string,
			{
				mapData: Array<CombinedMapData>;
				warReport: WarReport;
			}
		>
	>(
		(acc, entry) => ({
			...acc,
			[entry[0]]: {
				mapData: entry[1],
				warReport: warReportsData[entry[0]],
			},
		}),
		{}
	);

	res.send({
		warInfo: warInfoData,
		maps: combinedMapData,
	});

	res.end();
}

export default SocketHandler;
