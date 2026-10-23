// Arduino derleme denemesi için çok küçük bir taklit (sadece sözdizimi kontrolü)
#pragma once
#include <cmath>
#include <cstdint>
#include <string>
typedef uint8_t byte;
#define HIGH 1
#define LOW 0
#define INPUT 0
#define OUTPUT 1
#define INPUT_PULLUP 2
#define HEX 16
#define A0 14
#define A1 15
#define A2 16
#define A3 17
#define A4 18
#define A5 19
#ifndef PI
#define PI 3.14159265
#endif
using std::isnan;
class String { public: std::string s; String() {} String(const char* c) : s(c) {} String(int v) : s(std::to_string(v)) {} String(long v) : s(std::to_string(v)) {}
  String(float v) : s(std::to_string(v)) {} String(double v) : s(std::to_string(v)) {} String(bool v) : s(v ? "1" : "0") {}
  String operator+(const String& o) const { String r; r.s = s + o.s; return r; } };
inline void pinMode(int, int) {}
inline void digitalWrite(int, int) {}
inline int digitalRead(int) { return 0; }
inline int analogRead(int) { return 0; }
inline void delay(unsigned long) {}
inline void delayMicroseconds(unsigned int) {}
inline unsigned long millis() { return 0; }
inline unsigned long pulseIn(int, int, unsigned long = 1000000) { return 0; }
inline long map(long x, long a, long b, long c, long d) { return (x - a) * (d - c) / (b - a) + c; }
template <class T, class U, class V> T constrain(T x, U a, V b) { return x < a ? a : (x > b ? b : x); }
struct SerialC { void begin(long) {} template <class T> void print(T) {} template <class T> void print(T, int) {} template <class T> void println(T) {} void println() {} };
extern SerialC Serial;
