#!/usr/bin/python
# -*- coding: utf-8 -*-

import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.escape
import serial

arduino = None
ARDUINO_PORT = "/dev/tty.usbserial-A700dZKK"  # Modify this to your Arduino Com-port!


class Index(tornado.web.RequestHandler):
    def get(self):
        self.render("mousetracker.html")


class Control(tornado.websocket.WebSocketHandler):
    def open(self):
        global arduino
        arduino = serial.Serial(ARDUINO_PORT, 19200, timeout=3) #Modify baud if needed.
        print("WebSocket opened!")
        arduino.write("c")
        self.write_message("ok")

    def on_message(self, data):
        global arduino
        sequence = tornado.escape.json_decode(data)["value"]
        if sequence != "":
            print sequence
            arduino.write(sequence)
            arduino.flush()
        self.write_message("ok")

    def on_close(self):
        global arduino
        print("WebSocket closed")
        arduino.close()

application = tornado.web.Application([
  (r"/", Index),
  (r"/control", Control),
])


def main():
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(8888)
    print "Starting server..."
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()