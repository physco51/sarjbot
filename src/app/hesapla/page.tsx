"use client";

import { useState, useMemo, useEffect } from "react";

// heatPump: isi pompasi, batteryType: batarya tipi, warranty: garanti, cd: surtunum katsayisi
const VEHICLES: {
  name: string; batteryKWh: number; effWh: number; maxAC: number; maxDC: number;
  wltpKm: number; dcChargeMin: number | null; dcChargeRange: string;
  heatPump: boolean; batteryType: string; warranty: string; cd: number;
}[] = [
  // Tesla
  { name: "Tesla Model 3 SR+", batteryKWh: 60, effWh: 145, maxAC: 11, maxDC: 170, wltpKm: 410, dcChargeMin: 25, dcChargeRange: "10-80%", heatPump: true, batteryType: "LFP", warranty: "8 yil / 160.000 km", cd: 0.23 },
  { name: "Tesla Model 3 LR", batteryKWh: 75, effWh: 150, maxAC: 11, maxDC: 250, wltpKm: 510, dcChargeMin: 25, dcChargeRange: "10-80%", heatPump: true, batteryType: "NCA", warranty: "8 yil / 192.000 km", cd: 0.23 },
  { name: "Tesla Model 3 Performance", batteryKWh: 75, effWh: 160, maxAC: 11, maxDC: 250, wltpKm: 460, dcChargeMin: 25, dcChargeRange: "10-80%", heatPump: true, batteryType: "NCA", warranty: "8 yil / 192.000 km", cd: 0.23 },
  { name: "Tesla Model Y RWD", batteryKWh: 60, effWh: 155, maxAC: 11, maxDC: 170, wltpKm: 390, dcChargeMin: 25, dcChargeRange: "10-80%", heatPump: true, batteryType: "LFP", warranty: "8 yil / 160.000 km", cd: 0.26 },
  { name: "Tesla Model Y LR", batteryKWh: 75, effWh: 160, maxAC: 11, maxDC: 250, wltpKm: 480, dcChargeMin: 25, dcChargeRange: "10-80%", heatPump: true, batteryType: "NCA", warranty: "8 yil / 192.000 km", cd: 0.26 },
  { name: "Tesla Model S LR", batteryKWh: 100, effWh: 180, maxAC: 11, maxDC: 250, wltpKm: 560, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: true, batteryType: "NCA", warranty: "8 yil / 240.000 km", cd: 0.208 },
  { name: "Tesla Model X LR", batteryKWh: 100, effWh: 200, maxAC: 11, maxDC: 250, wltpKm: 500, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: true, batteryType: "NCA", warranty: "8 yil / 240.000 km", cd: 0.24 },
  // Togg
  { name: "Togg T10F Standart", batteryKWh: 52.4, effWh: 155, maxAC: 11, maxDC: 150, wltpKm: 327, dcChargeMin: 25, dcChargeRange: "10-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.27 },
  { name: "Togg T10F Uzun Menzil", batteryKWh: 88.5, effWh: 165, maxAC: 11, maxDC: 150, wltpKm: 535, dcChargeMin: 35, dcChargeRange: "10-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.27 },
  { name: "Togg T10X Uzun Menzil", batteryKWh: 88.5, effWh: 180, maxAC: 22, maxDC: 150, wltpKm: 492, dcChargeMin: 35, dcChargeRange: "10-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.29 },
  { name: "Togg T10X Standart", batteryKWh: 52.4, effWh: 170, maxAC: 22, maxDC: 150, wltpKm: 314, dcChargeMin: 25, dcChargeRange: "10-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.29 },
  // BMW
  { name: "BMW i7 eDrive60", batteryKWh: 101.7, effWh: 199, maxAC: 11, maxDC: 195, wltpKm: 625, dcChargeMin: 34, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.24 },
  { name: "BMW iX1 eDrive20", batteryKWh: 64.7, effWh: 165, maxAC: 11, maxDC: 130, wltpKm: 395, dcChargeMin: 29, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.26 },
  { name: "BMW iX2 xDrive30", batteryKWh: 64.7, effWh: 167, maxAC: 11, maxDC: 130, wltpKm: 417, dcChargeMin: 29, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.26 },
  { name: "BMW iX3", batteryKWh: 74, effWh: 180, maxAC: 11, maxDC: 150, wltpKm: 410, dcChargeMin: 32, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.29 },
  { name: "BMW i4 eDrive40", batteryKWh: 83.9, effWh: 165, maxAC: 11, maxDC: 205, wltpKm: 510, dcChargeMin: 31, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.24 },
  { name: "BMW i5 eDrive40", batteryKWh: 83.9, effWh: 175, maxAC: 11, maxDC: 205, wltpKm: 480, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.23 },
  { name: "BMW iX xDrive40", batteryKWh: 76.6, effWh: 195, maxAC: 11, maxDC: 150, wltpKm: 395, dcChargeMin: 31, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.25 },
  { name: "BMW iX xDrive50", batteryKWh: 111.5, effWh: 210, maxAC: 11, maxDC: 195, wltpKm: 530, dcChargeMin: 35, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.25 },
  // Mercedes
  { name: "Mercedes EQA 250+", batteryKWh: 70.5, effWh: 175, maxAC: 11, maxDC: 100, wltpKm: 400, dcChargeMin: 32, dcChargeRange: "10-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Mercedes EQB 250+", batteryKWh: 70.5, effWh: 185, maxAC: 11, maxDC: 100, wltpKm: 380, dcChargeMin: 32, dcChargeRange: "10-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Mercedes EQC 400", batteryKWh: 80, effWh: 215, maxAC: 11, maxDC: 110, wltpKm: 370, dcChargeMin: 40, dcChargeRange: "10-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.29 },
  { name: "Mercedes EQE 350+", batteryKWh: 96, effWh: 175, maxAC: 11, maxDC: 170, wltpKm: 545, dcChargeMin: 32, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "10 yil / 250.000 km", cd: 0.22 },
  { name: "Mercedes EQE SUV 350+", batteryKWh: 90.6, effWh: 201, maxAC: 11, maxDC: 170, wltpKm: 460, dcChargeMin: 32, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "10 yil / 250.000 km", cd: 0.25 },
  { name: "Mercedes EQS 450+", batteryKWh: 107.8, effWh: 180, maxAC: 11, maxDC: 200, wltpKm: 600, dcChargeMin: 31, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "10 yil / 250.000 km", cd: 0.2 },
  { name: "Mercedes EQS SUV 450+", batteryKWh: 108.4, effWh: 216, maxAC: 11, maxDC: 200, wltpKm: 507, dcChargeMin: 31, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "10 yil / 250.000 km", cd: 0.26 },
  // Hyundai
  { name: "Hyundai Inster", batteryKWh: 49, effWh: 139, maxAC: 11, maxDC: 85, wltpKm: 370, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: true, batteryType: "LFP", warranty: "8 yil / 160.000 km", cd: 0.31 },
  { name: "Hyundai Kona Electric", batteryKWh: 65.4, effWh: 150, maxAC: 11, maxDC: 100, wltpKm: 435, dcChargeMin: 41, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.29 },
  { name: "Hyundai Ioniq 5 SR", batteryKWh: 58, effWh: 165, maxAC: 11, maxDC: 220, wltpKm: 354, dcChargeMin: 18, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.29 },
  { name: "Hyundai Ioniq 5 LR", batteryKWh: 77.4, effWh: 170, maxAC: 11, maxDC: 240, wltpKm: 460, dcChargeMin: 18, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.29 },
  { name: "Hyundai Ioniq 6 LR", batteryKWh: 77.4, effWh: 145, maxAC: 11, maxDC: 240, wltpKm: 535, dcChargeMin: 18, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.21 },
  // Kia
  { name: "Kia EV3 Standard", batteryKWh: 58.3, effWh: 143, maxAC: 11, maxDC: 101, wltpKm: 410, dcChargeMin: 29, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "7 yil / 150.000 km", cd: 0.28 },
  { name: "Kia EV3 Long Range", batteryKWh: 81.4, effWh: 148, maxAC: 11, maxDC: 128, wltpKm: 600, dcChargeMin: 31, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "7 yil / 150.000 km", cd: 0.28 },
  { name: "Kia Niro EV", batteryKWh: 64.8, effWh: 155, maxAC: 11, maxDC: 80, wltpKm: 420, dcChargeMin: 43, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "7 yil / 150.000 km", cd: 0.29 },
  { name: "Kia EV6 SR", batteryKWh: 58, effWh: 160, maxAC: 11, maxDC: 180, wltpKm: 360, dcChargeMin: 18, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "7 yil / 150.000 km", cd: 0.28 },
  { name: "Kia EV6 LR", batteryKWh: 77.4, effWh: 165, maxAC: 11, maxDC: 240, wltpKm: 470, dcChargeMin: 18, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "7 yil / 150.000 km", cd: 0.28 },
  { name: "Kia EV9 LR", batteryKWh: 99.8, effWh: 215, maxAC: 11, maxDC: 240, wltpKm: 465, dcChargeMin: 24, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "7 yil / 150.000 km", cd: 0.28 },
  // Volkswagen
  { name: "VW ID.3 Pro", batteryKWh: 58, effWh: 155, maxAC: 11, maxDC: 120, wltpKm: 375, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.26 },
  { name: "VW ID.3 Pro S", batteryKWh: 77, effWh: 160, maxAC: 11, maxDC: 170, wltpKm: 480, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.26 },
  { name: "VW ID.4 Pro", batteryKWh: 77, effWh: 175, maxAC: 11, maxDC: 135, wltpKm: 440, dcChargeMin: 36, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "VW ID.5 GTX", batteryKWh: 77, effWh: 180, maxAC: 11, maxDC: 150, wltpKm: 430, dcChargeMin: 33, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.26 },
  { name: "VW ID.7 Pro S", batteryKWh: 86, effWh: 160, maxAC: 11, maxDC: 200, wltpKm: 540, dcChargeMin: 26, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.23 },
  { name: "VW ID.Buzz Pro", batteryKWh: 82, effWh: 210, maxAC: 11, maxDC: 185, wltpKm: 390, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.29 },
  // Renault
  { name: "Renault Megane E-Tech EV60", batteryKWh: 60, effWh: 155, maxAC: 22, maxDC: 130, wltpKm: 385, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Renault Scenic E-Tech EV87", batteryKWh: 87, effWh: 170, maxAC: 22, maxDC: 150, wltpKm: 510, dcChargeMin: 37, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Renault Zoe R135", batteryKWh: 52, effWh: 145, maxAC: 22, maxDC: 50, wltpKm: 360, dcChargeMin: 55, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.29 },
  // Citroen
  { name: "Citroen Ami", batteryKWh: 5.5, effWh: 69, maxAC: 1.8, maxDC: 0, wltpKm: 75, dcChargeMin: null, dcChargeRange: "-", heatPump: false, batteryType: "LFP", warranty: "8 yil / 100.000 km", cd: 0.48 },
  { name: "Citroen e-C3", batteryKWh: 44, effWh: 148, maxAC: 7.4, maxDC: 100, wltpKm: 300, dcChargeMin: 26, dcChargeRange: "20-80%", heatPump: false, batteryType: "LFP", warranty: "8 yil / 160.000 km", cd: 0.32 },
  { name: "Citroen e-C3 Aircross", batteryKWh: 44, effWh: 160, maxAC: 7.4, maxDC: 100, wltpKm: 306, dcChargeMin: 26, dcChargeRange: "20-80%", heatPump: false, batteryType: "LFP", warranty: "8 yil / 160.000 km", cd: 0.32 },
  { name: "Citroen e-C3 Aircross LR", batteryKWh: 54, effWh: 160, maxAC: 11, maxDC: 100, wltpKm: 400, dcChargeMin: 27, dcChargeRange: "20-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.32 },
  { name: "Citroen e-C4", batteryKWh: 50, effWh: 160, maxAC: 11, maxDC: 100, wltpKm: 315, dcChargeMin: 30, dcChargeRange: "20-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.29 },
  { name: "Citroen e-C4 X", batteryKWh: 50, effWh: 158, maxAC: 7.4, maxDC: 100, wltpKm: 320, dcChargeMin: 30, dcChargeRange: "20-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.29 },
  { name: "Citroen e-C5 Aircross", batteryKWh: 73, effWh: 175, maxAC: 11, maxDC: 160, wltpKm: 415, dcChargeMin: 30, dcChargeRange: "20-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.29 },
  { name: "Citroen e-Berlingo", batteryKWh: 50, effWh: 190, maxAC: 11, maxDC: 100, wltpKm: 265, dcChargeMin: 30, dcChargeRange: "20-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.32 },
  { name: "Citroen e-SpaceTourer", batteryKWh: 75, effWh: 250, maxAC: 11, maxDC: 100, wltpKm: 300, dcChargeMin: 45, dcChargeRange: "20-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.31 },
  // Peugeot
  { name: "Peugeot e-208", batteryKWh: 50, effWh: 150, maxAC: 11, maxDC: 100, wltpKm: 335, dcChargeMin: 30, dcChargeRange: "20-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.29 },
  { name: "Peugeot e-2008", batteryKWh: 50, effWh: 165, maxAC: 11, maxDC: 100, wltpKm: 305, dcChargeMin: 30, dcChargeRange: "20-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.31 },
  { name: "Peugeot e-308", batteryKWh: 54, effWh: 155, maxAC: 11, maxDC: 100, wltpKm: 350, dcChargeMin: 30, dcChargeRange: "20-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Peugeot e-3008", batteryKWh: 73, effWh: 170, maxAC: 11, maxDC: 160, wltpKm: 430, dcChargeMin: 30, dcChargeRange: "20-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Peugeot e-5008", batteryKWh: 73, effWh: 171, maxAC: 11, maxDC: 160, wltpKm: 502, dcChargeMin: 30, dcChargeRange: "20-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Peugeot e-Traveller", batteryKWh: 75, effWh: 237, maxAC: 11, maxDC: 100, wltpKm: 322, dcChargeMin: 45, dcChargeRange: "20-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.31 },
  // Opel
  { name: "Opel Corsa Electric", batteryKWh: 50, effWh: 150, maxAC: 11, maxDC: 100, wltpKm: 335, dcChargeMin: 30, dcChargeRange: "20-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.29 },
  { name: "Opel Mokka Electric", batteryKWh: 50, effWh: 165, maxAC: 11, maxDC: 100, wltpKm: 305, dcChargeMin: 30, dcChargeRange: "20-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.32 },
  { name: "Opel Astra Electric", batteryKWh: 54, effWh: 158, maxAC: 11, maxDC: 100, wltpKm: 345, dcChargeMin: 30, dcChargeRange: "20-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Opel Frontera Electric", batteryKWh: 44, effWh: 161, maxAC: 7.4, maxDC: 100, wltpKm: 305, dcChargeMin: 26, dcChargeRange: "20-80%", heatPump: false, batteryType: "LFP", warranty: "8 yil / 160.000 km", cd: 0.32 },
  { name: "Opel Grandland Electric", batteryKWh: 73, effWh: 170, maxAC: 11, maxDC: 160, wltpKm: 523, dcChargeMin: 30, dcChargeRange: "20-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  // Fiat
  { name: "Fiat 500e", batteryKWh: 42, effWh: 140, maxAC: 11, maxDC: 85, wltpKm: 300, dcChargeMin: 35, dcChargeRange: "20-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.31 },
  { name: "Fiat 600e", batteryKWh: 54, effWh: 160, maxAC: 11, maxDC: 100, wltpKm: 340, dcChargeMin: 30, dcChargeRange: "20-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.31 },
  { name: "Fiat Grande Panda Electric", batteryKWh: 44, effWh: 155, maxAC: 7.4, maxDC: 100, wltpKm: 320, dcChargeMin: 27, dcChargeRange: "20-80%", heatPump: false, batteryType: "LFP", warranty: "8 yil / 160.000 km", cd: 0.32 },
  // BYD
  { name: "BYD Atto 2", batteryKWh: 45.1, effWh: 148, maxAC: 6.6, maxDC: 70, wltpKm: 305, dcChargeMin: 35, dcChargeRange: "10-80%", heatPump: true, batteryType: "LFP", warranty: "8 yil / 200.000 km", cd: 0.31 },
  { name: "BYD Atto 3", batteryKWh: 60.5, effWh: 170, maxAC: 7, maxDC: 88, wltpKm: 356, dcChargeMin: 37, dcChargeRange: "10-80%", heatPump: true, batteryType: "LFP", warranty: "8 yil / 200.000 km", cd: 0.29 },
  { name: "BYD Dolphin", batteryKWh: 60.5, effWh: 148, maxAC: 7, maxDC: 88, wltpKm: 410, dcChargeMin: 37, dcChargeRange: "10-80%", heatPump: true, batteryType: "LFP", warranty: "8 yil / 200.000 km", cd: 0.29 },
  { name: "BYD Seal", batteryKWh: 82.5, effWh: 160, maxAC: 7, maxDC: 150, wltpKm: 516, dcChargeMin: 33, dcChargeRange: "10-80%", heatPump: true, batteryType: "LFP", warranty: "8 yil / 200.000 km", cd: 0.22 },
  { name: "BYD Seal U", batteryKWh: 87.0, effWh: 180, maxAC: 7, maxDC: 140, wltpKm: 483, dcChargeMin: 38, dcChargeRange: "10-80%", heatPump: true, batteryType: "LFP", warranty: "8 yil / 200.000 km", cd: 0.22 },
  { name: "BYD Han", batteryKWh: 85.4, effWh: 175, maxAC: 7, maxDC: 120, wltpKm: 490, dcChargeMin: 37, dcChargeRange: "10-80%", heatPump: true, batteryType: "LFP", warranty: "8 yil / 200.000 km", cd: 0.23 },
  { name: "BYD Tang EV", batteryKWh: 108.8, effWh: 220, maxAC: 7, maxDC: 166, wltpKm: 495, dcChargeMin: 40, dcChargeRange: "10-80%", heatPump: true, batteryType: "LFP", warranty: "8 yil / 200.000 km", cd: 0.29 },
  // MG
  { name: "MG4 Standard", batteryKWh: 51, effWh: 155, maxAC: 11, maxDC: 117, wltpKm: 330, dcChargeMin: 26, dcChargeRange: "10-80%", heatPump: false, batteryType: "LFP", warranty: "7 yil / 150.000 km", cd: 0.27 },
  { name: "MG4 Long Range", batteryKWh: 64, effWh: 160, maxAC: 11, maxDC: 135, wltpKm: 400, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: false, batteryType: "NMC", warranty: "7 yil / 150.000 km", cd: 0.27 },
  { name: "MG4 XPower", batteryKWh: 64, effWh: 170, maxAC: 11, maxDC: 135, wltpKm: 375, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: false, batteryType: "NMC", warranty: "7 yil / 150.000 km", cd: 0.27 },
  { name: "MG Marvel R", batteryKWh: 70, effWh: 185, maxAC: 11, maxDC: 92, wltpKm: 380, dcChargeMin: 43, dcChargeRange: "10-80%", heatPump: false, batteryType: "NMC", warranty: "7 yil / 150.000 km", cd: 0.29 },
  { name: "MG ZS EV", batteryKWh: 72.6, effWh: 175, maxAC: 11, maxDC: 92, wltpKm: 415, dcChargeMin: 42, dcChargeRange: "10-80%", heatPump: false, batteryType: "NMC", warranty: "7 yil / 150.000 km", cd: 0.33 },
  // Volvo
  { name: "Volvo EX30 SR", batteryKWh: 51, effWh: 150, maxAC: 11, maxDC: 134, wltpKm: 340, dcChargeMin: 25, dcChargeRange: "10-80%", heatPump: true, batteryType: "LFP", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Volvo EX30 LR", batteryKWh: 69, effWh: 155, maxAC: 11, maxDC: 153, wltpKm: 445, dcChargeMin: 26, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Volvo EX40 (XC40 Recharge)", batteryKWh: 82, effWh: 185, maxAC: 11, maxDC: 200, wltpKm: 440, dcChargeMin: 28, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.32 },
  { name: "Volvo EC40 (C40 Recharge)", batteryKWh: 82, effWh: 180, maxAC: 11, maxDC: 200, wltpKm: 455, dcChargeMin: 28, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Volvo EX90 Twin Motor", batteryKWh: 111, effWh: 210, maxAC: 11, maxDC: 250, wltpKm: 530, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.29 },
  // Cupra / SEAT
  { name: "Cupra Born 58 kWh", batteryKWh: 58, effWh: 155, maxAC: 11, maxDC: 120, wltpKm: 375, dcChargeMin: 29, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.27 },
  { name: "Cupra Born 77 kWh", batteryKWh: 77, effWh: 160, maxAC: 11, maxDC: 170, wltpKm: 480, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.27 },
  { name: "Cupra Tavascan", batteryKWh: 77, effWh: 180, maxAC: 11, maxDC: 135, wltpKm: 430, dcChargeMin: 36, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.27 },
  // Skoda
  { name: "Skoda Enyaq iV 60", batteryKWh: 58, effWh: 165, maxAC: 11, maxDC: 120, wltpKm: 355, dcChargeMin: 29, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.26 },
  { name: "Skoda Enyaq iV 80", batteryKWh: 77, effWh: 170, maxAC: 11, maxDC: 135, wltpKm: 455, dcChargeMin: 36, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.26 },
  { name: "Skoda Enyaq Coupe RS", batteryKWh: 77, effWh: 175, maxAC: 11, maxDC: 175, wltpKm: 440, dcChargeMin: 29, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.23 },
  // Audi
  { name: "Audi Q4 e-tron 40", batteryKWh: 76.6, effWh: 175, maxAC: 11, maxDC: 135, wltpKm: 440, dcChargeMin: 36, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Audi Q4 e-tron 50", batteryKWh: 76.6, effWh: 185, maxAC: 11, maxDC: 175, wltpKm: 415, dcChargeMin: 28, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Audi Q8 e-tron 55", batteryKWh: 114, effWh: 210, maxAC: 11, maxDC: 170, wltpKm: 540, dcChargeMin: 31, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Audi e-tron GT", batteryKWh: 93.4, effWh: 195, maxAC: 11, maxDC: 270, wltpKm: 480, dcChargeMin: 23, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.24 },
  // Porsche
  { name: "Porsche Taycan", batteryKWh: 79.2, effWh: 190, maxAC: 11, maxDC: 270, wltpKm: 415, dcChargeMin: 22, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.22 },
  { name: "Porsche Taycan Performance", batteryKWh: 93.4, effWh: 200, maxAC: 11, maxDC: 270, wltpKm: 465, dcChargeMin: 22, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.22 },
  { name: "Porsche Macan Electric", batteryKWh: 100, effWh: 195, maxAC: 11, maxDC: 270, wltpKm: 510, dcChargeMin: 22, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.25 },
  // Nissan
  { name: "Nissan Leaf 40 kWh", batteryKWh: 40, effWh: 155, maxAC: 6.6, maxDC: 50, wltpKm: 258, dcChargeMin: 40, dcChargeRange: "20-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Nissan Leaf e+ 62 kWh", batteryKWh: 62, effWh: 165, maxAC: 6.6, maxDC: 100, wltpKm: 375, dcChargeMin: 40, dcChargeRange: "20-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Nissan Ariya 63 kWh", batteryKWh: 63, effWh: 165, maxAC: 22, maxDC: 130, wltpKm: 380, dcChargeMin: 28, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.3 },
  { name: "Nissan Ariya 87 kWh", batteryKWh: 87, effWh: 175, maxAC: 22, maxDC: 130, wltpKm: 495, dcChargeMin: 35, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.3 },
  // Toyota / Lexus
  { name: "Toyota bZ4X", batteryKWh: 71.4, effWh: 175, maxAC: 6.6, maxDC: 150, wltpKm: 410, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Lexus RZ 450e", batteryKWh: 71.4, effWh: 185, maxAC: 11, maxDC: 150, wltpKm: 385, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Lexus UX 300e", batteryKWh: 72.8, effWh: 175, maxAC: 6.6, maxDC: 150, wltpKm: 415, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.3 },
  // Ford
  { name: "Ford Mustang Mach-E SR", batteryKWh: 70, effWh: 175, maxAC: 11, maxDC: 115, wltpKm: 400, dcChargeMin: 38, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.27 },
  { name: "Ford Mustang Mach-E LR", batteryKWh: 91, effWh: 180, maxAC: 11, maxDC: 150, wltpKm: 505, dcChargeMin: 36, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.27 },
  { name: "Ford Explorer Electric", batteryKWh: 77, effWh: 175, maxAC: 11, maxDC: 185, wltpKm: 440, dcChargeMin: 26, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  // Mini / Smart
  { name: "Mini Cooper SE", batteryKWh: 54.2, effWh: 155, maxAC: 11, maxDC: 95, wltpKm: 350, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  { name: "Mini Countryman SE ALL4", batteryKWh: 66.5, effWh: 175, maxAC: 11, maxDC: 130, wltpKm: 380, dcChargeMin: 29, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.26 },
  { name: "Smart #1 Pro+", batteryKWh: 66, effWh: 165, maxAC: 22, maxDC: 150, wltpKm: 400, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 150.000 km", cd: 0.29 },
  { name: "Smart #3", batteryKWh: 66, effWh: 170, maxAC: 22, maxDC: 150, wltpKm: 390, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 150.000 km", cd: 0.27 },
  // Dacia
  { name: "Dacia Spring Electric", batteryKWh: 26.8, effWh: 140, maxAC: 7.4, maxDC: 30, wltpKm: 190, dcChargeMin: 56, dcChargeRange: "20-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 120.000 km", cd: 0.33 },
  // Jaguar
  { name: "Jaguar I-Pace", batteryKWh: 90, effWh: 220, maxAC: 11, maxDC: 104, wltpKm: 410, dcChargeMin: 45, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.29 },
  // Alfa Romeo
  { name: "Alfa Romeo Junior Elettrica", batteryKWh: 54, effWh: 155, maxAC: 11, maxDC: 100, wltpKm: 410, dcChargeMin: 30, dcChargeRange: "20-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  // DS
  { name: "DS3 E-Tense", batteryKWh: 54, effWh: 156, maxAC: 11, maxDC: 100, wltpKm: 402, dcChargeMin: 30, dcChargeRange: "20-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.28 },
  // Honda
  { name: "Honda e:Ny1", batteryKWh: 68.8, effWh: 179, maxAC: 11, maxDC: 78, wltpKm: 412, dcChargeMin: 45, dcChargeRange: "10-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.3 },
  // Leapmotor (Stellantis)
  { name: "Leapmotor T03", batteryKWh: 37.3, effWh: 135, maxAC: 6.6, maxDC: 48, wltpKm: 265, dcChargeMin: 36, dcChargeRange: "20-80%", heatPump: false, batteryType: "LFP", warranty: "8 yil / 150.000 km", cd: 0.33 },
  { name: "Leapmotor C10", batteryKWh: 69.9, effWh: 161, maxAC: 11, maxDC: 84, wltpKm: 420, dcChargeMin: 30, dcChargeRange: "20-80%", heatPump: true, batteryType: "LFP", warranty: "8 yil / 150.000 km", cd: 0.27 },
  // GWM ORA
  { name: "GWM ORA 03", batteryKWh: 48, effWh: 155, maxAC: 6.6, maxDC: 67, wltpKm: 310, dcChargeMin: 38, dcChargeRange: "10-80%", heatPump: false, batteryType: "LFP", warranty: "8 yil / 150.000 km", cd: 0.3 },
  { name: "GWM ORA 07", batteryKWh: 63.5, effWh: 163, maxAC: 11, maxDC: 80, wltpKm: 440, dcChargeMin: 42, dcChargeRange: "10-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 150.000 km", cd: 0.27 },
  // Skywell
  { name: "Skywell ET5", batteryKWh: 72, effWh: 175, maxAC: 6.6, maxDC: 60, wltpKm: 400, dcChargeMin: 60, dcChargeRange: "20-80%", heatPump: false, batteryType: "NMC", warranty: "5 yil / 150.000 km", cd: 0.31 },
  // Seres
  { name: "Seres 3", batteryKWh: 52, effWh: 170, maxAC: 6.6, maxDC: 80, wltpKm: 305, dcChargeMin: 35, dcChargeRange: "20-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 150.000 km", cd: 0.32 },
  { name: "Seres 5", batteryKWh: 80, effWh: 180, maxAC: 11, maxDC: 150, wltpKm: 445, dcChargeMin: 30, dcChargeRange: "10-80%", heatPump: true, batteryType: "NMC", warranty: "8 yil / 150.000 km", cd: 0.29 },
  // SsangYong
  { name: "SsangYong Torres EVX", batteryKWh: 73.4, effWh: 181, maxAC: 11, maxDC: 120, wltpKm: 405, dcChargeMin: 33, dcChargeRange: "10-80%", heatPump: false, batteryType: "LFP", warranty: "8 yil / 160.000 km", cd: 0.34 },
  // Diger
  { name: "Diger (50 kWh)", batteryKWh: 50, effWh: 160, maxAC: 11, maxDC: 100, wltpKm: 310, dcChargeMin: 35, dcChargeRange: "10-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.3 },
  { name: "Diger (75 kWh)", batteryKWh: 75, effWh: 170, maxAC: 11, maxDC: 150, wltpKm: 440, dcChargeMin: 35, dcChargeRange: "10-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.3 },
  { name: "Diger (100 kWh)", batteryKWh: 100, effWh: 190, maxAC: 11, maxDC: 200, wltpKm: 525, dcChargeMin: 35, dcChargeRange: "10-80%", heatPump: false, batteryType: "NMC", warranty: "8 yil / 160.000 km", cd: 0.3 },
].sort((a, b) => a.name.localeCompare(b.name, "tr"));

export default function HesaplaPage() {
  const [vehicleIdx, setVehicleIdx] = useState(0);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [currentSoC, setCurrentSoC] = useState(20);
  const [targetSoC, setTargetSoC] = useState(80);
  const [pricePerKWh, setPricePerKWh] = useState(11.0);
  const [priceLabel, setPriceLabel] = useState("");
  const [chargeType, setChargeType] = useState<"home" | "AC" | "DC">("DC");
  const [gasLPer100km, setGasLPer100km] = useState(7.0);
  const [fuelType, setFuelType] = useState<"benzin" | "motorin">("benzin");
  const [fuelPrices, setFuelPrices] = useState({ benzin: 62.60, motorin: 77.47 });
  const [fuelLoading, setFuelLoading] = useState(true);
  const [cheapestAC, setCheapestAC] = useState<{ price: number; name: string } | null>(null);
  const [cheapestDC, setCheapestDC] = useState<{ price: number; name: string } | null>(null);

  const vehicle = VEHICLES[vehicleIdx];

  // Fetch fuel prices + operator prices
  useEffect(() => {
    fetch("/api/akaryakit")
      .then((r) => r.json())
      .then((data) => {
        if (data.benzin && data.motorin) {
          setFuelPrices({ benzin: data.benzin, motorin: data.motorin });
        }
      })
      .catch(() => {})
      .finally(() => setFuelLoading(false));

    fetch("/api/fiyatlar")
      .then((r) => r.json())
      .then((ops: { name: string; prices: { AC: { min: number; isVerified: boolean } | null; DC: { min: number; isVerified: boolean } | null } }[]) => {
        let bestAC: { price: number; name: string } | null = null;
        let bestDC: { price: number; name: string } | null = null;
        for (const op of ops) {
          if (op.prices.AC?.isVerified && (!bestAC || op.prices.AC.min < bestAC.price)) {
            bestAC = { price: op.prices.AC.min, name: op.name };
          }
          if (op.prices.DC?.isVerified && (!bestDC || op.prices.DC.min < bestDC.price)) {
            bestDC = { price: op.prices.DC.min, name: op.name };
          }
        }
        setCheapestAC(bestAC);
        setCheapestDC(bestDC);
        // Set initial DC price
        if (bestDC) {
          setPricePerKWh(bestDC.price);
          setPriceLabel(bestDC.name);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-set price when charge type changes
  const handleChargeType = (t: "home" | "AC" | "DC") => {
    setChargeType(t);
    if (t === "home") {
      setPricePerKWh(2.59);
      setPriceLabel("Mesken tarifesi");
    } else if (t === "AC" && cheapestAC) {
      setPricePerKWh(cheapestAC.price);
      setPriceLabel(cheapestAC.name);
    } else if (t === "DC" && cheapestDC) {
      setPricePerKWh(cheapestDC.price);
      setPriceLabel(cheapestDC.name);
    }
  };

  const gasPricePerL = fuelPrices[fuelType];

  const result = useMemo(() => {
    const energyNeeded = ((targetSoC - currentSoC) / 100) * vehicle.batteryKWh;
    if (energyNeeded <= 0) return null;

    const power = chargeType === "DC" ? vehicle.maxDC : chargeType === "AC" ? vehicle.maxAC : Math.min(vehicle.maxAC, 3.7);
    const chargingHours = energyNeeded / (power * 0.9);
    const chargingMinutes = Math.round(chargingHours * 60);

    const totalCost = energyNeeded * pricePerKWh;
    const rangeKm = Math.round(energyNeeded / (vehicle.effWh / 1000));
    const costPerKm = totalCost / rangeKm;

    const gasCost = (rangeKm / 100) * gasLPer100km * gasPricePerL;
    const gasCostPerKm = rangeKm > 0 ? gasCost / rangeKm : 0;
    const savings = gasCost - totalCost;
    const savingsPercent = gasCost > 0 ? Math.round((savings / gasCost) * 100) : 0;

    return {
      energyNeeded: Math.round(energyNeeded * 100) / 100,
      chargingMinutes,
      power,
      totalCost: Math.round(totalCost * 100) / 100,
      rangeKm,
      costPerKm: Math.round(costPerKm * 100) / 100,
      gasCostPerKm: Math.round(gasCostPerKm * 100) / 100,
      gasCost: Math.round(gasCost * 100) / 100,
      savingsPercent,
    };
  }, [vehicleIdx, currentSoC, targetSoC, pricePerKWh, chargeType, vehicle, gasLPer100km, gasPricePerL]);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
        Maliyet <span className="text-primary">Hesapla</span>
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Şarj maliyetinizi ve benzinli/dizel araca göre tasarrufunuzu hesaplayın.
      </p>

      <div className="rounded-xl border border-border/60 bg-card p-6 space-y-6">
        {/* Vehicle - searchable dropdown */}
        <div className="relative">
          <label className="block text-xs font-semibold text-muted-foreground mb-2">Araç Modeli</label>
          <button
            type="button"
            onClick={() => { setVehicleOpen(!vehicleOpen); setVehicleSearch(""); }}
            className="w-full h-10 px-3 rounded-lg bg-background border border-border/60 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <span className="truncate">{vehicle.name} ({vehicle.batteryKWh} kWh)</span>
            <span className="text-muted-foreground/50 text-xs">{"\u25BC"}</span>
          </button>
          {vehicleOpen && (
            <div className="absolute z-50 w-full mt-1 rounded-xl bg-card border border-border/60 shadow-xl overflow-hidden">
              <div className="p-2 border-b border-border/40">
                <input
                  type="text"
                  autoFocus
                  placeholder="Marka veya model ara..."
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  className="w-full h-8 px-2 rounded-md bg-background border border-border/40 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div className="max-h-[240px] overflow-y-auto">
                {VEHICLES.map((v, i) => {
                  if (vehicleSearch.trim()) {
                    const q = vehicleSearch.toLowerCase();
                    if (!v.name.toLowerCase().includes(q)) return null;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => { setVehicleIdx(i); setVehicleOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-white/[0.04] transition-colors ${
                        i === vehicleIdx ? "bg-primary/5 text-primary" : ""
                      }`}
                    >
                      <span className="truncate">{v.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{v.batteryKWh} kWh</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* Close on outside click */}
          {vehicleOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setVehicleOpen(false)} />
          )}
        </div>

        {/* Vehicle info */}
        <div className="rounded-lg bg-background/50 px-3 py-2.5 text-xs text-muted-foreground space-y-1.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <div><span className="font-semibold text-foreground">{vehicle.batteryKWh}</span> kWh</div>
            <div><span className="font-semibold text-foreground">{vehicle.wltpKm}</span> km WLTP</div>
            <div><span className="font-semibold text-foreground">{(vehicle.effWh / 10).toFixed(1)}</span> kWh/100km</div>
            <div>AC <span className="font-semibold text-foreground">{vehicle.maxAC}</span> kW</div>
            <div>DC <span className="font-semibold text-foreground">{vehicle.maxDC}</span> kW</div>
            {vehicle.dcChargeMin && (
              <div><span className="font-semibold text-primary">{vehicle.dcChargeMin} dk</span> {vehicle.dcChargeRange} DC</div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/30 pt-1.5">
            <div>Isı Pompası: <span className={`font-semibold ${vehicle.heatPump ? "text-emerald-400" : "text-muted-foreground/60"}`}>{vehicle.heatPump ? "Var" : "Yok"}</span></div>
            <div>Batarya: <span className="font-semibold text-foreground">{vehicle.batteryType}</span></div>
            <div>Batarya Garantisi: <span className="font-semibold text-foreground">{vehicle.warranty}</span></div>
            <div>Cd: <span className="font-semibold text-foreground">{vehicle.cd}</span></div>
          </div>
        </div>

        {/* Charge type */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2">Şarj Tipi</label>
          <div className="flex gap-2">
            {([
              { key: "home" as const, label: `\u{1F3E0} Ev (3.7 kW)` },
              { key: "AC" as const, label: `\u26A1 AC (${vehicle.maxAC} kW)` },
              { key: "DC" as const, label: `\u26A1\u26A1 DC (${vehicle.maxDC} kW)` },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleChargeType(key)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  chargeType === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* SoC inputs */}
        <div className="grid grid-cols-2 gap-4">
          <SliderWithInput
            label="Mevcut Şarj"
            value={currentSoC}
            onChange={setCurrentSoC}
            min={0}
            max={100}
            step={1}
            unit="%"
          />
          <SliderWithInput
            label="Hedef Şarj"
            value={targetSoC}
            onChange={setTargetSoC}
            min={0}
            max={100}
            step={1}
            unit="%"
          />
        </div>

        {/* Price input */}
        <SliderWithInput
          label={priceLabel ? `kWh Fiyatı (${priceLabel})` : "kWh Fiyati"}
          value={pricePerKWh}
          onChange={(v) => { setPricePerKWh(v); setPriceLabel(""); }}
          min={1}
          max={25}
          step={0.01}
          unit="TL"
        />

        {/* Fuel comparison section */}
        <div className="border-t border-border/40 pt-5">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3">Yakıt Karşılaştırma</h3>

          {/* Fuel type toggle */}
          <div className="flex gap-2 mb-4">
            {(["benzin", "motorin"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFuelType(f)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  fuelType === f
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-background border border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "benzin" ? "\u26FD Benzin" : "\u26FD Motorin"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fuel price - auto fetched */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  {fuelType === "benzin" ? "Benzin" : "Motorin"} Fiyati
                </label>
                <span className="text-xs text-primary font-bold tabular-nums">{gasPricePerL.toFixed(2)} TL/L</span>
              </div>
              <div className="text-[10px] text-muted-foreground/50">
                {fuelLoading ? "Yükleniyor..." : "Petrol Ofisi - Istanbul Avrupa"}
              </div>
            </div>

            {/* Consumption per 100km */}
            <SliderWithInput
              label="100 km Tüketim"
              value={gasLPer100km}
              onChange={setGasLPer100km}
              min={3}
              max={15}
              step={0.1}
              unit="L"
            />
          </div>
        </div>

        {/* Results */}
        {result && result.energyNeeded > 0 && (
          <div className="border-t border-border/40 pt-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <ResultItem label="Batarya Şarj Miktarı" value={`${result.energyNeeded} kWh`} />
              <ResultItem
                label="Tahmini Şarj Süresi"
                value={`~${result.chargingMinutes} dk`}
                sub={result.chargingMinutes > 60 ? `(${Math.floor(result.chargingMinutes / 60)} saat ${result.chargingMinutes % 60} dk) ${result.power} kW` : `${result.power} kW`}
              />
              <ResultItem label="Toplam Şarj Maliyeti" value={`${result.totalCost.toFixed(2)} TL`} highlight />
              <ResultItem label="Kazanılan Menzil" value={`~${result.rangeKm} km`} />
              <ResultItem label={`TL/Km (${fuelType === "benzin" ? "Benzin" : "Motorin"})`} value={`${result.gasCostPerKm.toFixed(2)} TL`} />
              <ResultItem label="TL/Km (Elektrik)" value={`${result.costPerKm.toFixed(2)} TL`} />
              <ResultItem
                label={`${fuelType === "benzin" ? "Benzin" : "Motorin"} Maliyeti`}
                value={`${result.gasCost.toFixed(2)} TL`}
                sub={`~${result.rangeKm} km için`}
              />
              <ResultItem label="Elektrik Maliyeti" value={`${result.totalCost.toFixed(2)} TL`} sub={`~${result.rangeKm} km için`} />
            </div>

            {/* Savings banner */}
            {result.savingsPercent > 0 ? (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-center">
                <div className="text-2xl font-extrabold text-emerald-400">%{result.savingsPercent} tasarruf!</div>
                <div className="text-xs text-emerald-400/70 mt-1">
                  ~{result.rangeKm} km menzil icin {fuelType === "benzin" ? "benzinli" : "dizel"} araca göre {(result.gasCost - result.totalCost).toFixed(2)} TL daha ucuz
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 text-center">
                <div className="text-lg font-extrabold text-amber-400">Elektrik daha pahalı</div>
                <div className="text-xs text-amber-400/70 mt-1">
                  ~{result.rangeKm} km menzil icin {fuelType === "benzin" ? "benzinli" : "dizel"} arac {(result.totalCost - result.gasCost).toFixed(2)} TL daha ucuz
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SliderWithInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}) {
  const [textVal, setTextVal] = useState(step < 1 ? value.toFixed(2) : String(value));

  // Sync text when value changes from slider
  useEffect(() => {
    setTextVal(step < 1 ? value.toFixed(2) : String(value));
  }, [value, step]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTextVal(raw);
    if (raw === "" || raw === "." || raw === ",") return;
    const num = parseFloat(raw.replace(",", "."));
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    }
  };

  const handleBlur = () => {
    const num = parseFloat(textVal.replace(",", "."));
    if (isNaN(num)) {
      setTextVal(step < 1 ? value.toFixed(2) : String(value));
    } else {
      const clamped = Math.min(max, Math.max(min, num));
      onChange(clamped);
      setTextVal(step < 1 ? clamped.toFixed(2) : String(clamped));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-muted-foreground">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="text"
            inputMode="decimal"
            value={textVal}
            onChange={handleTextChange}
            onBlur={handleBlur}
            className="w-16 h-7 px-2 rounded-md bg-background border border-border/60 text-xs text-right tabular-nums font-bold text-primary focus:ring-primary/50 focus:border-primary/50 focus:outline-none focus:ring-2"
          />
          <span className="text-[10px] text-muted-foreground">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

function ResultItem({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? "bg-primary/10 border border-primary/30" : "bg-background/50"}`}>
      <div className="text-[10px] text-muted-foreground font-medium">{label}</div>
      <div className={`text-lg font-bold tabular-nums ${highlight ? "text-primary" : ""}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground/50">{sub}</div>}
    </div>
  );
}
