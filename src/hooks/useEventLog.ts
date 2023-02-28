import { collection, Firestore, limit, onSnapshot, orderBy, query, Timestamp } from '@firebase/firestore';
import { Event } from 'foxhole-warapi';
import { useEffect, useState } from 'react';

export type EventFromDb = Event & {
	id: string;
	date: Timestamp;
};
function useEventLog(db: Firestore) {
	const [log, setLog] = useState<Array<EventFromDb>>([]);

	useEffect(() => {
		const unsub = onSnapshot(query(collection(db, 'events'), orderBy('date', 'desc'), limit(30)), doc => {
			const newEvents: Array<EventFromDb> = [];
			doc.forEach(data => {
				newEvents.push(data.data() as EventFromDb);
			});
			setLog(newEvents);
		});

		return () => {
			if (unsub) {
				unsub();
			}
		};
	}, [db]);

	return log;
}
export default useEventLog;
