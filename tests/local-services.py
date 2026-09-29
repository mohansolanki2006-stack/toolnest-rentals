"""Local-only Redis-compatible and Meta test double. Never deploy as a service."""
import json, uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import fakeredis
redis = fakeredis.FakeStrictRedis(decode_responses=True)
messages = []
class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_): pass
    def send_json(self, value, status=200):
        data=json.dumps(value,default=lambda v:list(v) if isinstance(v,set) else str(v)).encode(); self.send_response(status); self.send_header('Content-Type','application/json'); self.end_headers(); self.wfile.write(data)
    def do_GET(self): self.send_json({'messages':messages})
    def do_POST(self):
        data=json.loads(self.rfile.read(int(self.headers.get('Content-Length','0'))))
        if self.path=='/meta':
            mid='wamid.local-'+str(uuid.uuid4()); messages.append({'id':mid,'payload':data}); self.send_json({'messages':[{'id':mid}]});return
        try:
            result=redis.execute_command(*data)
            if data[0].upper()=='HGETALL': result=[item for pair in result.items() for item in pair]
            self.send_json({'result':result})
        except Exception as e: print('Redis test error:',str(e),flush=True); self.send_json({'error':str(e)},400)
ThreadingHTTPServer(('127.0.0.1',8877),Handler).serve_forever()
