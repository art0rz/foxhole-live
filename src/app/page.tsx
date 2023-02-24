'use client';

import { useEffect, useState } from 'react';
import Client from 'socket.io-client';
import { DiffedMapData, Event, MapIconTypes, WarReport } from 'foxhole-warapi';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { WarResponse } from 'pages/api/war';
import styles from './page.module.css';

dayjs.extend(utc);

export default function Home() {
	const [log, setLog] = useState<Array<string>>([]);
	const [warInfo, setWarInfo] = useState<WarResponse | undefined>(undefined);
	useEffect(() => {
		const socket = Client();
		async function connect() {
			await fetch('/api/war/events');

			socket.on('connect', () => {
				console.log('connected');
			});

			socket.on('disconnect', () => {
				console.log('disconnected');
				socket.close();
			});

			socket.on('message', (event: Event, diff: DiffedMapData) => {
				const str = `[${dayjs.utc().format()}] ${MapIconTypes[diff.old.mapItem.iconType]} @ ${
					diff.old.mapTextItem.text
				} ${event?.event} by ${event?.byTeam}`;
				setLog(current => [...current, str]);
				console.log(str);
			});
		}

		connect();

		return () => {
			socket.close();
		};
	}, []);

	useEffect(() => {
		async function getWarInfo() {
			const data = (await (await fetch('/api/war')).json()) as WarResponse;
			console.log(data);
			setWarInfo(data);
		}

		getWarInfo();
	}, []);

	const totals = warInfo
		? Object.values(warInfo.maps).reduce<Omit<WarReport, 'version'>>(
				(acc, value) => {
					acc.totalEnlistments += value.warReport.totalEnlistments;
					acc.colonialCasualties += value.warReport.colonialCasualties;
					acc.wardenCasualties += value.warReport.wardenCasualties;
					acc.dayOfWar = value.warReport.dayOfWar;
					return acc;
				},
				{
					totalEnlistments: 0,
					colonialCasualties: 0,
					wardenCasualties: 0,
					dayOfWar: 0,
				}
		  )
		: {
				totalEnlistments: 0,
				colonialCasualties: 0,
				wardenCasualties: 0,
				dayOfWar: 0,
		  };

	return (
		<main className={styles.main}>
			<p>Day of war: {totals.dayOfWar}</p>
			<p>Total casualties: {totals.colonialCasualties + totals.wardenCasualties}</p>
			<p>Colonial casualties: {totals.colonialCasualties}</p>
			<p>Warden casualties: {totals.wardenCasualties}</p>
			<ul>
				<li>
					<strong>Event log</strong>
				</li>
				{log.map(item => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</main>
	);
}
