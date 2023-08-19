import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { createBareServer } from '@tomphttp/bare-server-node';
import serveStatic from 'serve-static';

const httpServer = createServer();

// Run the Bare server in the /bare/ namespace. This will prevent conflicts between the static files and the bare server.
const bareServer = createBareServer('/bare/');

const serve = serveStatic(
	fileURLToPath(new URL('./static/', import.meta.url)),
	{
		fallthrough: false,
	}
);

httpServer.on('request', (req, res) => {
	if (bareServer.shouldRoute(req)) {
		bareServer.routeRequest(req, res);
	} else {
		serve(req, res, (err) => {
			res.writeHead(err?.statusCode || 500, {
				'Content-Type': 'text/plain',
			});
			res.end(err?.stack);
		});
	}
});

httpServer.on('upgrade', (req, socket, head) => {
	if (bareServer.shouldRoute(req)) {
		bareServer.routeUpgrade(req, socket, head);
	} else {
		socket.end();
	}
});

httpServer.on('listening', () => {
	console.log('AntiMatter Is Running On Port 8080, i think..');
});

httpServer.listen({
	port: 8080,
});
