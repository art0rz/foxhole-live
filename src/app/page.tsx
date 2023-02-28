'use client';

import { MapIconTypes } from 'foxhole-warapi';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { getFirestore } from '@firebase/firestore';
import { initializeApp } from '@firebase/app';
import useEventLog from 'hooks/useEventLog';
import useWarInfo from 'hooks/useWarInfo';
import styles from './page.module.css';

dayjs.extend(utc);

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Home() {
	const events = useEventLog(db);
	const { totals } = useWarInfo(db);

	return (
		<main className={styles.main}>
			{totals && (
				<>
					<p>Day of war: {totals.dayOfWar}</p>
					<p>Total casualties: {totals.colonialCasualties + totals.wardenCasualties}</p>
					<p>Colonial casualties: {totals.colonialCasualties}</p>
					<p>Warden casualties: {totals.wardenCasualties}</p>
				</>
			)}
			<p>
				<strong>Event log</strong>
			</p>
			<ul>
				{events.map(event => (
					<li key={event.id}>{`[${dayjs.utc(event.date.toDate()).format()}] ${
						MapIconTypes[event.iconType]
					} @ ${event.text} ${event.event} by ${event.byTeam}`}</li>
				))}
			</ul>
		</main>
	);
}
