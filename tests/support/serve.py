# 테스트용 정적 서버. python3 -m http.server는 대기 연결을 5개까지만 받아,
# 여러 테스트가 동시에 파일을 요청하면 연결이 끊긴다(ERR_CONNECTION_RESET). 대기 줄을 늘린다.
import sys
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler


class Server(ThreadingHTTPServer):
    request_queue_size = 128
    daemon_threads = True


port = int(sys.argv[1]) if len(sys.argv) > 1 else 5500
Server(("", port), partial(SimpleHTTPRequestHandler, directory=".")).serve_forever()
