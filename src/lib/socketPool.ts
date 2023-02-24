import { Server, Socket } from 'socket.io';
import { DefaultEventsMap, EventParams, EventsMap } from 'socket.io/dist/typed-events';

function createSocketPool<
	ListenEvents extends EventsMap = DefaultEventsMap,
	EmitEvents extends EventsMap = ListenEvents
>(server: Server) {
	const pool: Array<Socket> = [];

	function removeSocket(socket: Socket) {
		if (pool.indexOf(socket) !== -1) {
			pool.splice(pool.indexOf(socket), 1);
			console.log(`Connection closed. Pool size: ${pool.length}`);
		}
	}

	server.on('connection', (socket: Socket) => {
		pool.push(socket);
		console.log(`New connection established. Pool size: ${pool.length}`);

		const onDisconnect = () => {
			removeSocket(socket);
		};

		socket.on('disconnect', onDisconnect);
	});

	return {
		broadcast(...args: EventParams<EmitEvents, 'message'>) {
			const deadSockets: Array<Socket> = [];
			for (let i = 0; i < pool.length; i += 1) {
				const socket = pool[i];
				if (socket.connected === false) {
					deadSockets.push(socket);
				} else {
					socket.send(...args);
				}
			}

			for (let j = 0; j < deadSockets.length; j += 1) {
				const deadSocket = deadSockets[j];
				removeSocket(deadSocket);
			}
		},
	};
}

export default createSocketPool;
