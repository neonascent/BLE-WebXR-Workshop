/*
  Software serial multple serial test

 Receives from the hardware serial, sends to software serial.
 Receives from software serial, sends to hardware serial.

 The circuit:
 * RX is digital pin 5 (connect to TX of other device)
 * TX is digital pin 6 (connect to RX of other device)

 Note:
 Not all pins on the Mega and Mega 2560 support change interrupts,
 so only the following can be used for RX:
 10, 11, 12, 13, 50, 51, 52, 53, 62, 63, 64, 65, 66, 67, 68, 69

 Not all pins on the Leonardo and Micro support change interrupts,
 so only the following can be used for RX:
 8, 9, 10, 11, 14 (MISO), 15 (SCK), 16 (MOSI).

 created back in the mists of time
 modified 25 May 2012
 by Tom Igoe
 based on Mikal Hart's example

 This example code is in the public domain.

 */
#include <SoftwareSerial.h>

SoftwareSerial mySerial(5, 6); // RX, TX

// Define pins.
int buzzerPin = 3;    // pin for vibration motor
int buttonPin = 7;
int potPin = A5; 
int ledPin = 10;
int vibratePeriod = 100;        // used to count how long we are vibrating for
int potvalue = 0;

// Variables.
boolean buttonState = false;
boolean vibrate = false;

void setup() {
  // Open serial communications and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }

  // set the data rate for the SoftwareSerial port
  mySerial.begin(9600);

  // Initialise button pin as INPUT.
  pinMode(buttonPin, INPUT);
}

void loop() { // run over and over
  // Read button value.
  buttonState = digitalRead(buttonPin);
  // Read POT the input pin.
  potvalue = analogRead(potPin);    
  // Map the function as PWM supports 0 to 255 not 0 to 1023.
  potvalue = map(potvalue, 0, 1023, 0, 255);

  // Print the contents of the variable to the serial monitor.
  mySerial.print("int: "); 
  mySerial.println(potvalue);  
  
  // Turn the LED on and off.
  if (buttonState == true)
  {
    mySerial.println("button");
  }

  while (mySerial.available()) {
    Serial.write(mySerial.read());
    vibrate = true;
  }
  while (Serial.available()) {
    mySerial.write(Serial.read());
  }

  if (vibrate) {
      tone(buzzerPin, 659, vibratePeriod);
      vibrate = false;
  }

  delay(100);                   

}
