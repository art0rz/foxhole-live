// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Server, ServerOptions } from 'socket.io';
import createSocketPool from 'lib/socketPool';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import warApiEventsUpdater from 'lib/warapi-events';

dayjs.extend(utc);

type Data = {
	name: string;
};

let server: Server | undefined;
let socketPool: ReturnType<typeof createSocketPool> | undefined;
let eventUpdaterStarted: boolean = false;
function SocketHandler(req: NextApiRequest, res: NextApiResponse<Data>) {
	if (!server) {
		server = new Server((res.socket as unknown as { server: ServerOptions }).server);
		console.log('Socket server initialized');
	}

	if (!socketPool) {
		socketPool = createSocketPool(server);
		console.log('Socket pool initialized');
	}

	if (eventUpdaterStarted === false) {
		warApiEventsUpdater(
			(event, diff) => {
				socketPool?.broadcast(event, diff);
			},
			30000 // 30 seconds
		);

		eventUpdaterStarted = true;
	}

	res.end();
}

export default SocketHandler;
