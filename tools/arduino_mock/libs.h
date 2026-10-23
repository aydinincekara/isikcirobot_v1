#pragma once
#include "Arduino.h"
struct Servo { void attach(int) {} void write(int) {} };
#define DHT11 11
struct DHT { DHT(int, int) {} void begin() {} float readTemperature() { return 20; } float readHumidity() { return 50; } };
struct SPIC { void begin() {} }; extern SPIC SPI;
struct Uid { byte uidByte[10]; };
struct MFRC522 { Uid uid; MFRC522(int, int) {} void PCD_Init() {} bool PICC_IsNewCardPresent() { return false; } bool PICC_ReadCardSerial() { return false; } void PICC_HaltA() {} };
struct WireC { void begin() {} }; extern WireC Wire;
struct sensors_vec_t { float x, y, z; };
struct sensors_event_t { sensors_vec_t acceleration; };
struct Adafruit_MPU6050 { bool begin() { return true; } void getEvent(sensors_event_t*, sensors_event_t*, sensors_event_t*) {} };
