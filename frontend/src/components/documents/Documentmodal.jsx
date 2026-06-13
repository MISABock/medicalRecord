import { useState, useEffect, useMemo, useRef } from "react";
import { apiPost, apiPostForm, API_URL } from "../../api/client";

const PROVIDER_LIST = [
  "Universitätsspital Zürich","Stadtspital Zürich Triemli","Stadtspital Zürich Waid",
  "Universitätsklinik Balgrist","Kinderspital Zürich","Psychiatrische Universitätsklinik Zürich",
  "Klinik Hirslanden","Klinik Im Park","Privatklinik Bethanien","Spital Zollikerberg",
  "Spital Limmattal","Spital Uster","Spital Bülach","Spital Männedorf",
  "See-Spital Horgen","See-Spital Kilchberg","GZO Spital Wetzikon",
  "Kantonsspital Winterthur","Spital Affoltern","Rehaklinik Kilchberg",
  "Permanence Medical Center AG am Hauptbahnhof Zürich","Arzthaus Zürich City",
  "Arzthaus Zürich Stadelhofen","Medipark Ärztezentrum Oerlikon","Medical Center Oerlikon",
  "Medbase Zürich Löwenstrasse - Sports Medical Center","Swiss Medical Center (SMC) Ltd.",
  "Swiss Central Clinic AG","Gesundheitszentrum Hottingen","StockerDocs","MüllerPraxis",
  "Doctor's office Kalkbreite AG","AMC Airport Medical Center AG","med-prime doctors ag",
  "Hausarzt- und Spezialarztpraxis Dr. med. A. Knoflach AG",
  "Hausarzt Zürich – Dr. Harris ROMANOS","Dr. Haluk Aslan",
  "Ärztezentrum Oerlikon","Ärztezentrum Altstetten","Ärztezentrum Wiedikon",
  "Ärztezentrum Seefeld","Ärztezentrum Enge","Ärztezentrum Höngg",
  "Ärztezentrum Schwamendingen","Ärztezentrum Witikon","Ärztezentrum Wollishofen",
  "Ärztezentrum Affoltern","Ärztezentrum Leimbach","Ärztezentrum Sihlcity",
  "Ärztezentrum Zürich Nord","Praxis am Bellevue","Praxis am Central",
  "Praxis am Paradeplatz","Praxis am Bahnhofplatz","Praxis am Limmatplatz",
  "Praxis am Kreuzplatz","Praxis am Milchbuck","Praxis am Rigiplatz",
  "Praxis am Stauffacher","Praxis am Albisriederplatz",
  "Hausarztpraxis Oerlikon","Hausarztpraxis Seefeld","Hausarztpraxis Enge",
  "Hausarztpraxis Altstetten","Hausarztpraxis Wiedikon","Hausarztpraxis Höngg",
  "Hausarztpraxis Schwamendingen","Hausarztpraxis Wipkingen","Hausarztpraxis Fluntern",
  "Hausarztpraxis Hottingen","Kinderarztpraxis Zürich City","Kinderarztpraxis Oerlikon",
  "Kinderarztpraxis Seefeld","Kinderarztpraxis Enge","Kinderarztpraxis Altstetten",
  "Kinderarztpraxis Wiedikon","Frauenpraxis Zürich","Frauenpraxis Bellevue",
  "Frauenpraxis Oerlikon","Frauenpraxis Enge","Dermatologie Zürich City",
  "Dermatologie Bellevue","Dermatologie Seefeld","Augenzentrum Zürich",
  "Augenzentrum Bellevue","Augenarztpraxis Oerlikon","HNO Zentrum Zürich",
  "HNO Praxis Seefeld","Orthopädie Zentrum Zürich","Orthopädie Oerlikon",
  "Urologie Zürich City","Kardiologie Zürich","Neurologie Zürich",
  "Gastroenterologie Zürich","Endokrinologie Zürich","Rheumatologie Zürich",
  "Pneumologie Zürich","Onkologie Zürich","Radiologie Zürich","Schmerzklinik Zürich",
];

const DOC_TYPES = [
  "Blutbild",
  "Bericht",
  "Rezept",
  "Bildgebung",
  "Bericht",
  "Sonstiges",
  "Arztzeugnis"
];

