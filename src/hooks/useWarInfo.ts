import { doc, Firestore, onSnapshot } from '@firebase/firestore';
import { useEffect, useState } from 'react';
import { WarReport } from 'foxhole-warapi';

function useWarInfo(db: Firestore) {
	const [totals, setTotals] = useState<WarReport>();
	const [maps, setMaps] = useState<Record<string, WarReport>>();

	useEffect(() => {
		onSnapshot(doc(db, 'world/war_report'), snapshot => {
			const data: Record<string, WarReport> = snapshot.data();
			setMaps(data);
			setTotals(
				Object.values(data).reduce<WarReport>(
					(acc, report) => ({
						totalEnlistments: acc.totalEnlistments + report.totalEnlistments,
						colonialCasualties: acc.colonialCasualties + report.colonialCasualties,
						wardenCasualties: acc.wardenCasualties + report.wardenCasualties,
						dayOfWar: report.dayOfWar,
						version: report.version,
					}),
					{
						totalEnlistments: 0,
						colonialCasualties: 0,
						wardenCasualties: 0,
						dayOfWar: 0,
						version: 0,
					}
				)
			);
		});
	}, [db]);

	return { totals, maps };
}

export default useWarInfo;
