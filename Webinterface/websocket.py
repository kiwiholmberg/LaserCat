#!/usr/bin/python
# -*- coding: utf-8 -*-

import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.escape
import serial
import os.path
import sys

arduino = None
ARDUINO_PORT = "/dev/tty.usbserial-A700dZKK"  # Modify this to your Arduino Com-port!


class Index(tornado.web.RequestHandler):
    def get(self):
        self.render("mousetracker.html")
        #self.render("test.html")


class Controller(tornado.websocket.WebSocketHandler):
    def open(self):
        global arduino
        try:
        	arduino = serial.Serial(ARDUINO_PORT, 19200, timeout=3)
        except:
        	print("Could not open serial port: " + ARDUINO_PORT + "\nPlease check that" +
        	"you have selected correct serial port and that arduino is connected.")
        	print("Shutting down...")
        	sys.exit()
        print("WebSocket opened")
        arduino.write("c")
        self.write_message("ok")

    def on_message(self, data):
        global arduino
        sequence = tornado.escape.json_decode(data)["value"]
        if sequence != "":
			#Print data to console and send to arduino com-port.
            print sequence
            arduino.write(sequence)
            arduino.flush()
        self.write_message("ok")

    def on_close(self):
        global arduino
        print("WebSocket closed")
        arduino.close()


settings = {
    "static_path": os.path.join(os.path.dirname(__file__), "static"),
}

application = tornado.web.Application([
  (r"/", Index),
  (r"/lasercontroller", Controller),
],**settings)


def main():
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(8888)
    print "Starting server."
    print "Awaiting first page load..."
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()