const MED_TYPES = [
  "Abilify 10 mg",
  "Acarbose 100 mg",
  "Acarbose 50 mg",
  "ACC 600 mg",
  "Acemetacin 60 mg",
  "Aciclovir 200 mg",
  "Aciclovir 400 mg",
  "Aclasta Infusion",
  "Activelle",
  "Adalat CC 30 mg",
  "Adalat Retard 20 mg",
  "Adalimumab 40 mg",
  "Adenosin Injektion",
  "Advantan Creme",
  "Aerius 5 mg",
  "Agopton 30 mg",
  "Aknefug Gel",
  "Aknemycin Lösung",
  "Akneroxid 5 Gel",
  "Aldactone 100 mg",
  "Aldactone 25 mg",
  "Aldactone 50 mg",
  "Algifor 400 mg",
  "Algifor Dolo Liquid Caps",
  "Algifor Junior 100 mg",
  "Algifor Junior Sirup",
  "Algifor L 400 mg",
  "Algocrem",
  "Allergodil Augentropfen",
  "Allopurinol 100 mg",
  "Allopurinol 300 mg",
  "Alucol Gel",
  "Amaryl 2 mg",
  "Amaryl 4 mg",
  "Amiodaron 200 mg",
  "Amisulprid 200 mg",
  "Amitriptylin 25 mg",
  "Amitriptylin 50 mg",
  "Amlodipin 10 mg",
  "Amlodipin 2.5 mg",
  "Amlodipin 5 mg",
  "Amoxicillin 1000 mg",
  "Amoxicillin 500 mg",
  "Anafranil 25 mg",
  "Androtop Gel",
  "Angin-Sept Lutschtabletten",
  "Antinaus 10 mg",
  "Antramups 20 mg",
  "Antramups 40 mg",
  "Anxiolit 10 mg",
  "Apidra Solostar",
  "Aprepitant 80 mg",
  "Aprovel 150 mg",
  "Aprovel 300 mg",
  "Arcoxia 60 mg",
  "Arcoxia 90 mg",
  "Aricept 10 mg",
  "Aripiprazol 10 mg",
  "Aripiprazol 15 mg",
  "Arnica Salbe",
  "Aspirin 500 mg",
  "Aspirin Cardio 100 mg",
  "Aspirin Cardio 300 mg",
  "Aspirine 500 mg",
  "Aspégic 1000 mg",
  "Atacand 16 mg",
  "Atacand 8 mg",
  "Atenolol 100 mg",
  "Atenolol 50 mg",
  "Atimos 12 mcg",
  "Atorvastatin 20 mg",
  "Atorvastatin 40 mg",
  "Atorvastatin 80 mg",
  "Atrovent Dosieraerosol",
  "Augmentin 1 g",
  "Augmentin 625 mg",
  "Avalox 400 mg",
  "Avamys Nasenspray",
  "Avodart 0.5 mg",
  "Azilect 1 mg",
  "Azithromycin 500 mg",
  "Bactrim forte",
  "Belara",
  "Beloc ZOK 100 mg",
  "Beloc ZOK 25 mg",
  "Beloc ZOK 50 mg",
  "Bepanthen Plus Creme",
  "Bepanthen Wund- und Heilsalbe",
  "Berocca",
  "Berodual Dosieraerosol",
  "Betmiga 50 mg",
  "Betnovate Creme",
  "Bezafibrat 400 mg",
  "Bilol 10 mg",
  "Bilol 2.5 mg",
  "Bilol 5 mg",
  "Bioflorin Kapseln",
  "Bisolvon 8 mg",
  "Bisolvon Tropfen",
  "Blopress 16 mg",
  "Blopress 32 mg",
  "Blopress 8 mg",
  "Brilique 90 mg",
  "Brintellix 10 mg",
  "Bronchipret Sirup",
  "Brufen 400 mg",
  "Brufen 600 mg",
  "Brufen Retard 800 mg",
  "Buprenorphin Pflaster 35 mcg",
  "Bupropion 150 mg",
  "Burgerstein Calcium",
  "Burgerstein Magnesium",
  "Burgerstein Multivitamin",
  "Buscopan 10 mg",
  "Buspar 10 mg",
  "Buspiron 10 mg",
  "Byetta 10 mcg",
  "Calcimagon D3",
  "Calcimagon D3 Forte",
  "Calcium D3 Sandoz",
  "Calmotussin Sirup",
  "Candesartan 16 mg",
  "Candesartan 8 mg",
  "Carbamazepin 200 mg",
  "Carbimazol 5 mg",
  "Carmenthin",
  "Carvedilol 25 mg",
  "Carvedilol 6.25 mg",
  "Cefalexin 500 mg",
  "Cefpodoxim 200 mg",
  "Cefuroxim 500 mg",
  "Celebrex 200 mg",
  "Celecoxib 100 mg",
  "Celecoxib 200 mg",
  "Cerazette",
  "Cerumenex Ohrentropfen",
  "Cetirizin 10 mg",
  "Cialis 20 mg",
  "Cialis 5 mg",
  "Cinnarizin 25 mg",
  "Cipralex 10 mg",
  "Cipralex 20 mg",
  "Ciproxin 500 mg",
  "Cisaprid 10 mg",
  "Citalopram 20 mg",
  "Citalopram 40 mg",
  "Clarithromycin 500 mg",
  "Clarityn 10 mg",
  "Clexane 40 mg",
  "Clexane 60 mg",
  "Climara 50",
  "Clindamycin 300 mg",
  "Clomifen 50 mg",
  "Clomipramin 25 mg",
  "Clonazepam 0.5 mg",
  "Clopidogrel 75 mg",
  "Clotrimazol Creme",
  "Cloxacillin 500 mg",
  "Clozapin 100 mg",
  "Co-Amoxicillin 1 g",
  "Co-Amoxicillin 625 mg",
  "Co-Aprovel 150/12.5 mg",
  "Co-Codamol 30/500 mg",
  "Co-Dafalgan 500/30 mg",
  "Co-Diovan 160/12.5 mg",
  "Co-Diovan 80/12.5 mg",
  "Co-Micardis 80/12.5 mg",
  "Codein 30 mg",
  "Codicaps Mono",
  "Colchicin 0.5 mg",
  "Combodart 0.5/0.4 mg",
  "Concor 10 mg",
  "Concor 2.5 mg",
  "Concor 5 mg",
  "Condrosulf 400 mg",
  "Condrosulf 800 mg",
  "Cordarone 200 mg",
  "Corvaton 4 mg",
  "Corvaton Retard 8 mg",
  "Coversum 10 mg",
  "Coversum 5 mg",
  "Creon 10000",
  "Creon 25000",
  "Crestor 10 mg",
  "Crestor 20 mg",
  "Crestor 40 mg",
  "Cymbalta 30 mg",
  "Cymbalta 60 mg",
  "Dafalgan 1 g",
  "Dafalgan 500 mg",
  "Dafalgan Kindersaft",
  "Dafalgan ODIS 500 mg",
  "Dafalgan Sirup",
  "Dafalgan Zäpfchen 250 mg",
  "Daflon 500 mg",
  "Daktarin Creme",
  "Dalacin 300 mg",
  "Dapagliflozin 10 mg",
  "Decristol 20000 IE",
  "Depakine 500 mg",
  "Dermovate Salbe",
  "Deroxat 20 mg",
  "Detrusitol 2 mg",
  "Dexamethason 4 mg",
  "Diamicron MR 30 mg",
  "Diamox 250 mg",
  "Diazepam 10 mg",
  "Diazepam 5 mg",
  "Diclac 50 mg",
  "Diclofenac 100 mg Retard",
  "Diclofenac 50 mg",
  "Diclofenac 75 mg",
  "Diclofenac Sandoz 100 mg Retard",
  "Diclofenac Spray Gel",
  "Differin Gel",
  "Diflucan 150 mg",
  "Digoxin 0.25 mg",
  "Dilatrend 25 mg",
  "Dimenhydrinat 50 mg",
  "Diovan 160 mg",
  "Diovan 320 mg",
  "Diovan 80 mg",
  "Diprosalic Salbe",
  "Distraneurin 192 mg",
  "Donepezil 10 mg",
  "Dormicum 7.5 mg",
  "Doxycyclin 100 mg",
  "Dulcolax 5 mg",
  "Duloxetin 30 mg",
  "Duloxetin 60 mg",
  "Duphaston 10 mg",
  "Durogesic 25 mcg",
  "Durogesic 50 mcg",
  "Ebixa 20 mg",
  "Echinacin",
  "Echinaforce Tropfen",
  "Efexor ER 150 mg",
  "Efexor ER 75 mg",
  "Efient 10 mg",
  "Eisen Sandoz Sirup",
  "Eisensulfat 100 mg",
  "Eliquis 2.5 mg",
  "Eliquis 5 mg",
  "Elocom Salbe",
  "Eltroxin 0.05 mg",
  "Eltroxin 0.075 mg",
  "Eltroxin 0.1 mg",
  "Emend 80 mg",
  "Enalapril 10 mg",
  "Enalapril 20 mg",
  "Enalapril 5 mg",
  "Encepur Impfstoff",
  "Esberitox",
  "Escitalopram 10 mg",
  "Escitalopram 20 mg",
  "Esidrex 25 mg",
  "Esomeprazol 20 mg",
  "Esomeprazol 40 mg",
  "Estraderm TTS 50",
  "Etoricoxib 60 mg",
  "Etoricoxib 90 mg",
  "Eucreas 50/1000 mg",
  "Euthyrox 100 mcg",
  "Euthyrox 125 mcg",
  "Euthyrox 150 mcg",
  "Euthyrox 50 mcg",
  "Euthyrox 75 mcg",
  "Excedrin",
  "Excipial U Lipolotio",
  "Exelon 4.6 mg Pflaster",
  "Exforge 10/160 mg",
  "Exforge 5/80 mg",
  "Exforge HCT 10/160/12.5 mg",
  "Ezetrol 10 mg",
  "Famciclovir 500 mg",
  "Felden 20 mg",
  "Femoston 1/10",
  "Fenistil Gel",
  "Fenofibrat 200 mg",
  "Fentanyl Pflaster 25 mcg",
  "Fentanyl Pflaster 50 mcg",
  "Ferinject Infusion",
  "Festal",
  "Fexofenadin 120 mg",
  "Filgrastim Injektion",
  "Finasterid 5 mg",
  "Flagyl 500 mg",
  "Flector 25 mg",
  "Flector Pflaster",
  "Floxal Augentropfen",
  "Floxapen 500 mg",
  "Fluconazol 150 mg",
  "Fluctine 20 mg",
  "Fluimucil 600 mg",
  "Fluoxetin 20 mg",
  "Fluvastatin 40 mg",
  "Folsäure 5 mg",
  "Folvite 5 mg",
  "Foradil 12 mcg",
  "Forsteo 20 mcg",
  "Forxiga 10 mg",
  "Fosamax 70 mg",
  "Fosfomycin 3 g",
  "Fragmin 5000 IE",
  "Fraxiparine 0.4 ml",
  "Fucicort Creme",
  "Fucidin Creme",
  "Furadantin 100 mg",
  "Furosemid 40 mg",
  "Furosemid 500 mg",
  "Gabapentin 100 mg",
  "Gabapentin 300 mg",
  "Gabapentin 400 mg",
  "Galvumet 50/1000 mg",
  "Galvus 50 mg",
  "Gaviscon Kautabletten",
  "Gaviscon Suspension",
  "Genotropin Pen",
  "Gliclazid 30 mg",
  "Glimepirid 1 mg",
  "Glimepirid 2 mg",
  "Glimepirid 4 mg",
  "Glucophage 1000 mg",
  "Glucophage 500 mg",
  "Glucophage 850 mg",
  "Granisetron 1 mg",
  "Grippostad C",
  "Halcion 0.25 mg",
  "Haldol 5 mg",
  "Haloperidol 5 mg",
  "Havrix 1440",
  "Helicobacter-Therapie Kombi",
  "Heparin Injektion",
  "Hirudoid Salbe",
  "Humalog Kwikpen",
  "Humira 40 mg",
  "Hydrochlorothiazid 25 mg",
  "Hydrocortison 10 mg",
  "Hylo-Comod Augentropfen",
  "Iberogast Tinktur",
  "Ibuprofen 200 mg",
  "Ibuprofen 400 mg",
  "Ibuprofen 600 mg",
  "Ibuprofen 800 mg",
  "Ibuprofen Gel 5%",
  "Ibuprofen Lysin 400 mg",
  "Ibuprofen Spray",
  "Imigran 50 mg",
  "Imodium 2 mg",
  "Imovane 7.5 mg",
  "Importal Pulver",
  "Indapamid 1.5 mg",
  "Inderal 10 mg",
  "Inderal 40 mg",
  "Inderal 80 mg",
  "Inderal Retard 80 mg",
  "Inderal Retard 120 mg",
  "Inderal Retard 160 mg",
  "Indometacin 25 mg",
  "Indometacin 50 mg",
  "Inegy 10/20 mg",
  "Insulatard Flexpen",
  "Invega 6 mg",
  "Irbesartan 150 mg",
  "Irbesartan 300 mg",
  "Irfen 400 mg",
  "Irfen 600 mg",
  "Irfen Dolo 200 mg",
  "Isoket 20 mg Retard",
  "Itinerol B6",
  "Itraconazol 100 mg",
  "Janumet 50/1000 mg",
  "Januvia 100 mg",
  "Jardiance 10 mg",
  "Jardiance 25 mg",
  "Kalium Durules 1 g",
  "Kalium Effervetten 1 g",
  "Kayexalate",
  "Kenacort 40 mg Injektion",
  "Keppra 500 mg",
  "Ketoconazol Creme",
  "Ketoprofen 100 mg",
  "Klacid 500 mg",
  "Klacid Uno 500 mg",
  "Lacrycon Augentropfen",
  "Lactulose Sirup",
  "Lamictal 100 mg",
  "Lamisil 250 mg",
  "Lamotrigin 100 mg",
  "Lanitop 0.1 mg",
  "Lansoprazol 30 mg",
  "Lantus Solostar",
  "Lasix 40 mg",
  "Latuda 40 mg",
  "Laxoberon Tropfen",
  "Leponex 25 mg",
  "Lercanidipin 10 mg",
  "Lercanidipin 20 mg",
  "Lescol XL 80 mg",
  "Levemir Flexpen",
  "Levetiracetam 500 mg",
  "Levocetirizin 5 mg",
  "Levodopa/Carbidopa 100/25 mg",
  "Levofloxacin 500 mg",
  "Lexotanil 1.5 mg",
  "Lexotanil 3 mg",
  "Linezolid 600 mg",
  "Linola Fett Creme",
  "Lipanthyl 200 mg",
  "Lisinopril 10 mg",
  "Lisinopril 20 mg",
  "Lithiofor 400 mg",
  "Locoid Creme",
  "Lodoz 2.5/6.25 mg",
  "Lodoz 5/12.5 mg",
  "Lomudal Augentropfen",
  "Loperamid 2 mg",
  "Loperamid Sandoz 2 mg",
  "Loratadin 10 mg",
  "Losartan 100 mg",
  "Losartan 50 mg",
  "Lyrica 150 mg",
  "Lyrica 300 mg",
  "Lyrica 75 mg",
  "Maaloxan Kautabletten",
  "Macrogol 13.7 g",
  "Madopar 125 mg",
  "Madopar 250 mg",
  "Magnesiocard 10 mmol",
  "Magnesium 5 Sulfat",
  "Magnesium Diasporal 300 mg",
  "Makatussin Tropfen",
  "Maltofer Kautabletten",
  "Marcoumar 3 mg",
  "Maxalt 10 mg",
  "Maxim",
  "Meditonsin Tropfen",
  "Mefenacid 250 mg",
  "Mefenacid 500 mg",
  "Mefenacid Junior 250 mg",
  "Meloxicam 15 mg",
  "Memantin 20 mg",
  "Mephadolor 500 mg",
  "Mercilon",
  "Metamizol 500 mg",
  "Metformin 1000 mg",
  "Metformin 500 mg",
  "Metformin 850 mg",
  "Methotrexat 10 mg",
  "Methotrexat 2.5 mg",
  "Metoclopramid 10 mg",
  "Metoprolol 100 mg",
  "Metoprolol 50 mg",
  "Metronidazol 500 mg",
  "Mezym Forte",
  "Micardis 80 mg",
  "Microgynon",
  "Midazolam 7.5 mg",
  "Migräne-Kranit",
  "Migränerton",
  "Mirena Spirale",
  "Mirtazapin 15 mg",
  "Mirtazapin 30 mg",
  "Mixtard 30 Flexpen",
  "Mobicox 15 mg",
  "Mobilat Creme",
  "Montelukast 10 mg",
  "Montelukast 4 mg",
  "Monuril 3 g",
  "Morphin 10 mg",
  "Morphin 30 mg Retard",
  "Motilium 10 mg",
  "Motilium Lingual 10 mg",
  "Movicol Pulver",
  "Moxifloxacin 400 mg",
  "MST Continus 30 mg",
  "Mucosolvan Retardkapseln 75 mg",
  "Mucosolvan Sirup",
  "Multivitamin Pharmaton",
  "Mycostatin Suspension",
  "NAC 600 mg",
  "Naproxen 250 mg",
  "Naproxen 500 mg",
  "Naramig 2.5 mg",
  "Nasonex Nasenspray",
  "Nebido Injektion",
  "Nebilet 5 mg",
  "Neo-Angin",
  "Neo-Mercazole 5 mg",
  "Neocitran Grippe",
  "Neupogen Injektion",
  "Neurontin 300 mg",
  "Nexium 20 mg",
  "Nexium 40 mg",
  "Nitrofurantoin 100 mg",
  "Nitroglycerin Spray",
  "Nitrolingual Spray",
  "Norfloxacin 400 mg",
  "Normacol Granulat",
  "Norvasc 10 mg",
  "Norvasc 5 mg",
  "Novalgin 500 mg",
  "Novalgin Tropfen",
  "Novorapid Flexpen",
  "Nuvaring",
  "Nystatin Suspension",
  "Oftaquix Augentropfen",
  "Olfen 100 mg Retard",
  "Olfen 50 mg",
  "Olfen Gel",
  "Olfen Lactab 75 mg",
  "Olfen Patch 140 mg",
  "Olmetec 20 mg",
  "Olmetec 40 mg",
  "Olynth Nasenspray",
  "Omega-3 1000 mg",
  "Omeprazol 20 mg",
  "Omeprazol 40 mg",
  "Onbrez 150 mcg",
  "Ondansetron 4 mg",
  "Ondansetron 8 mg",
  "Opatanol Augentropfen",
  "Otalgan Ohrentropfen",
  "Otipax Ohrentropfen",
  "Otrivin Nasenspray",
  "Oxycontin 10 mg",
  "Oxycontin 20 mg",
  "Ozempic 0.5 mg",
  "Ozempic 1 mg",
  "Padma 28",
  "Palexia 100 mg",
  "Palexia 50 mg",
  "Paliperidon 6 mg",
  "Palladon 4 mg",
  "Panadol 500 mg",
  "Panadol Extra",
  "Pankreon 10000",
  "Pantoprazol 20 mg",
  "Pantoprazol 40 mg",
  "Pantozol 20 mg",
  "Pantozol 40 mg",
  "Paracetamol 1 g",
  "Paracetamol 500 mg",
  "Paracetamol Zäpfchen 125 mg",
  "Paroxetin 20 mg",
  "Paspertin Tropfen",
  "Penicillin V 1 Mio IE",
  "Pepcid 20 mg",
  "Perenterol 250 mg",
  "Perenterol Forte 250 mg",
  "Perindopril 4 mg",
  "Perindopril 8 mg",
  "Pertussin Sirup",
  "Pevaryl Creme",
  "Phenytoin 100 mg",
  "Piroxicam 20 mg",
  "Plavix 75 mg",
  "Ponstan 250 mg",
  "Ponstan 500 mg",
  "Pradaxa 110 mg",
  "Pradaxa 150 mg",
  "Pradif T 0.4 mg",
  "Praluent 75 mg",
  "Prasugrel 10 mg",
  "Pravastatin 20 mg",
  "Pravastatin 40 mg",
  "Prednisolon 20 mg",
  "Prednisolon 5 mg",
  "Prednison 20 mg",
  "Prednison 5 mg",
  "Pregabalin 100 mg",
  "Pregabalin 25 mg",
  "Pregabalin 50 mg",
  "Pretuval C",
  "Primperan 10 mg",
  "Primperan Zäpfchen",
  "Procoralan 5 mg",
  "Procoralan 7.5 mg",
  "Prolia 60 mg Injektion",
  "Propylthiouracil 50 mg",
  "Proscar 5 mg",
  "Prospan Sirup",
  "Provera 10 mg",
  "Pulmicort 200 mcg",
  "Pulmofor Sirup",
  "Pylera Kombipack",
  "Qlaira",
  "Quetiapin 100 mg",
  "Quetiapin 200 mg",
  "Quetiapin 25 mg",
  "Ramipril 10 mg",
  "Ramipril 2.5 mg",
  "Ramipril 5 mg",
  "Ranexa 500 mg",
  "Ranitidin 150 mg",
  "Ranitidin 300 mg",
  "Rasagilin 1 mg",
  "Redoxon Vitamin C",
  "Refresh Augentropfen",
  "Reisetabletten Vomex",
  "Remeron 30 mg",
  "Remeron Soltab 30 mg",
  "Reniten 10 mg",
  "Reniten 20 mg",
  "Reniten 5 mg",
  "Rennie Kautabletten",
  "Repatha 140 mg",
  "Requip Modutab 4 mg",
  "Resolor 2 mg",
  "Resonium A Pulver",
  "Rhinomer Nasenspray",
  "Rifaximin 200 mg",
  "Riopan Gel",
  "Risperdal 1 mg",
  "Rivastigmin Pflaster 9.5 mg",
  "Rivotril 0.5 mg",
  "Rivotril 2 mg",
  "Rizatriptan 10 mg",
  "Rocephin 1 g Injektion",
  "Ropinirol 2 mg",
  "Rosuvastatin 10 mg",
  "Rosuvastatin 20 mg",
  "Rybelsus 14 mg",
  "Rybelsus 7 mg",
  "Saroten 25 mg",
  "Selexid 200 mg",
  "Selipran 20 mg",
  "Seresta 15 mg",
  "Seresta 50 mg",
  "Seretide 25/250 mcg",
  "Seretide Diskus 50/250 mcg",
  "Seropram 20 mg",
  "Seroquel 25 mg",
  "Seroquel XR 50 mg",
  "Sertralin 100 mg",
  "Sertralin 50 mg",
  "Sevredol 10 mg",
  "Sildenafil 50 mg",
  "Simvastatin 20 mg",
  "Simvastatin 40 mg",
  "Sinecod Sirup",
  "Sinecod Tropfen",
  "Sinemet 110 mg",
  "Singulair 10 mg",
  "Sintrom 4 mg",
  "Sinupret Forte",
  "Sitagliptin 100 mg",
  "Solian 200 mg",
  "Solmucol 600 mg",
  "Solu-Cortef Injektion",
  "Soolantra Creme",
  "Sortis 20 mg",
  "Sortis 40 mg",
  "Sortis 80 mg",
  "Sotalol 80 mg",
  "Spalt Forte",
  "Spalt Tabletten",
  "Spasmo-Urgenin Neo",
  "Spasmo-Urogenin",
  "Spiricort 20 mg",
  "Spiricort 5 mg",
  "Spiriva Handihaler 18 mcg",
  "Spiriva Respimat",
  "Spironolacton 25 mg",
  "Spironolacton 50 mg",
  "Sporanox 100 mg",
  "Stamaril Impfstoff",
  "Stilnox 10 mg",
  "Stugeron 25 mg",
  "Sulfamethoxazol/Trimethoprim 800/160 mg",
  "Sumatriptan 100 mg",
  "Sumatriptan 50 mg",
  "Supradyn Energy",
  "Symbicort 160/4.5 mcg",
  "Symbicort 200/6 mcg",
  "Symbicort Turbuhaler 200/6 mcg",
  "Systane Augentropfen",
  "Tadalafil 20 mg",
  "Tadalafil 5 mg",
  "Tamiflu 75 mg",
  "Tamiflu 75 mg Kapseln",
  "Tamsulosin 0.4 mg",
  "Tantum Verde Lösung",
  "Targin 10/5 mg",
  "Targin 20/10 mg",
  "Targin 5/2.5 mg",
  "Tavanic 500 mg",
  "Tavegyl 1 mg",
  "Tegretol 200 mg",
  "Tegretol CR 400 mg",
  "Telfast 120 mg",
  "Telfast 180 mg",
  "Telmisartan 40 mg",
  "Telmisartan 80 mg",
  "Temesta 1 mg",
  "Temesta 2.5 mg",
  "Tenormin 50 mg",
  "Terbinafin 250 mg",
  "Testogel 50 mg",
  "Theraflu",
  "Thyrozol 10 mg",
  "Thyrozol 5 mg",
  "Ticagrelor 90 mg",
  "Tilidin 50 mg",
  "Tilidin Tropfen",
  "Timolol Augentropfen",
  "Tirosint 100 mcg",
  "Tobradex Augentropfen",
  "Tobrex Augentropfen",
  "Topiramat 100 mg",
  "Topiramat 50 mg",
  "Toplexil Sirup",
  "Torasemid 10 mg",
  "Torasemid 20 mg",
  "Torasemid 5 mg",
  "Toviaz 4 mg",
  "Toviaz 8 mg",
  "Trajenta 5 mg",
  "Tramadol 100 mg",
  "Tramadol 50 mg",
  "Tramadol Tropfen",
  "Transipeg Forte",
  "Traumeel Salbe",
  "Tresiba Flexpen",
  "Treupel Gegen Migräne",
  "Triamcort Creme",
  "Triatec 10 mg",
  "Triatec 2.5 mg",
  "Triatec 5 mg",
  "Triofan Erkältungsbad",
  "Triofan Nasenspray",
  "Triomer Nasenspray",
  "Trittico 100 mg",
  "Trulicity 1.5 mg",
  "Tussamag Hustensirup",
  "Twinrix Impfstoff",
  "Tyrosur Gel",
  "Ulcogant 1 g",
  "Utrogestan 100 mg",
  "Utrogestan 200 mg",
  "Uvamin Retard 100 mg",
  "Vagifem 10 mcg",
  "Valaciclovir 500 mg",
  "Valium 10 mg",
  "Valium 5 mg",
  "Valproat 500 mg",
  "Valsartan 160 mg",
  "Valsartan 320 mg",
  "Valsartan 80 mg",
  "Valtrex 500 mg",
  "Vancomycin 500 mg",
  "Vaseline",
  "Venlafaxin 75 mg",
  "Ventolin Dosieraerosol",
  "Vesicare 5 mg",
  "Viagra 100 mg",
  "Viagra 50 mg",
  "Vibramycin 100 mg",
  "Vibrocil Nasenspray",
  "Vicks VapoRub",
  "Victoza 6 mg/ml",
  "Vigamox Augentropfen",
  "Vildagliptin 50 mg",
  "Vitamin B Komplex",
  "Vitamin B12 1000 mcg",
  "Vitamin C 1000 mg",
  "Vitamin D3 Streuli",
  "Vitamin E 400 IE",
  "Voltaren 50 mg",
  "Voltaren Dolo 25 mg",
  "Voltaren Dolo Extra 25 mg",
  "Voltaren Gel",
  "Voltaren Rapid 50 mg",
  "Voltaren Schmerzgel Forte",
  "Vomex A 50 mg",
  "Vortioxetin 10 mg",
  "Wellbutrin XR 150 mg",
  "Xalatan Augentropfen",
  "Xanax 0.25 mg",
  "Xanax 0.5 mg",
  "Xarelto 10 mg",
  "Xarelto 15 mg",
  "Xarelto 20 mg",
  "Xifaxan 550 mg",
  "Xipamid 20 mg",
  "Xyzal 5 mg",
  "Xyzal Tropfen",
  "Yasmin",
  "Zaldiar 37.5/325 mg",
  "Zanidip 10 mg",
  "Zanidip 20 mg",
  "Zantic 150 mg",
  "Zentramin Bayer",
  "Zinksalbe",
  "Zithromax 500 mg",
  "Zofran 4 mg",
  "Zofran Schmelztabletten 8 mg",
  "Zolpidem 10 mg",
  "Zomig 2.5 mg",
  "Zopiclon 7.5 mg",
  "Zovirax 200 mg",
  "Zovirax Creme",
  "Zyloric 300 mg",
  "Zyprexa 10 mg",
  "Zyprexa 5 mg",
  "Zyrtec 10 mg"
];

