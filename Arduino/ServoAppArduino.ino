#include <Servo.h>

Servo servo1; Servo servo2; 


void setup() {

  pinMode(1,OUTPUT);
  servo1.attach(9); // PWM pin 9

  servo2.attach(8); // PWM pin 8
  Serial.begin(19200); //Serial com baud-rate.
  Serial.println("Ready");

  //Init LED. Off by default. Use this to controll the laser on/off. (Pin 13 is the on-board LED of the Arduino)
  pinMode(13, OUTPUT);  
  digitalWrite(13, LOW);     
}

void loop() {

  static int v = 0;

  if ( Serial.available()) {
    char ch = Serial.read();

    switch(ch) {
      case '0'...'9':
        v = v * 10 + ch - '0';
        break;
      case 's':
        servo1.write(v);
        v = 0;
        break;
      case 'w':
        servo2.write(v);
        v = 0;
        break;
      case 'on':
        digitalWrite(13, HIGH);    // set the LED on
        v = 0;
        break;
      case 'off':
        digitalWrite(13, LOW);    // set the LED off
        v = 0;
        break;
    }
  }

//  Servo::refresh();

} 

