import http.server
import socketserver
import signal
import threading
import urllib.parse

PORT = 8000

class GracefulHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.debug_mode = False
        super().__init__(*args, **kwargs)

    def log_message(self, format, *args):
        if self.debug_mode:
            print(format % args)

    def do_GET(self):
        # Parse the URL and query parameters
        parsed_path = urllib.parse.urlparse(self.path)
        query_params = urllib.parse.parse_qs(parsed_path.query)

        # Check if debug parameter is present and set to 'true'
        self.debug_mode = 'debug' in query_params and query_params['debug'][0] == 'true'

        if self.debug_mode:
            print(f"Debug mode active for request: {self.path}")

        # Handle the request normally
        super().do_GET()

class ReusableServer(socketserver.TCPServer):
    allow_reuse_address = True

def shutdown_server(httpd):
    print('\nShutting down the server...')
    httpd.shutdown()
    httpd.server_close()
    print("Server has been shut down")

if __name__ == "__main__":
    Handler = GracefulHandler
    
    httpd = ReusableServer(("", PORT), Handler)
    
    print(f"Serving at port {PORT}")
    print(f"Open http://localhost:{PORT} in your browser")
    print("Press Ctrl+C to stop the server")

    def signal_handler(signum, frame):
        shutdown_thread = threading.Thread(target=shutdown_server, args=(httpd,))
        shutdown_thread.start()

    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