export default function DocumentModal({
  isOpen,
  onClose,
  doc = null,
  providers = [],
  onSave,
  mode = "edit"
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [fileViewerUrl, setFileViewerUrl] = useState(null);
  const [fileViewerType, setFileViewerType] = useState(null);
  const [replaceFile, setReplaceFile] = useState(null);

  // Felder für neues/bearbeitetes Dokument
  const [title, setTitle] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [medication, setMedication] = useState("");
  const [file, setFile] = useState(null);
  const [providerCustom, setProviderCustom] = useState("");
  const [providerSuggestOpen, setProviderSuggestOpen] = useState(false);

  const providerSuggestions = useMemo(() => {
    const q = providerCustom.trim().toLowerCase();
    if (!q) return [];
    return PROVIDER_LIST.filter((p) => p.toLowerCase().includes(q)).slice(0, 8);
  }, [providerCustom]);
  
  // Für das Medikamenten-Dropdown
  const [searchTerm, setSearchTerm] = useState("");
  const [isMedDropdownOpen, setIsMedDropdownOpen] = useState(false);

  // Gefilterte Medikamente
  const filteredMeds = MED_TYPES.filter(med => 
    med.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initialisiere Felder wenn Modal geöffnet wird
  useEffect(() => {
    if (!isOpen) return;

    // edit mode starts read-only; new + medication start in editing mode
    setIsEditing(mode !== "edit");

    if (mode === "new") {
      setTitle("");
      setServiceDate("");
      setDocType(DOC_TYPES[0]);
      setMedication("");
      setFile(null);
      setProviderCustom("");
    } else if (mode === "edit" && doc) {
      setTitle(doc.title || "");
      setServiceDate((doc.serviceDate || "").slice(0, 10));
      setDocType(doc.docType || DOC_TYPES[0]);
      setMedication(doc.medication || "");
      setProviderCustom(doc.provider || "");
      setReplaceFile(null);
    } else if (mode === "medication" && doc) {
      setMedication(doc.medication || "");
    }
  }, [isOpen, mode, doc, providers]);

  // Schließe Dropdown bei Click außerhalb
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMedDropdownOpen && !e.target.closest('.medication-dropdown-wrapper')) {
        setIsMedDropdownOpen(false);
        setSearchTerm("");
      }
    };

    if (isMedDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMedDropdownOpen]);

  const handleSave = async (e) => {
    e?.preventDefault();

    const providerValue =
      providerCustom.trim();

    // Validierung für "new" und "edit" Modi
    if (mode === "new" || mode === "edit") {
      if (!title.trim() || !serviceDate || !providerValue || !docType) {
        alert("Bitte alle Pflichtfelder ausfuellen.");
        return;
      }
    }

    // Validierung für "medication" Modus
    if (mode === "medication") {
      if (!medication.trim()) {
        alert("Bitte Medikament eingeben.");
        return;
      }
    }

    try {
      if (mode === "new") {
        // Neues Dokument erstellen
        if (!file) {
          alert("Bitte eine Datei auswaehlen.");
          return;
        }

        const form = new FormData();
        form.append("upload", file);
        const uploaded = await apiPostForm("/documents/files", form);

        const payload = {
          title: title.trim(),
          service_date: serviceDate,
          provider: providerValue,
          medication: docType === "Rezept" ? medication.trim() : null,
          doc_type: docType,
          file_id: uploaded.id,
        };

        const created = await apiPost("/documents", payload);

        const mapped = {
          id: created.id,
          title: created.title,
          serviceDate: created.service_date,
          provider: created.provider,
          medication: created.medication,
          docType: created.doc_type,
          fileId: created.file_id,
        };

        onSave(mapped, "new");
        onClose();

      } else if (mode === "edit" && doc?.id) {
        // Optional: replace file
        let newFileId = undefined;
        if (replaceFile) {
          const form = new FormData();
          form.append("upload", replaceFile);
          const uploaded = await apiPostForm("/documents/files", form);
          newFileId = uploaded.id;
        }

        const payload = {
          title: title.trim(),
          service_date: serviceDate,
          provider: providerValue,
          doc_type: docType,
          medication: docType === "Rezept" ? medication.trim() : null,
          ...(newFileId ? { file_id: newFileId } : {}),
        };

        const updated = await apiPost(`/documents/${doc.id}/update`, payload);

        const mapped = {
          id: updated.id,
          title: updated.title,
          serviceDate: updated.service_date,
          provider: updated.provider,
          docType: updated.doc_type,
          medication: updated.medication,
          fileId: updated.file_id,
        };

        onSave(mapped, "edit");
        alert("Gespeichert.");

      } else if (mode === "medication" && doc?.id) {
        // Nur Medikament bearbeiten
        const payload = {
          title: doc.title,
          service_date: (doc.serviceDate || "").slice(0, 10),
          provider: doc.provider,
          doc_type: doc.docType,
          medication: medication.trim(),
        };

        const updated = await apiPost(`/documents/${doc.id}/update`, payload);

        const mapped = {
          id: updated.id,
          title: updated.title,
          serviceDate: updated.service_date,
          provider: updated.provider,
          docType: updated.doc_type,
          medication: updated.medication,
          fileId: updated.file_id,
        };

        onSave(mapped, "medication");
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern.");
    }
  };

  const handleDelete = async () => {
    if (!doc?.id) return;

    const ok = window.confirm(
      "Willst du dieses Dokument wirklich löschen? Die Datei wird ebenfalls entfernt."
    );

    if (!ok) return;

    try {
      await apiPost(`/documents/${doc.id}/delete`);
      onSave(doc, "delete");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Fehler beim Löschen des Dokuments.");
    }
  };

  const openFile = async () => {
    if (!doc?.id) return;
    const token = localStorage.getItem("token");
    const url = `${API_URL}/documents/${doc.id}/file?token=${encodeURIComponent(token || "")}`;
    window.history.pushState({ fileViewer: true }, "");
    setFileViewerUrl(url);
    try {
      const res = await fetch(url, { method: "HEAD" });
      setFileViewerType(res.headers.get("content-type") || "");
    } catch {
      setFileViewerType("");
    }
  };

  const closeViewer = () => {
    window.history.back();
  };

  const fileViewerUrlRef = useRef(null);
  useEffect(() => { fileViewerUrlRef.current = fileViewerUrl; }, [fileViewerUrl]);

  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // Push state when modal opens; combined handler: back closes file viewer first, then modal
  useEffect(() => {
    if (!isOpen) return;
    window.history.pushState({ modal: true }, "");
    const handlePop = () => {
      if (fileViewerUrlRef.current) {
        setFileViewerUrl(null);
        setFileViewerType(null);
      } else {
        onCloseRef.current();
      }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [isOpen]);

  if (!isOpen) return null;

  const modalTitle =
    mode === "new"
      ? "Neuen Bericht erfassen"
      : mode === "medication"
      ? "Medikament bearbeiten"
      : isEditing
      ? "Dokument bearbeiten"
      : "Dokument";

  return (
    <>
    <div className="docsModalBackdrop" onMouseDown={onClose}>
      <div className="docsModal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="docsModalHeader">
          <div className="docsModalTitle">{modalTitle}</div>
          <button className="docsModalClose" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        {/* Read-only view for existing docs */}
        {mode === "edit" && !isEditing && doc && (() => {
          const DOC_COLORS = {
            Blutbild:    { accent: "#15803d", bg: "#dcfce7" },
            Bericht:     { accent: "#1d4ed8", bg: "#dbeafe" },
            Rezept:      { accent: "#b45309", bg: "#fef3c7" },
            Bildgebung:  { accent: "#6d28d9", bg: "#ede9fe" },
            Arztzeugnis: { accent: "#0f766e", bg: "#ccfbf1" },
            Sonstiges:   { accent: "#475569", bg: "#f1f5f9" },
          };
          const c = DOC_COLORS[doc.docType] ?? DOC_COLORS.Sonstiges;
          return (
            <div className="docsReadView">
              {/* Title block */}
              <div className="docsReadTop">
                <div className="docsReadTopLeft" style={{ borderLeft: `4px solid ${c.accent}` }}>
                  <span className="docsReadBadge" style={{ background: c.bg, color: c.accent }}>
                    {doc.docType || "Sonstiges"}
                  </span>
                  <div className="docsReadHeroTitle">{doc.title || "—"}</div>
                </div>
                {doc.fileId && (
                  <button className="docsReadFileBtn" type="button" onClick={openFile}
                    style={{ borderColor: c.accent, color: c.accent }}>
                    Öffnen
                  </button>
                )}
              </div>

              {/* Info grid */}
              <div className="docsReadBody">
                <div className="docsReadRow">
                  <span className="docsReadKey">Datum</span>
                  <span className="docsReadVal">
                    {doc.serviceDate ? new Date(doc.serviceDate).toLocaleDateString("de-CH") : "—"}
                  </span>
                </div>
                <div className="docsReadRow">
                  <span className="docsReadKey">Arzt / Praxis</span>
                  <span className="docsReadVal">{doc.provider || "—"}</span>
                </div>
                {doc.docType === "Rezept" && doc.medication && (
                  <div className="docsReadRow">
                    <span className="docsReadKey">Medikament</span>
                    <span className="docsReadVal">{doc.medication}</span>
                  </div>
                )}
                {!doc.fileId && (
                  <div className="docsReadRow">
                    <span className="docsReadKey">Anhang</span>
                    <span className="docsReadVal docsReadNoFile">Kein Anhang vorhanden</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="docsReadActions">
                <button className="docsDanger" type="button" onClick={handleDelete}>
                  Löschen
                </button>
                <div className="docsModalActionsRight">
                  <button className="docsSecondary" type="button" onClick={onClose}>
                    Schliessen
                  </button>
                  <button className="docsPrimary" type="button"
                    style={{ background: c.accent }}
                    onClick={() => setIsEditing(true)}>
                    Bearbeiten
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {mode === "medication" ? (
          // Nur Medikament bearbeiten
          <div className="docsModalForm">
            <label className="docsLabel">
              Medikament
              <input
                className="docsInput"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                placeholder="z.B. Ibuprofen 400 mg"
                required
              />
            </label>

            <div className="docsModalActions">
              <button className="docsSecondary" type="button" onClick={onClose}>
                Abbrechen
              </button>
              <button className="docsPrimary" type="button" onClick={handleSave}>
                Speichern
              </button>
            </div>
          </div>
        ) : (mode === "new" || isEditing) ? (
          // Neues Dokument oder Bearbeiten
          <form className="docsModalForm" onSubmit={handleSave}>
            <div className="docsHint">
              {mode === "new" ? "Trage die Felder ein" : "Bearbeite die Felder und speichere."}
            </div>

            <label className="docsLabel">
              Titel
              <input
                className="docsInput"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. MRI Knie"
                required
              />
            </label>

            <label className="docsLabel">
              Datum der Untersuchung
              <input
                className="docsInput"
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                required
              />
            </label>

            <div className="docsLabel">
              <div>Arzt / Einrichtung</div>
              <div className="providerAutoWrap">
                <input
                  className="docsInput"
                  value={providerCustom}
                  onChange={(e) => {
                    setProviderCustom(e.target.value);
                    setProviderSuggestOpen(true);
                  }}
                  onFocus={() => setProviderSuggestOpen(true)}
                  onBlur={() => setTimeout(() => setProviderSuggestOpen(false), 150)}
                  placeholder="Einrichtung suchen oder frei eingeben…"
                  autoComplete="off"
                  required
                />
                {providerSuggestOpen && providerSuggestions.length > 0 && (
                  <div className="providerSuggestList">
                    {providerSuggestions.map((p) => (
                      <div
                        key={p}
                        className="providerSuggestItem"
                        onMouseDown={() => {
                          setProviderCustom(p);
                          setProviderSuggestOpen(false);
                        }}
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <label className="docsLabel">
              Dokumenttyp
              <select
                className="docsSelect"
                value={docType}
                onChange={(e) => {
                  const v = e.target.value;
                  setDocType(v);
                  if (v !== "Rezept") setMedication("");
                }}
                required
              >
                {DOC_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            {docType === "Rezept" && (
              <div className="docsLabel medication-dropdown-wrapper" style={{ position: 'relative' }}>
                <div>Medikament</div>

                <div
                  className="docsSelect medDropdownTrigger"
                  onClick={() => setIsMedDropdownOpen(!isMedDropdownOpen)}
                >
                  {medication || "Medikament wählen..."}
                </div>

                {isMedDropdownOpen && (
                  <div className="medDropdownMenu">
                    <input
                      className="medDropdownSearch"
                      type="text"
                      placeholder="Suchen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                    />
                    <div className="medDropdownList">
                      {filteredMeds.map((med) => (
                        <div
                          key={med}
                          className="medDropdownItem"
                          onClick={() => {
                            setMedication(med);
                            setIsMedDropdownOpen(false);
                            setSearchTerm("");
                          }}
                        >
                          {med}
                        </div>
                      ))}
                      {filteredMeds.length === 0 && (
                        <div className="medDropdownEmpty">Kein Treffer</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="docsLabel">
              <div>Anhang</div>
              {mode === "new" ? (
                <>
                  <input
                    className="docsInput"
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file && (
                    <div className="docsFileSelected">{file.name}</div>
                  )}
                </>
              ) : (
                <>
                  {doc?.fileId ? (
                    <div className="docsFileCard">
                      <div className="docsFileCardInfo">
                        <div className="docsFileCardName">{doc.title}</div>
                        <div className="docsFileCardSub">{doc.docType} · {doc.provider}</div>
                      </div>
                      <button className="docsOpen" type="button" onClick={openFile}>
                        Öffnen
                      </button>
                    </div>
                  ) : (
                    <div className="docsNoFile">Keine Datei vorhanden</div>
                  )}
                  <label className="docsReplaceLabel">
                    {doc?.fileId ? "Datei ersetzen (optional)" : "Datei hochladen"}
                    <input
                      className="docsInput"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  {replaceFile && (
                    <div className="docsFileSelected">Neue Datei: {replaceFile.name}</div>
                  )}
                </>
              )}
            </div>

            {mode === "edit" ? (
              <div className="docsModalActions docsModalActionsBetween">
                <button className="docsDanger" type="button" onClick={handleDelete}>
                  Löschen
                </button>

                <div className="docsModalActionsRight">
                  <button className="docsSecondary" type="button" onClick={onClose}>
                    Abbrechen
                  </button>
                  <button className="docsPrimary" type="submit">
                    Speichern
                  </button>
                </div>
              </div>
            ) : (
              <div className="docsModalActions">
                <button className="docsSecondary" type="button" onClick={onClose}>
                  Abbrechen
                </button>
                <button className="docsPrimary" type="submit">
                  Speichern
                </button>
              </div>
            )}

            {mode === "new" && (
              <div className="docsFileNote">Drücke auf Speichern</div>
            )}
          </form>
        ) : null}
      </div>
    </div>

    {/* Inline file viewer */}
    {fileViewerUrl && (
      <div className="fileViewerOverlay" onClick={closeViewer}>
        <div className="fileViewerBox" onClick={(e) => e.stopPropagation()}>
          <div className="fileViewerHeader">
            <button className="fileViewerBack" onClick={closeViewer}>← Zurück</button>
            <span className="fileViewerTitle">{doc?.title || "Dokument"}</span>
            <div className="fileViewerActions">
              <a className="fileViewerNewTab" href={fileViewerUrl} target="_blank" rel="noreferrer">
                In neuem Tab öffnen
              </a>
              <button className="fileViewerClose" onClick={closeViewer}>✕</button>
            </div>
          </div>
          {fileViewerType?.startsWith("image/") ? (
            <div className="fileViewerImgWrap">
              <img src={fileViewerUrl} alt={doc?.title} className="fileViewerImg" />
            </div>
          ) : (
            <iframe src={fileViewerUrl} title={doc?.title} className="fileViewerFrame" />
          )}
        </div>
      </div>
    )}
  </>
  );
}