"""
TALENTMATCH - Local Server Launcher
Simple Python HTTP server to serve the TALENTMATCH web application locally.
Usage:
    py server.py
    or
    python server.py
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    handler = CustomHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        url = f"http://localhost:{PORT}"
        print("==========================================================================")
        print(" TALENTMATCH - Intelligent Resume & Job Matching Platform")
        print(" Hackathon Web Application Server")
        print("==========================================================================")
        print(f" Serving web app at: {url}")
        print(" Press Ctrl+C to stop the server.")
        print("==========================================================================")
        
        try:
            webbrowser.open(url)
        except Exception:
            pass
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    main()
