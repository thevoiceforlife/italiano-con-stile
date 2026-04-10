'use client';
import { useState, useCallback } from 'react';

// ─── Colori categorie (distinti dai cluster) ──────────────────────────────────
const CAT_COLORS = {
  capitali: { color:'#E91E8C', bg:'#E91E8C11', label:'Capitali', labelEN:'Capitals',    icon:'🏛️' },
  citta:    { color:'#E67E22', bg:'#E67E2211', label:'Città',     labelEN:'Cities',      icon:'🏙️' },
  mete:     { color:'#00BCD4', bg:'#00BCD411', label:'Mete',      labelEN:'Destinations',icon:'🗺️' },
};

// ─── Colori cluster (popolarità turistica) ────────────────────────────────────
const CLUSTER_COLOR = { '🔴':'#E24B4A', '🟡':'#EF9F27', '🟢':'#1D9E75' };

// ─── Database completo ────────────────────────────────────────────────────────
// cat: capitali | citta | mete
// cluster: 🔴 icone | 🟡 tesori | 🟢 scoperte
// costo: 🔴=500 🟡=350 🟢=200 (tutte le capitali = 500)
const CITIES = [
  // ── BASE ──────────────────────────────────────────────────────────────────
  {id:'napoli',      name:'Napoli',              cat:'capitali',cost:0,   cluster:'🔴',regione:'Campania',            lat:40.851,lon:14.268,emoji:'☀️',desc:'Il bar di Mario — base di partenza',     descEn:"Mario's bar — starting point",        fact:'Il caffè napoletano è patrimonio UNESCO.',always:true},
  // ── CAPITALI DI REGIONE ───────────────────────────────────────────────────
  {id:'aosta',       name:'Aosta',               cat:'capitali',cost:500, cluster:'🟢',regione:"Valle d'Aosta",       lat:45.737,lon:7.320, emoji:'🏔',desc:"Tra le Alpi — Augusta Praetoria",        descEn:'Among the Alps — Augusta Praetoria',  fact:"Aosta era la romana Augusta Praetoria."},
  {id:'torino',      name:'Torino',              cat:'capitali',cost:500, cluster:'🔴',regione:'Piemonte',            lat:45.070,lon:7.686, emoji:'🚗',desc:"Prima capitale d'Italia",               descEn:"Italy's first capital",               fact:'La Mole Antonelliana era nata come sinagoga.'},
  {id:'genova',      name:'Genova',              cat:'capitali',cost:500, cluster:'🔴',regione:'Liguria',             lat:44.407,lon:8.934, emoji:'⚓',desc:'La Superba — città di Colombo',          descEn:"La Superba — Columbus's city",        fact:'Il pesto genovese ha una ricetta ufficiale.'},
  {id:'milano',      name:'Milano',              cat:'capitali',cost:500, cluster:'🔴',regione:'Lombardia',           lat:45.464,lon:9.189, emoji:'👔',desc:'Capitale della moda e del design',       descEn:'Capital of fashion and design',       fact:"L'Ultima Cena di Leonardo è su un muro."},
  {id:'trento',      name:'Trento',              cat:'capitali',cost:500, cluster:'🔴',regione:'Trentino-Alto Adige', lat:46.073,lon:11.122,emoji:'🍎',desc:'Porta delle Dolomiti',                   descEn:'Gateway to the Dolomites',            fact:'Il Concilio di Trento durò 18 anni.'},
  {id:'venezia',     name:'Venezia',             cat:'capitali',cost:500, cluster:'🔴',regione:'Veneto',              lat:45.434,lon:12.338,emoji:'🛶',desc:'La città galleggiante — 118 isolette',    descEn:'The floating city — 118 islands',     fact:'Venezia non ha strade — solo canali.'},
  {id:'trieste',     name:'Trieste',             cat:'capitali',cost:500, cluster:'🟡',regione:'Friuli-Venezia Giulia',lat:45.649,lon:13.777,emoji:'☕',desc:"Confine d'Europa — caffè mitteleuropeo", descEn:"Europe's border — mitteleuropean coffee",fact:'Più caffè storici per km² che in Europa.'},
  {id:'bologna',     name:'Bologna',             cat:'capitali',cost:500, cluster:'🔴',regione:'Emilia-Romagna',      lat:44.494,lon:11.343,emoji:'🍝',desc:'La Rossa, la Grassa, la Dotta',           descEn:'The Red, the Fat, the Learned',       fact:'Il ragù non si serve con gli spaghetti.'},
  {id:'firenze',     name:'Firenze',             cat:'capitali',cost:500, cluster:'🔴',regione:'Toscana',             lat:43.769,lon:11.255,emoji:'🎨',desc:'Culla del Rinascimento',                 descEn:'Cradle of the Renaissance',           fact:"Il Davide di Michelangelo è alto 5,17 m."},
  {id:'perugia',     name:'Perugia',             cat:'capitali',cost:500, cluster:'🔴',regione:'Umbria',              lat:43.110,lon:12.389,emoji:'🍫',desc:'Capitale del cioccolato italiano',        descEn:'Capital of Italian chocolate',        fact:'Eurochocolate si tiene ogni ottobre.'},
  {id:'ancona',      name:'Ancona',              cat:'capitali',cost:500, cluster:'🟡',regione:'Marche',              lat:43.616,lon:13.518,emoji:'⚓',desc:'Porta per i Balcani e la Grecia',         descEn:'Gateway to the Balkans',              fact:'Ancona viene dal greco "ankon" — gomito.'},
  {id:'roma',        name:'Roma',                cat:'capitali',cost:500, cluster:'🔴',regione:'Lazio',               lat:41.902,lon:12.496,emoji:'🏛',desc:'La Città Eterna — 2800 anni di storia',   descEn:'The Eternal City — 2800 years',       fact:'Roma ha più fontane di qualsiasi altra città.'},
  {id:'laquila',     name:"L'Aquila",            cat:'capitali',cost:500, cluster:'🟢',regione:'Abruzzo',             lat:42.351,lon:13.400,emoji:'🦅',desc:'Tra i monti del Gran Sasso',              descEn:'In the Gran Sasso mountains',         fact:"L'Aquila fu ricostruita dopo il terremoto 2009."},
  {id:'campobasso',  name:'Campobasso',          cat:'capitali',cost:500, cluster:'🟢',regione:'Molise',              lat:41.563,lon:14.656,emoji:'🏰',desc:'Il Molise — la regione segreta',           descEn:'Molise — the secret region',          fact:"Il Molise è la regione meno conosciuta d'Italia."},
  {id:'bari',        name:'Bari',                cat:'capitali',cost:500, cluster:'🔴',regione:'Puglia',              lat:41.125,lon:16.866,emoji:'🐟',desc:"La porta dell'Oriente",                   descEn:'The gateway to the East',             fact:'Le nonne fanno le orecchiette in strada.'},
  {id:'potenza',     name:'Potenza',             cat:'capitali',cost:500, cluster:'🟢',regione:'Basilicata',          lat:40.642,lon:15.798,emoji:'🌿',desc:"Il capoluogo più alto d'Italia",           descEn:"Italy's highest regional capital",    fact:"Potenza è a 819m — la più alta d'Italia."},
  {id:'catanzaro',   name:'Catanzaro',           cat:'capitali',cost:500, cluster:'🟡',regione:'Calabria',            lat:38.911,lon:16.587,emoji:'🌞',desc:'Tra il Tirreno e lo Ionio',               descEn:'Between Tyrrhenian and Ionian',       fact:'Catanzaro dà il nome a un tipo di ricamo.'},
  {id:'palermo',     name:'Palermo',             cat:'capitali',cost:500, cluster:'🔴',regione:'Sicilia',             lat:38.115,lon:13.361,emoji:'🍋',desc:'Crocevia del Mediterraneo',               descEn:'Crossroads of the Mediterranean',     fact:'Il Ballarò è attivo da oltre mille anni.'},
  {id:'cagliari',    name:'Cagliari',            cat:'capitali',cost:500, cluster:'🔴',regione:'Sardegna',            lat:39.223,lon:9.121, emoji:'🏖',desc:'Capitale della Sardegna',                 descEn:'Capital of Sardinia',                 fact:'In Sardegna si parla sardo — lingua distinta.'},
  // ── CITTÀ (capoluoghi di provincia) ──────────────────────────────────────
  // Abruzzo
  {id:'pescara',     name:'Pescara',             cat:'citta',   cost:350, cluster:'🟡',regione:'Abruzzo',             lat:42.464,lon:14.214,emoji:'🐟',desc:"D'Annunzio e l'Adriatico",               descEn:"D'Annunzio and the Adriatic",         fact:"D'Annunzio nacque a Pescara nel 1863."},
  {id:'chieti',      name:'Chieti',              cat:'citta',   cost:200, cluster:'🟢',regione:'Abruzzo',             lat:42.351,lon:14.168,emoji:'🏛',desc:'Città romana sul colle',                  descEn:'Roman city on the hill',              fact:'Chieti fu fondata dai Romani nel 50 a.C.'},
  {id:'teramo',      name:'Teramo',              cat:'citta',   cost:200, cluster:'🟢',regione:'Abruzzo',             lat:42.659,lon:13.704,emoji:'🏔',desc:'Porta del Gran Sasso',                    descEn:'Gateway to Gran Sasso',               fact:'Teramo è la porta del Parco Nazionale del Gran Sasso.'},
  // Basilicata
  {id:'matera',      name:'Matera',              cat:'citta',   cost:500, cluster:'🔴',regione:'Basilicata',          lat:40.666,lon:16.604,emoji:'🪨',desc:'I Sassi — UNESCO — 9000 anni di storia',  descEn:'The Sassi — UNESCO — 9000 years',     fact:'Una delle città abitate più antiche del mondo.'},
  // Calabria
  {id:'tropea',      name:'Tropea',              cat:'citta',   cost:500, cluster:'🔴',regione:'Calabria',            lat:38.676,lon:15.898,emoji:'🌅',desc:'Perla del Tirreno calabrese',             descEn:'Pearl of the Calabrian Tyrrhenian',   fact:'La cipolla rossa di Tropea è famosa nel mondo.'},
  {id:'cosenza',     name:'Cosenza',             cat:'citta',   cost:200, cluster:'🟢',regione:'Calabria',            lat:39.298,lon:16.254,emoji:'🎓',desc:"Atene della Calabria",                    descEn:'Athens of Calabria',                  fact:'Re Alarico sepolto sotto il fiume Busento.'},
  {id:'reggiocal',   name:'Reggio Calabria',     cat:'citta',   cost:350, cluster:'🟡',regione:'Calabria',            lat:38.111,lon:15.661,emoji:'🍊',desc:'Bronzi di Riace — punta dello stivale',   descEn:'Bronzes of Riace — tip of the boot',  fact:'I Bronzi di Riace: statue greche originali.'},
  {id:'crotone',     name:'Crotone',             cat:'citta',   cost:200, cluster:'🟢',regione:'Calabria',            lat:39.081,lon:17.123,emoji:'🏛',desc:'Magna Grecia — tempio di Hera',            descEn:'Magna Graecia — Temple of Hera',      fact:'Pitagora fondò la sua scuola a Crotone.'},
  // Campania
  {id:'salerno',     name:'Salerno',             cat:'citta',   cost:350, cluster:'🟡',regione:'Campania',            lat:40.683,lon:14.754,emoji:'🌊',desc:'Porta della Costiera Amalfitana',         descEn:'Gateway to the Amalfi Coast',         fact:'La Scuola Medica Salernitana fu la prima in Europa.'},
  {id:'caserta',     name:'Caserta',             cat:'citta',   cost:350, cluster:'🟡',regione:'Campania',            lat:41.069,lon:14.332,emoji:'👑',desc:'La Versailles italiana',                  descEn:'The Italian Versailles',              fact:'La Reggia di Caserta è il palazzo reale più grande al mondo.'},
  {id:'avellino',    name:'Avellino',            cat:'citta',   cost:200, cluster:'🟢',regione:'Campania',            lat:40.914,lon:14.790,emoji:'🌰',desc:'Irpinia — vini e nocciole',               descEn:'Irpinia — wines and hazelnuts',        fact:"L'Irpinia produce il Taurasi — vino DOCG."},
  {id:'benevento',   name:'Benevento',           cat:'citta',   cost:200, cluster:'🟢',regione:'Campania',            lat:41.130,lon:14.781,emoji:'🏛',desc:'Arco di Traiano — città longobarda',       descEn:'Arch of Trajan — Lombard city',       fact:"L'Arco di Traiano a Benevento è del 114 d.C."},
  // Emilia-Romagna
  {id:'rimini',      name:'Rimini',              cat:'citta',   cost:350, cluster:'🔴',regione:'Emilia-Romagna',      lat:44.059,lon:12.566,emoji:'🏖',desc:'Riviera romagnola e Fellini',              descEn:'Romagna Riviera and Fellini',         fact:'Federico Fellini nacque a Rimini nel 1920.'},
  {id:'ravenna',     name:'Ravenna',             cat:'citta',   cost:350, cluster:'🟡',regione:'Emilia-Romagna',      lat:44.417,lon:12.201,emoji:'✨',desc:'Capitale dei mosaici — 8 siti UNESCO',     descEn:'Capital of mosaics — 8 UNESCO sites', fact:'Dante Alighieri morì a Ravenna nel 1321.'},
  {id:'ferrara',     name:'Ferrara',             cat:'citta',   cost:350, cluster:'🟡',regione:'Emilia-Romagna',      lat:44.835,lon:11.620,emoji:'🚲',desc:'Biciclette e Este — UNESCO',               descEn:'Bicycles and Este — UNESCO',          fact:'Più biciclette per abitante di qualsiasi città italiana.'},
  {id:'modena',      name:'Modena',              cat:'citta',   cost:350, cluster:'🔴',regione:'Emilia-Romagna',      lat:44.647,lon:10.926,emoji:'🚗',desc:'Ferrari, Pavarotti, aceto balsamico',      descEn:'Ferrari, Pavarotti, balsamic vinegar', fact:'Pavarotti era di Modena.'},
  {id:'parma',       name:'Parma',               cat:'citta',   cost:350, cluster:'🔴',regione:'Emilia-Romagna',      lat:44.802,lon:10.329,emoji:'🧀',desc:'Parmigiano, prosciutto, Verdi',            descEn:'Parmigiano, prosciutto, Verdi',        fact:'Giuseppe Verdi nacque vicino a Parma nel 1813.'},
  {id:'piacenza',    name:'Piacenza',            cat:'citta',   cost:200, cluster:'🟢',regione:'Emilia-Romagna',      lat:45.052,lon:9.693, emoji:'🏛',desc:'Porta della Pianura Padana',               descEn:'Gateway to the Po Valley',            fact:'Piacenza fu fondata dai Romani nel 218 a.C.'},
  {id:'reggioemilia',name:'Reggio Emilia',       cat:'citta',   cost:200, cluster:'🟢',regione:'Emilia-Romagna',      lat:44.698,lon:10.631,emoji:'🇮🇹',desc:'Patria del Tricolore italiano',           descEn:'Birthplace of the Italian flag',      fact:'Il Tricolore italiano fu adottato a Reggio Emilia nel 1797.'},
  {id:'forlicesena',name:'Forlì-Cesena',         cat:'citta',   cost:200, cluster:'🟢',regione:'Emilia-Romagna',      lat:44.222,lon:12.041,emoji:'🌻',desc:'Romagna autentica — Mussolini nacque qui', descEn:'Authentic Romagna',                   fact:"Mussolini nacque a Predappio, vicino Forlì."},
  // Friuli-Venezia Giulia
  {id:'udine',       name:'Udine',               cat:'citta',   cost:200, cluster:'🟡',regione:'Friuli-Venezia Giulia',lat:46.065,lon:13.234,emoji:'🏔',desc:'Capitale del Friuli',                     descEn:'Capital of Friuli',                   fact:'Udine fu governata da Venezia per 400 anni.'},
  {id:'pordenone',   name:'Pordenone',           cat:'citta',   cost:200, cluster:'🟢',regione:'Friuli-Venezia Giulia',lat:45.965,lon:12.657,emoji:'🎨',desc:'Città del fumetto e del design',           descEn:'City of comics and design',           fact:'Pordenone ospita il festival del fumetto Pordenonelegge.'},
  {id:'gorizia',     name:'Gorizia',             cat:'citta',   cost:200, cluster:'🟢',regione:'Friuli-Venezia Giulia',lat:45.941,lon:13.621,emoji:'🕊',desc:'Città di confine — Europa senza frontiere',descEn:'Border city — Europe without borders', fact:'Gorizia e Nova Gorica sono Capitale Europea della Cultura 2025.'},
  // Lazio
  {id:'viterbo',     name:'Viterbo',             cat:'citta',   cost:200, cluster:'🟢',regione:'Lazio',               lat:42.418,lon:12.108,emoji:'🌸',desc:'Città dei papi medievali',                 descEn:'City of medieval popes',              fact:'Viterbo ospitò il più lungo conclave della storia.'},
  {id:'frosinone',   name:'Frosinone',           cat:'citta',   cost:200, cluster:'🟢',regione:'Lazio',               lat:41.638,lon:13.342,emoji:'🏔',desc:'Ciociaria — terra di confine',              descEn:'Ciociaria — border land',             fact:'La Ciociaria era terra di confine tra il papato e Napoli.'},
  {id:'latina',      name:'Latina',              cat:'citta',   cost:200, cluster:'🟢',regione:'Lazio',               lat:41.468,lon:12.904,emoji:'🌾',desc:'Città di fondazione — Agro Pontino',        descEn:'Foundation city — Pontine Marshes',   fact:'Latina fu fondata nel 1932 e si chiamava Littoria.'},
  {id:'rieti',       name:'Rieti',               cat:'citta',   cost:200, cluster:'🟢',regione:'Lazio',               lat:42.404,lon:12.861,emoji:'⛰',desc:'Centro geografico d\'Italia',               descEn:'Geographical centre of Italy',        fact:"Rieti è il centro geografico d'Italia."},
  // Liguria
  {id:'sanremo',     name:'Sanremo',             cat:'citta',   cost:350, cluster:'🔴',regione:'Liguria',             lat:43.816,lon:7.776, emoji:'🌹',desc:'Festival della Canzone Italiana',          descEn:'Italian Song Festival',               fact:'Il Festival di Sanremo si tiene dal 1951.'},
  {id:'laspezia',    name:'La Spezia',           cat:'citta',   cost:200, cluster:'🟡',regione:'Liguria',             lat:44.105,lon:9.824, emoji:'⚓',desc:'Golfo dei Poeti — porta Cinque Terre',     descEn:'Gulf of Poets — gateway to Cinque Terre',fact:'Byron e Shelley vissero sul Golfo della Spezia.'},
  {id:'savona',      name:'Savona',              cat:'citta',   cost:200, cluster:'🟢',regione:'Liguria',             lat:44.307,lon:8.481, emoji:'🚢',desc:'Riviera di Ponente — due papi',             descEn:'Western Riviera — two popes',         fact:'Savona ha dato i natali a due papi: Sisto IV e Giulio II.'},
  {id:'imperia',     name:'Imperia',             cat:'citta',   cost:200, cluster:'🟢',regione:'Liguria',             lat:43.888,lon:8.027, emoji:'🫒',desc:'Capitale mondiale dell\'olio d\'oliva',     descEn:'World capital of olive oil',          fact:"L'olio di Imperia è tra i migliori del Mediterraneo."},
  // Lombardia
  {id:'bergamo',     name:'Bergamo',             cat:'citta',   cost:350, cluster:'🟡',regione:'Lombardia',           lat:45.695,lon:9.670, emoji:'🏰',desc:'Città Alta UNESCO — mura veneziane',        descEn:'Upper City UNESCO — Venetian walls',  fact:'Le mura veneziane di Bergamo sono UNESCO.'},
  {id:'brescia',     name:'Brescia',             cat:'citta',   cost:350, cluster:'🟡',regione:'Lombardia',           lat:45.538,lon:10.221,emoji:'🦁',desc:"La Leonessa d'Italia",                      descEn:'The Lioness of Italy',                fact:'Brescia ha un teatro romano perfettamente conservato.'},
  {id:'como',        name:'Como',                cat:'citta',   cost:350, cluster:'🔴',regione:'Lombardia',           lat:45.808,lon:9.085, emoji:'🌊',desc:'Il Lago di Como — il più famoso al mondo',  descEn:'Lake Como — the world\'s most famous',fact:"Il Lago di Como è il lago più profondo d'Italia."},
  {id:'mantova',     name:'Mantova',             cat:'citta',   cost:350, cluster:'🟡',regione:'Lombardia',           lat:45.156,lon:10.791,emoji:'🎨',desc:'Virgilio e i Gonzaga — UNESCO',              descEn:'Virgil and the Gonzagas — UNESCO',    fact:'Mantova è circondata da tre laghi artificiali.'},
  {id:'cremona',     name:'Cremona',             cat:'citta',   cost:350, cluster:'🟡',regione:'Lombardia',           lat:45.133,lon:10.023,emoji:'🎻',desc:'Città del violino — Stradivari',             descEn:'City of the violin — Stradivari',     fact:'Cremona produce ancora i migliori violini del mondo.'},
  {id:'pavia',       name:'Pavia',               cat:'citta',   cost:200, cluster:'🟢',regione:'Lombardia',           lat:45.185,lon:9.160, emoji:'🎓',desc:"Una delle università più antiche d'Europa",  descEn:'One of Europe\'s oldest universities', fact:"L'Università di Pavia fu fondata nel 1361."},
  {id:'lecco',       name:'Lecco',               cat:'citta',   cost:200, cluster:'🟡',regione:'Lombardia',           lat:45.854,lon:9.396, emoji:'🏔',desc:'I Promessi Sposi — Manzoni',                descEn:'The Betrothed — Manzoni',             fact:"Lecco è lo scenario de 'I Promessi Sposi' di Manzoni."},
  {id:'varese',      name:'Varese',              cat:'citta',   cost:200, cluster:'🟡',regione:'Lombardia',           lat:45.821,lon:8.825, emoji:'🌸',desc:'Città giardino — Sacro Monte UNESCO',        descEn:'Garden city — Sacro Monte UNESCO',    fact:'Il Sacro Monte di Varese è Patrimonio UNESCO.'},
  {id:'sondrio',     name:'Sondrio',             cat:'citta',   cost:200, cluster:'🟢',regione:'Lombardia',           lat:46.170,lon:9.872, emoji:'🍇',desc:'Valtellina — vini e montagne',               descEn:'Valtellina — wines and mountains',    fact:'La Valtellina produce il pregiato Sforzato di Valtellina.'},
  {id:'lodi',        name:'Lodi',                cat:'citta',   cost:200, cluster:'🟢',regione:'Lombardia',           lat:45.314,lon:9.503, emoji:'🧀',desc:'Pianura Padana — Grana Padano',              descEn:'Po Valley — Grana Padano',            fact:'Il Grana Padano fu inventato dai monaci cistercensi vicino Lodi.'},
  // Marche
  {id:'urbino',      name:'Urbino',              cat:'citta',   cost:350, cluster:'🟡',regione:'Marche',              lat:43.726,lon:12.637,emoji:'🎨',desc:'Raffaello e il Palazzo Ducale — UNESCO',     descEn:'Raphael and Ducal Palace — UNESCO',   fact:'Raffaello nacque a Urbino nel 1483.'},
  {id:'pesaro',      name:'Pesaro',              cat:'citta',   cost:200, cluster:'🟡',regione:'Marche',              lat:43.910,lon:12.913,emoji:'🎶',desc:'Patria di Rossini — Capitale della Cultura 2024',descEn:'Birthplace of Rossini',             fact:'Gioachino Rossini nacque a Pesaro nel 1792.'},
  {id:'macerata',    name:'Macerata',            cat:'citta',   cost:200, cluster:'🟢',regione:'Marche',              lat:43.300,lon:13.453,emoji:'🎭',desc:'Lo Sferisterio — opera lirica estiva',        descEn:'Lo Sferisterio — summer opera',       fact:'Lo Sferisterio ospita un festival lirico estivo.'},
  {id:'ascolipiceno',name:'Ascoli Piceno',       cat:'citta',   cost:200, cluster:'🟡',regione:'Marche',              lat:42.854,lon:13.574,emoji:'🏛',desc:'La città delle olive ascolane',               descEn:'City of stuffed olives',              fact:"Le olive ascolane sono un'eccellenza gastronomica marchigiana."},
  {id:'fermo',       name:'Fermo',               cat:'citta',   cost:200, cluster:'🟢',regione:'Marche',              lat:43.161,lon:13.716,emoji:'🏰',desc:'Borgo medievale con cisterne romane',         descEn:'Medieval town with Roman cisterns',   fact:'Fermo conserva cisterne romane del I secolo.'},
  // Molise
  {id:'termoli',     name:'Termoli',             cat:'citta',   cost:200, cluster:'🟢',regione:'Molise',              lat:42.000,lon:14.995,emoji:'🌊',desc:'Borgo marinaro del Molise',                  descEn:'Molise fishing village',              fact:'Il borgo antico di Termoli è su un promontorio.'},
  {id:'isernia',     name:'Isernia',             cat:'citta',   cost:200, cluster:'🟢',regione:'Molise',              lat:41.595,lon:14.234,emoji:'🦣',desc:'La più antica presenza umana in Europa',      descEn:'Oldest human presence in Europe',     fact:"I resti di Isernia risalgono a 730.000 anni fa."},
  // Piemonte
  {id:'alba',        name:'Alba / Langhe',       cat:'citta',   cost:350, cluster:'🔴',regione:'Piemonte',            lat:44.701,lon:8.035, emoji:'🍄',desc:'Tartufo bianco e Barolo — enogastronomia',   descEn:'White truffle and Barolo',            fact:'Il tartufo bianco può costare fino a 5000€/kg.'},
  {id:'asti',        name:'Asti',                cat:'citta',   cost:200, cluster:'🟡',regione:'Piemonte',            lat:44.900,lon:8.207, emoji:'🍷',desc:'Asti Spumante e Palio medievale',             descEn:'Asti Spumante and medieval Palio',    fact:"Il Palio di Asti è una delle corse di cavalli più antiche d'Italia."},
  {id:'cuneo',       name:'Cuneo',               cat:'citta',   cost:200, cluster:'🟢',regione:'Piemonte',            lat:44.397,lon:7.543, emoji:'🏔',desc:'Porta delle Alpi Marittime',                 descEn:'Gateway to the Maritime Alps',        fact:"Cuneo è famosa per i cioccolatini 'cuneesi al rhum'."},
  {id:'novara',      name:'Novara',              cat:'citta',   cost:200, cluster:'🟢',regione:'Piemonte',            lat:45.447,lon:8.620, emoji:'🏰',desc:'Cupola di San Gaudenzio — 121 metri',         descEn:'Dome of San Gaudenzio — 121 metres',  fact:'La Cupola di San Gaudenzio è alta 121 metri.'},
  {id:'alessandria', name:'Alessandria',         cat:'citta',   cost:200, cluster:'🟢',regione:'Piemonte',            lat:44.913,lon:8.617, emoji:'🎩',desc:'Patria del cappello Borsalino',               descEn:'Birthplace of the Borsalino hat',     fact:'Il cappello Borsalino fu inventato ad Alessandria nel 1857.'},
  {id:'verbania',    name:'Verbania',            cat:'citta',   cost:200, cluster:'🟡',regione:'Piemonte',            lat:45.922,lon:8.554, emoji:'🌺',desc:'Lago Maggiore — Villa Taranto',               descEn:'Lake Maggiore — Villa Taranto',       fact:'I giardini di Villa Taranto contengono 20.000 specie botaniche.'},
  {id:'biella',      name:'Biella',              cat:'citta',   cost:200, cluster:'🟢',regione:'Piemonte',            lat:45.566,lon:8.054, emoji:'🧶',desc:'Capitale italiana del tessile',               descEn:'Italian textile capital',             fact:'Biella produce il 30% del tessuto di lana pregiata italiano.'},
  {id:'vercelli',    name:'Vercelli',            cat:'citta',   cost:200, cluster:'🟢',regione:'Piemonte',            lat:45.325,lon:8.424, emoji:'🌾',desc:'Capitale europea del riso',                   descEn:'European capital of rice',            fact:'La risaia di Vercelli è la più grande d\'Europa.'},
  // Puglia
  {id:'foggia',      name:'Foggia',              cat:'citta',   cost:200, cluster:'🟡',regione:'Puglia',              lat:41.463,lon:15.557,emoji:'🌾',desc:"Granai d'Italia — Tavoliere delle Puglie",    descEn:"Italy's breadbasket — Tavoliere",     fact:"Il Tavoliere è la seconda pianura più grande d'Italia."},
  {id:'taranto',     name:'Taranto',             cat:'citta',   cost:350, cluster:'🟡',regione:'Puglia',              lat:40.464,lon:17.247,emoji:'🐚',desc:'Città dei due mari — Magna Grecia',            descEn:'City of two seas — Magna Graecia',    fact:'Taras era la più grande città della Magna Grecia.'},
  {id:'lecce',       name:'Lecce',               cat:'citta',   cost:350, cluster:'🔴',regione:'Puglia',              lat:40.353,lon:18.174,emoji:'🌸',desc:'Firenze del Sud — barocco leccese',            descEn:'Florence of the South — Lecce Baroque',fact:'La pietra locale indurisce con l\'aria.'},
  {id:'brindisi',    name:'Brindisi',            cat:'citta',   cost:200, cluster:'🟡',regione:'Puglia',              lat:40.631,lon:17.942,emoji:'🚢',desc:'Fine della Via Appia — porta Oriente',         descEn:'End of Via Appia — East gateway',     fact:'La Via Appia terminava a Brindisi con due colonne romane.'},
  {id:'bat',         name:'Barletta-A-Trani',    cat:'citta',   cost:200, cluster:'🟡',regione:'Puglia',              lat:41.225,lon:16.295,emoji:'🏰',desc:'Castel del Monte e Trani — Medioevo',          descEn:'Castel del Monte and Trani',          fact:'Il Castello di Barletta custodisce il Colosso di Barletta.'},
  // Sardegna
  {id:'sassari',     name:'Sassari',             cat:'citta',   cost:200, cluster:'🟡',regione:'Sardegna',            lat:40.727,lon:8.556, emoji:'🌿',desc:'Seconda città della Sardegna',                descEn:"Sardinia's second city",              fact:'La Cavalcata Sarda di Sassari è tra le feste più antiche.'},
  {id:'nuoro',       name:'Nuoro',               cat:'citta',   cost:200, cluster:'🟡',regione:'Sardegna',            lat:40.321,lon:9.330, emoji:'⛰',desc:'Capitale della Barbagia — Grazia Deledda',     descEn:'Capital of Barbagia — Grazia Deledda',fact:'Grazia Deledda da Nuoro vinse il Nobel nel 1926.'},
  {id:'oristano',    name:'Oristano',            cat:'citta',   cost:200, cluster:'🟢',regione:'Sardegna',            lat:39.906,lon:8.590, emoji:'🐴',desc:'La Sartiglia — giostra medievale spettacolare',descEn:'The Sartiglia — medieval joust',      fact:'La Sartiglia è una delle feste più spettacolari di Sardegna.'},
  {id:'olbia',       name:'Olbia / Costa Smeralda',cat:'citta', cost:500, cluster:'🔴',regione:'Sardegna',            lat:40.923,lon:9.503, emoji:'💎',desc:'Porta della Costa Smeralda',                  descEn:'Gateway to the Costa Smeralda',       fact:'La Costa Smeralda fu fondata dall\'Aga Khan nel 1962.'},
  // Sicilia
  {id:'catania',     name:'Catania',             cat:'citta',   cost:350, cluster:'🔴',regione:'Sicilia',             lat:37.502,lon:15.087,emoji:'🌋',desc:"All'ombra dell'Etna",                          descEn:"In Etna's shadow",                    fact:"L'Etna è il vulcano attivo più alto d'Europa."},
  {id:'messina',     name:'Messina',             cat:'citta',   cost:200, cluster:'🟡',regione:'Sicilia',             lat:38.193,lon:15.556,emoji:'⚓',desc:'Lo Stretto — porta della Sicilia',             descEn:'The Strait — gateway to Sicily',      fact:'Lo Stretto di Messina è largo solo 3 km.'},
  {id:'siracusa',    name:'Siracusa',            cat:'citta',   cost:350, cluster:'🔴',regione:'Sicilia',             lat:37.075,lon:15.287,emoji:'🏛',desc:'Città di Archimede — UNESCO',                  descEn:'City of Archimedes — UNESCO',         fact:'Archimede nacque a Siracusa nel 287 a.C.'},
  {id:'agrigento',   name:'Agrigento',           cat:'citta',   cost:350, cluster:'🔴',regione:'Sicilia',             lat:37.311,lon:13.576,emoji:'🏛',desc:'Valle dei Templi — UNESCO',                    descEn:'Valley of Temples — UNESCO',          fact:'Uno dei templi greci meglio conservati al mondo.'},
  {id:'trapani',     name:'Trapani',             cat:'citta',   cost:200, cluster:'🟡',regione:'Sicilia',             lat:38.018,lon:12.514,emoji:'🌊',desc:'Saline e isole Egadi',                          descEn:'Salt pans and Egadian Islands',       fact:'Le saline di Trapani producono sale dal XIV secolo.'},
  {id:'ragusa',      name:'Ragusa',              cat:'citta',   cost:350, cluster:'🟡',regione:'Sicilia',             lat:36.928,lon:14.727,emoji:'🏘',desc:'Barocco ibleo — UNESCO',                        descEn:'Ibleo Baroque — UNESCO',              fact:'Ragusa è divisa in Ragusa Superiore e Ibla.'},
  {id:'caltanissetta',name:'Caltanissetta',      cat:'citta',   cost:200, cluster:'🟢',regione:'Sicilia',             lat:37.490,lon:14.061,emoji:'⛏',desc:'Cuore della Sicilia — zolfo e grano',           descEn:'Heart of Sicily — sulphur and wheat', fact:'Caltanissetta fu il centro mondiale del commercio di zolfo.'},
  {id:'enna',        name:'Enna',                cat:'citta',   cost:200, cluster:'🟢',regione:'Sicilia',             lat:37.565,lon:14.276,emoji:'🏰',desc:"L'ombelico della Sicilia — 931 metri",           descEn:"Sicily's navel — 931 metres",         fact:"Enna è il capoluogo di provincia più alto d'Italia (931m)."},
  // Toscana
  {id:'pisa',        name:'Pisa',                cat:'citta',   cost:350, cluster:'🔴',regione:'Toscana',             lat:43.723,lon:10.399,emoji:'🗼',desc:'La Torre pendente e l\'Arno',                   descEn:'The Leaning Tower and the Arno',      fact:'La Torre è inclinata di 3,97 gradi.'},
  {id:'siena',       name:'Siena',               cat:'citta',   cost:350, cluster:'🔴',regione:'Toscana',             lat:43.318,lon:11.330,emoji:'🐎',desc:'Il Palio e Piazza del Campo',                   descEn:'The Palio and Piazza del Campo',      fact:"Il Palio si corre due volte l'anno dal 1656."},
  {id:'lucca',       name:'Lucca',               cat:'citta',   cost:350, cluster:'🔴',regione:'Toscana',             lat:43.843,lon:10.505,emoji:'🎵',desc:'Mura rinascimentali e Puccini',                 descEn:'Renaissance walls and Puccini',       fact:'Puccini nacque a Lucca nel 1858.'},
  {id:'arezzo',      name:'Arezzo',              cat:'citta',   cost:350, cluster:'🟡',regione:'Toscana',             lat:43.463,lon:11.878,emoji:'💍',desc:'40% dell\'oro italiano — Piero della Francesca',descEn:'40% of Italian gold',                 fact:"Arezzo produce il 40% dell'oro lavorato in Italia."},
  {id:'livorno',     name:'Livorno',             cat:'citta',   cost:200, cluster:'🟢',regione:'Toscana',             lat:43.548,lon:10.311,emoji:'🚢',desc:'Porto della Toscana — cacciucco',               descEn:'Tuscany\'s main port',                fact:'Il cacciucco richiede almeno 5 tipi di pesce.'},
  {id:'grosseto',    name:'Grosseto',            cat:'citta',   cost:200, cluster:'🟡',regione:'Toscana',             lat:42.761,lon:11.113,emoji:'🌿',desc:'Maremma selvaggia — butteri toscani',            descEn:'Wild Maremma — Tuscan cowboys',       fact:'La Maremma ospita ancora i butteri — cowboy toscani.'},
  {id:'massa',       name:'Massa-Carrara',       cat:'citta',   cost:200, cluster:'🟡',regione:'Toscana',             lat:44.035,lon:10.141,emoji:'🗿',desc:'Marmo di Carrara — Michelangelo lo sceglieva qui',descEn:'Carrara marble — Michelangelo\'s choice',fact:'Michelangelo sceglieva personalmente il marmo di Carrara.'},
  {id:'pistoia',     name:'Pistoia',             cat:'citta',   cost:200, cluster:'🟡',regione:'Toscana',             lat:43.933,lon:10.917,emoji:'🌺',desc:'Capitale Italiana della Cultura 2017',           descEn:'Italian Capital of Culture 2017',     fact:'Pistoia è la capitale europea del vivaismo ornamentale.'},
  {id:'prato',       name:'Prato',               cat:'citta',   cost:200, cluster:'🟢',regione:'Toscana',             lat:43.881,lon:11.096,emoji:'🧵',desc:'Capitale del tessile — distretto industriale',   descEn:'Textile capital — industrial district',fact:'Prato è il secondo distretto tessile d\'Europa.'},
  // Trentino-Alto Adige
  {id:'bolzano',     name:'Bolzano',             cat:'citta',   cost:350, cluster:'🔴',regione:'Trentino-Alto Adige', lat:46.498,lon:11.354,emoji:'🎿',desc:"Porta delle Dolomiti — bilingue",               descEn:'Gateway to Dolomites — bilingual',    fact:"Ötzi l'Uomo del Ghiaccio è conservato a Bolzano."},
  // Umbria
  {id:'terni',       name:'Terni',               cat:'citta',   cost:200, cluster:'🟢',regione:'Umbria',              lat:42.563,lon:12.641,emoji:'❤',desc:'Città di San Valentino — Cascata delle Marmore',descEn:'City of Saint Valentine',             fact:'San Valentino fu vescovo di Terni nel III secolo.'},
  // Valle d'Aosta
  {id:'courmayeur',  name:'Courmayeur',          cat:'citta',   cost:500, cluster:'🔴',regione:"Valle d'Aosta",       lat:45.796,lon:6.969, emoji:'🏔',desc:"Monte Bianco — il tetto d'Europa",               descEn:"Mont Blanc — the roof of Europe",     fact:'Il Monte Bianco è alto 4808 metri.'},
  // Veneto
  {id:'verona',      name:'Verona',              cat:'citta',   cost:350, cluster:'🔴',regione:'Veneto',              lat:45.438,lon:10.992,emoji:'🎭',desc:'Romeo e Giulietta — Arena lirica',              descEn:'Romeo and Juliet — Opera Arena',      fact:"L'Arena ospita ancora opere estive."},
  {id:'padova',      name:'Padova',              cat:'citta',   cost:350, cluster:'🔴',regione:'Veneto',              lat:45.408,lon:11.880,emoji:'🎓',desc:'Galileo insegnò qui — Cappella degli Scrovegni', descEn:'Galileo taught here — Scrovegni Chapel',fact:'Galileo Galilei insegnò a Padova per 18 anni.'},
  {id:'vicenza',     name:'Vicenza',             cat:'citta',   cost:350, cluster:'🟡',regione:'Veneto',              lat:45.548,lon:11.547,emoji:'🏛',desc:'Palladio — UNESCO — ville neoclassiche',         descEn:'Palladio — UNESCO',                   fact:'Le ville palladiane influenzarono l\'architettura mondiale.'},
  {id:'treviso',     name:'Treviso',             cat:'citta',   cost:350, cluster:'🟡',regione:'Veneto',              lat:45.667,lon:12.243,emoji:'🌿',desc:'Prosecco e tiramisù — Marca Trevigiana',         descEn:'Prosecco and tiramisù',               fact:"Il tiramisù fu inventato a Treviso negli anni '60."},
  {id:'belluno',     name:'Belluno',             cat:'citta',   cost:200, cluster:'🟡',regione:'Veneto',              lat:46.140,lon:12.217,emoji:'🏔',desc:'Porta delle Dolomiti bellunesi',                 descEn:'Gateway to Belluno Dolomites',        fact:'Belluno è circondata da alcune delle Dolomiti più belle.'},
  {id:'rovigo',      name:'Rovigo',              cat:'citta',   cost:200, cluster:'🟢',regione:'Veneto',              lat:45.070,lon:11.788,emoji:'🌾',desc:'Delta del Po — paesaggio lagunare',              descEn:'Po Delta — lagoon landscape',         fact:'Il Delta del Po è il più grande delta fluviale d\'Italia.'},
  // ── METE (borghi e luoghi iconici) ────────────────────────────────────────
  // Abruzzo
  {id:'roccacalascio',name:'Rocca Calascio',     cat:'mete',    cost:200, cluster:'🟢',regione:'Abruzzo',             lat:42.080,lon:13.750,emoji:'🏰',desc:"Il castello più alto d'Italia — 1460m",          descEn:"Italy's highest castle — 1460m",      fact:"Rocca Calascio è il castello più alto d'Italia."},
  // Basilicata
  {id:'maratea',     name:'Maratea',             cat:'mete',    cost:200, cluster:'🟢',regione:'Basilicata',          lat:39.995,lon:15.726,emoji:'✝', desc:'Perla del Tirreno — Cristo Redentore 22m',       descEn:'Pearl of Tyrrhenian — 22m Christ',    fact:'Il Cristo Redentore di Maratea è alto 22 metri.'},
  {id:'dolomitilucane',name:'Dolomiti Lucane',   cat:'mete',    cost:200, cluster:'🟢',regione:'Basilicata',          lat:40.510,lon:15.900,emoji:'⛰', desc:'Paesaggio lunare — pietra e vento',               descEn:'Lunar landscape — stone and wind',    fact:'Le Dolomiti Lucane emergono improvvise dalla pianura.'},
  // Calabria
  {id:'scilla',      name:'Scilla',              cat:'mete',    cost:200, cluster:'🟢',regione:'Calabria',            lat:38.258,lon:15.716,emoji:'🌊',desc:'Tra Scilla e Cariddi — Omero',                    descEn:'Between Scylla and Charybdis — Homer',fact:"Scilla fu descritta da Omero nell'Odissea."},
  {id:'capovaticano',name:'Capo Vaticano',       cat:'mete',    cost:350, cluster:'🔴',regione:'Calabria',            lat:38.617,lon:15.842,emoji:'🌅',desc:'Acque tra le più cristalline del Mediterraneo',   descEn:'Most crystal waters in the Mediterranean',fact:'Le acque di Capo Vaticano sono tra le più belle d\'Europa.'},
  // Campania
  {id:'positano',    name:'Positano',            cat:'mete',    cost:500, cluster:'🔴',regione:'Campania',            lat:40.628,lon:14.485,emoji:'🌊',desc:'Borgo verticale — Costiera Amalfitana',           descEn:'Vertical village — Amalfi Coast',     fact:'Le case scendono quasi fino al mare.'},
  {id:'amalfi',      name:'Amalfi',              cat:'mete',    cost:500, cluster:'🔴',regione:'Campania',            lat:40.634,lon:14.602,emoji:'🍋',desc:'Repubblica marinara — inventò la bussola',        descEn:'Maritime republic — invented the compass',fact:'Amalfi inventò la bussola magnetica nel 1302.'},
  {id:'sorrento',    name:'Sorrento',            cat:'mete',    cost:500, cluster:'🔴',regione:'Campania',            lat:40.627,lon:14.375,emoji:'🌅',desc:'Limoncello e panorami sul Golfo',                 descEn:'Limoncello and Gulf of Naples views',  fact:'Il limoncello fu inventato a Sorrento.'},
  {id:'capri',       name:'Capri',               cat:'mete',    cost:500, cluster:'🔴',regione:'Campania',            lat:40.550,lon:14.242,emoji:'💎',desc:'Grotta Azzurra e Faraglioni',                     descEn:'Blue Grotto and Faraglioni rocks',     fact:"La Grotta Azzurra ha un'apertura di soli 2 metri."},
  {id:'pompei',      name:'Pompei',              cat:'mete',    cost:500, cluster:'🔴',regione:'Campania',            lat:40.745,lon:14.501,emoji:'🏺',desc:'La città fermata nel 79 d.C.',                    descEn:'The city frozen in 79 AD',            fact:'Gli scavi sono ancora in corso dopo 250 anni.'},
  // Friuli
  {id:'cividale',    name:'Cividale del Friuli', cat:'mete',    cost:200, cluster:'🟡',regione:'Friuli-Venezia Giulia',lat:46.094,lon:13.432,emoji:'🏛',desc:'Capitale dei Longobardi — UNESCO',               descEn:'Lombard capital — UNESCO',            fact:"Cividale era la capitale dei Longobardi in Italia."},
  // Lazio
  {id:'tivoli',      name:'Tivoli',              cat:'mete',    cost:350, cluster:'🔴',regione:'Lazio',               lat:41.963,lon:12.798,emoji:'⛲',desc:'Villa d\'Este e Villa Adriana — UNESCO',           descEn:"Villa d'Este and Villa Adriana",       fact:"Villa Adriana fu costruita dall'imperatore Adriano."},
  {id:'civita',      name:'Civita di Bagn.',     cat:'mete',    cost:200, cluster:'🟢',regione:'Lazio',               lat:42.627,lon:12.114,emoji:'🏝',desc:'La città che muore — 11 abitanti',                 descEn:'The dying city — 11 residents',       fact:'Civita di Bagnoregio ha solo 11 abitanti permanenti.'},
  // Liguria
  {id:'portofino',   name:'Portofino',           cat:'mete',    cost:500, cluster:'🔴',regione:'Liguria',             lat:44.303,lon:9.210, emoji:'⛵',desc:'Il porto dei sogni — 400 abitanti',               descEn:'The dream harbour — 400 residents',   fact:'400 abitanti ma milioni di visitatori ogni anno.'},
  {id:'cinqueterre', name:'Cinque Terre',        cat:'mete',    cost:500, cluster:'🔴',regione:'Liguria',             lat:44.127,lon:9.714, emoji:'🌊',desc:'5 borghi sulla scogliera — UNESCO',                descEn:'5 villages on the cliffs — UNESCO',   fact:'Accessibili solo a piedi o in barca.'},
  // Lombardia
  {id:'bellagio',    name:'Lago di Como',        cat:'mete',    cost:500, cluster:'🔴',regione:'Lombardia',           lat:45.984,lon:9.258, emoji:'💎',desc:'Bellagio — perla del Lago di Como',               descEn:'Bellagio — pearl of Lake Como',       fact:"Il Lago di Como è il lago più profondo d'Italia."},
  {id:'sirmione',    name:'Lago di Garda',       cat:'mete',    cost:500, cluster:'🔴',regione:'Lombardia',           lat:45.487,lon:10.608,emoji:'🏰',desc:'Sirmione — castello sul Garda',                    descEn:'Sirmione — castle on Lake Garda',     fact:"Il Lago di Garda è il lago più grande d'Italia."},
  // Marche
  {id:'conero',      name:'Riviera del Conero',  cat:'mete',    cost:200, cluster:'🟡',regione:'Marche',              lat:43.556,lon:13.612,emoji:'🌊',desc:'Scogliere bianche e acque cristalline',            descEn:'White cliffs and crystal waters',     fact:'Monte Conero è un promontorio calcareo unico.'},
  {id:'grottassi',   name:'Grotte di Frasassi',  cat:'mete',    cost:200, cluster:'🟡',regione:'Marche',              lat:43.399,lon:12.967,emoji:'🦇',desc:"Le grotte più grandi d'Italia",                    descEn:"Italy's largest cave system",         fact:"La cattedrale di Frasassi potrebbe contenere il Duomo di Milano."},
  // Molise
  {id:'agnone',      name:'Agnone',              cat:'mete',    cost:200, cluster:'🟢',regione:'Molise',              lat:41.808,lon:14.364,emoji:'🔔',desc:'La città delle campane dal 1000 d.C.',             descEn:'City of bells since 1000 AD',         fact:'Agnone produce campane artigianali dal Medioevo.'},
  // Piemonte
  {id:'stresa',      name:'Lago Maggiore',       cat:'mete',    cost:350, cluster:'🔴',regione:'Piemonte',            lat:45.882,lon:8.534, emoji:'🌊',desc:'Stresa — Isole Borromee',                          descEn:'Stresa — Borromean Islands',          fact:'Le Isole Borromee sono dei Borromeo dal 1300.'},
  // Puglia
  {id:'alberobello', name:'Alberobello',         cat:'mete',    cost:500, cluster:'🔴',regione:'Puglia',              lat:40.785,lon:17.239,emoji:'🍄',desc:'I trulli — UNESCO',                                descEn:'The trulli — UNESCO',                 fact:'I trulli sono costruiti a secco, senza cemento.'},
  {id:'polignano',   name:'Polignano a Mare',    cat:'mete',    cost:350, cluster:'🔴',regione:'Puglia',              lat:40.993,lon:17.222,emoji:'🌊',desc:'Case sull\'Adriatico — Red Bull Cliff Diving',      descEn:'Houses over the Adriatic',            fact:'Qui si tiene ogni anno il Red Bull Cliff Diving.'},
  {id:'ostuni',      name:'Ostuni',              cat:'mete',    cost:350, cluster:'🔴',regione:'Puglia',              lat:40.728,lon:17.579,emoji:'⚪',desc:'La città bianca della Puglia',                     descEn:'The white city of Puglia',            fact:'Dipinta di bianco per riflettere il calore.'},
  {id:'vieste',      name:'Gargano',             cat:'mete',    cost:350, cluster:'🔴',regione:'Puglia',              lat:41.882,lon:16.178,emoji:'⛰',desc:"Vieste e lo sperone d'Italia",                      descEn:"Vieste and Italy's spur",             fact:"Il Gargano è lo sperone dello stivale italiano."},
  {id:'casteldelm',  name:'Castel del Monte',    cat:'mete',    cost:350, cluster:'🔴',regione:'Puglia',              lat:41.085,lon:16.271,emoji:'🏰',desc:"L'enigma ottagonale di Federico II — UNESCO",       descEn:"Frederick II's octagonal enigma",     fact:'8 torri ottagonali — il numero simbolo di Federico II.'},
  // Sardegna
  {id:'costasmeralda',name:'Costa Smeralda',     cat:'mete',    cost:500, cluster:'🔴',regione:'Sardegna',            lat:41.050,lon:9.500, emoji:'💎',desc:'Porto Cervo — lusso e mare cristallino',            descEn:'Porto Cervo — luxury and crystal sea', fact:"Fondata dall'Aga Khan nel 1962."},
  {id:'lamaddalena', name:'La Maddalena',        cat:'mete',    cost:350, cluster:'🔴',regione:'Sardegna',            lat:41.217,lon:9.408, emoji:'🏝',desc:'Arcipelago — parco nazionale',                     descEn:'Archipelago — national park',         fact:"Garibaldi visse sull'isola di Caprera."},
  {id:'alghero',     name:'Alghero',             cat:'mete',    cost:350, cluster:'🔴',regione:'Sardegna',            lat:40.559,lon:8.317, emoji:'🌊',desc:'Si parla ancora catalano — algherese',              descEn:'Catalan still spoken here',           fact:"L'algherese è un dialetto catalano unico al mondo."},
  // Sicilia
  {id:'taormina',    name:'Taormina',            cat:'mete',    cost:500, cluster:'🔴',regione:'Sicilia',             lat:37.852,lon:15.292,emoji:'🌋',desc:"Teatro greco con vista sull'Etna",                  descEn:'Greek theatre with Etna view',        fact:"Vista sull'Etna unica al mondo dal teatro antico."},
  {id:'etna',        name:'Etna',                cat:'mete',    cost:500, cluster:'🔴',regione:'Sicilia',             lat:37.750,lon:15.000,emoji:'🌋',desc:"Il vulcano attivo più alto d'Europa",               descEn:"Europe's highest active volcano",     fact:"L'Etna erutta quasi continuamente."},
  {id:'modica',      name:'Modica',              cat:'mete',    cost:350, cluster:'🟡',regione:'Sicilia',             lat:36.862,lon:14.765,emoji:'🍫',desc:'Cioccolato azteco — UNESCO',                        descEn:'Aztec chocolate — UNESCO',            fact:'Il cioccolato di Modica si produce senza zucchero raffinato.'},
  {id:'noto',        name:'Noto',                cat:'mete',    cost:350, cluster:'🟡',regione:'Sicilia',             lat:36.891,lon:15.069,emoji:'🌸',desc:'Barocco siciliano — UNESCO',                        descEn:'Sicilian Baroque — UNESCO',           fact:'Noto fu completamente ricostruita dopo il 1693.'},
  {id:'erice',       name:'Erice',               cat:'mete',    cost:200, cluster:'🟢',regione:'Sicilia',             lat:37.964,lon:12.589,emoji:'☁', desc:'Il borgo nella nuvola — 750m',                      descEn:'The cloud village — 750m',            fact:'Erice è quasi sempre avvolta nelle nuvole.'},
  // Toscana
  {id:'valdorcia',   name:"Val d'Orcia",         cat:'mete',    cost:500, cluster:'🔴',regione:'Toscana',             lat:43.079,lon:11.679,emoji:'🌾',desc:"Paesaggio toscano UNESCO — Pienza e Montalcino",    descEn:'Tuscan landscape UNESCO',             fact:"La Val d'Orcia è Patrimonio UNESCO dal 2004."},
  {id:'isolaelba',   name:"Isola d'Elba",        cat:'mete',    cost:350, cluster:'🔴',regione:'Toscana',             lat:42.780,lon:10.280,emoji:'🏝',desc:"Napoleone e il mare della Toscana",                  descEn:"Napoleon's island",                   fact:"Napoleone fu esiliato all'Elba nel 1814."},
  {id:'sangimignano',name:'San Gimignano',       cat:'mete',    cost:350, cluster:'🔴',regione:'Toscana',             lat:43.468,lon:11.043,emoji:'🗼',desc:'Manhattan medievale — UNESCO',                      descEn:'Medieval Manhattan — UNESCO',         fact:'San Gimignano aveva 72 torri — ne restano 14.'},
  {id:'volterra',    name:'Volterra',            cat:'mete',    cost:200, cluster:'🟡',regione:'Toscana',             lat:43.401,lon:10.860,emoji:'⛰',desc:'Città etrusca di alabastro',                         descEn:'Etruscan city of alabaster',          fact:'Volterra era importante già 3000 anni fa.'},
  {id:'pitigliano',  name:'Pitigliano',          cat:'mete',    cost:200, cluster:'🟢',regione:'Toscana',             lat:42.635,lon:11.671,emoji:'🏘',desc:'Piccola Gerusalemme — tufo',                        descEn:'Little Jerusalem — tufa',             fact:"Pitigliano aveva una fiorente comunità ebraica dal '500."},
  // Trentino
  {id:'dolomiti',    name:'Dolomiti',            cat:'mete',    cost:500, cluster:'🔴',regione:'Trentino-Alto Adige', lat:46.500,lon:11.900,emoji:'🏔',desc:'UNESCO — montagne tra le più belle al mondo',        descEn:'UNESCO — among the world\'s most beautiful mountains',fact:'Le Dolomiti sono UNESCO dal 2009.'},
  {id:'lagobraies',  name:'Lago di Braies',      cat:'mete',    cost:500, cluster:'🔴',regione:'Trentino-Alto Adige', lat:46.694,lon:12.084,emoji:'🌊',desc:'Il lago più romantico delle Dolomiti',               descEn:'The most romantic Dolomite lake',     fact:'Il Lago di Braies è circondato da boschi e cime.'},
  {id:'valgardena',  name:'Val Gardena',         cat:'mete',    cost:350, cluster:'🔴',regione:'Trentino-Alto Adige', lat:46.577,lon:11.723,emoji:'🎿',desc:'Sci e artigianato del legno',                        descEn:'Skiing and wood craftsmanship',       fact:'Val Gardena è famosa per i presepi in legno.'},
  // Umbria
  {id:'assisi',      name:'Assisi',              cat:'mete',    cost:350, cluster:'🔴',regione:'Umbria',              lat:43.071,lon:12.619,emoji:'🕊',desc:'San Francesco — UNESCO',                            descEn:'Saint Francis — UNESCO',              fact:"San Francesco è il patrono d'Italia e degli animali."},
  {id:'orvieto',     name:'Orvieto',             cat:'mete',    cost:350, cluster:'🔴',regione:'Umbria',              lat:42.718,lon:12.108,emoji:'🏰',desc:'Duomo gotico sulla rupe di tufo',                    descEn:'Gothic cathedral on tufa cliff',      fact:'Orvieto ha una città etrusca sotterranea di 2500 anni.'},
  {id:'cascatemarmore',name:'Cascate delle Marmore',cat:'mete', cost:200, cluster:'🟢',regione:'Umbria',              lat:42.557,lon:12.718,emoji:'💧',desc:"Le cascate artificiali più alte d'Europa — 165m",    descEn:"Europe's highest artificial waterfall",fact:'Costruite dai Romani nel 271 a.C.'},
  // Valle d'Aosta
  {id:'montebiancomet',name:'Monte Bianco',      cat:'mete',    cost:500, cluster:'🔴',regione:"Valle d'Aosta",       lat:45.834,lon:6.865, emoji:'🏔',desc:"Il tetto d'Europa — 4808 metri",                     descEn:"The roof of Europe — 4808 metres",    fact:"Il Monte Bianco è il punto più alto d'Europa occidentale."},
  // Veneto
  {id:'dolomitiveneto',name:'Cortina d\'Ampezzo',cat:'mete',    cost:500, cluster:'🔴',regione:'Veneto',              lat:46.540,lon:12.135,emoji:'🎿',desc:'Regina delle Dolomiti — Olimpiadi 1956 e 2026',     descEn:'Queen of the Dolomites',              fact:'Cortina ospitò le Olimpiadi invernali nel 1956.'},
];

// ─── Costo basato su cluster (override per capitali sempre 500) ───────────────
function getCost(city) {
  if (city.always) return 0;
  if (city.cat === 'capitali') return 500;
  return city.cost;
}

function isCatAccessible(cat, travelAccess) {
  if (cat === 'capitali') return travelAccess === 'all';
  if (cat === 'citta')    return travelAccess === 'all' || travelAccess === 'province';
  if (cat === 'mete')     return true; // borghi sempre accessibili con energia ≥25%
  return false;
}

const REGIONI_ORDER = ['Campania']; // Campania sempre prima
const ALL_REGIONI = [...new Set(CITIES.map(c=>c.regione))].filter(r=>r!=='Campania').sort();
const REGIONI_SORTED = [...REGIONI_ORDER, ...ALL_REGIONI];

const RICORDI = {
  napoli:"«O sole mio sta 'nfronte a te!» — ti senti già napoletano.",
  roma:"«Quando a Roma...» — ora capisci davvero cosa significa.",
  venezia:"Venezia è un sogno fatto di acqua — e tu l'hai vissuto.",
  firenze:"Tutto è arte a Firenze — anche il tuo caffè mattutino.",
  positano:"Le case colorano il mare — un quadro vivente.",
  matera:"I Sassi ti guardano dall'antichità — emozionante.",
  alberobello:"I trulli sembrano usciti da una fiaba — e ci credi.",
  taormina:"L'Etna fumava all'orizzonte — teatro greco perfetto.",
  courmayeur:"Il Monte Bianco innevato — il tetto d'Europa.",
  dolomiti:"Le Dolomiti al tramonto brillano d'oro — indimenticabile.",
};

export default function ItalyTravelModal({ energy, credits, tickets, travelAccess='borghi', onClose, onBuyTicket }) {
  const [selected,   setSelected]   = useState(null);
  const [filter,     setFilter]     = useState('mete');
  const [search,     setSearch]     = useState('');
  const [boughtMsg,  setBoughtMsg]  = useState('');
  const [revisiting, setRevisiting] = useState(false);

  const isUnlocked = useCallback((c) => c.always || !!tickets?.[c.id], [tickets]);
  const canAfford  = (c) => credits >= getCost(c);
  const accessible = useCallback((c) => {
    if (c.always) return true;
    if (!isCatAccessible(c.cat, travelAccess)) return false;
    const minEnergy = c.cat==='capitali'?90:c.cat==='citta'?60:25;
    return energy >= minEnergy;
  }, [travelAccess, energy]);

  const countCat = (cat) => CITIES.filter(c=>c.cat===cat&&!c.always).length;
  const visitedCat = (cat) => CITIES.filter(c=>c.cat===cat&&!c.always&&isUnlocked(c)).length;

  const handleBuy = (city) => {
    if (!canAfford(city)||!accessible(city)) return;
    const ok = onBuyTicket(city.id, getCost(city));
    if (ok) {
      setBoughtMsg('🎉 Benvenuto a '+city.name+'! / Welcome to '+city.name+'!');
      setTimeout(()=>setBoughtMsg(''),3000);
    }
  };

  // Filtra per tab e ricerca
  const filteredCities = CITIES.filter(c => {
    if (c.cat !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !c.regione.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Raggruppa per regione nell'ordine corretto
  const byRegione = REGIONI_SORTED.reduce((acc, reg) => {
    const cities = filteredCities.filter(c=>c.regione===reg);
    if (cities.length) acc[reg] = cities;
    return acc;
  }, {});

  const S = {
    modal:  {position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',zIndex:1000,display:'flex',alignItems:'flex-end',justifyContent:'center'},
    sheet:  {background:'var(--bg)',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:480,maxHeight:'94vh',display:'flex',flexDirection:'column',border:'1.5px solid var(--border)',borderBottom:'none'},
    header: {padding:'14px 16px 10px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0},
    body:   {overflowY:'auto',flex:1},
    sec:    {padding:'12px 16px',borderBottom:'1px solid var(--border)'},
    lbl:    {fontSize:13,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6},
    mu:     {fontSize:15,color:'var(--text3)'},
    track:  {height:5,background:'var(--border)',borderRadius:99,overflow:'hidden',marginTop:5},
  };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={S.modal}>
      <div style={S.sheet}>

        {/* Header */}
        <div style={S.header}>
          <div>
            <div style={{fontSize:18,fontWeight:900,color:'var(--text)'}}>🇮🇹 Viaggia in Italia / Travel Italy</div>
            <div style={{fontSize:14,color:'var(--text3)',marginTop:2}}>Scopri l'Italia con i tuoi crediti / Explore Italy</div>
          </div>
          <button onClick={onClose} style={{background:'var(--card)',border:'1px solid var(--border)',color:'var(--text2)',borderRadius:8,width:32,height:32,fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
        </div>

        {boughtMsg && (
          <div style={{background:'var(--ok-bar)',padding:'9px 16px',color:'var(--ok-text)',fontSize:15,textAlign:'center',fontWeight:700,flexShrink:0}}>
            {boughtMsg}
          </div>
        )}

        <div style={S.body}>

          {/* Mappa semplice */}
          <div style={{...S.sec,padding:'12px 16px'}}>
            <div style={{width:'100%',borderRadius:12,overflow:'hidden',background:'#0a1628'}}>
              <img src="/images/italia-map.png" alt="Cartina Italia"
                style={{width:'100%',height:'auto',display:'block',userSelect:'none'}}
                draggable={false}/>
            </div>
          </div>

          {/* Crediti + costi cluster */}
          <div style={{...S.sec,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={S.lbl}>crediti / credits</div>
              <div style={{display:'flex',alignItems:'baseline',gap:6,marginTop:2}}>
                <span style={{fontSize:22,fontWeight:900,color:'var(--text)'}}>{credits}</span>
                <span style={{fontSize:20}}>🎫</span>
              </div>
            </div>
            <div style={{textAlign:'right',display:'flex',flexDirection:'column',gap:2}}>
              <div style={{fontSize:13,color:'var(--text3)'}}>🔴 Icone / Icons · 500 cr</div>
              <div style={{fontSize:13,color:'var(--text3)'}}>🟡 Tesori / Treasures · 350 cr</div>
              <div style={{fontSize:13,color:'var(--text3)'}}>🟢 Scoperte / Discoveries · 200 cr</div>
            </div>
          </div>

          {/* Box Capitali / Città / Mete */}
          <div style={{...S.sec}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
              {Object.entries(CAT_COLORS).map(([key,cat])=>{
                const visited = visitedCat(key);
                const tot     = countCat(key);
                const acc     = isCatAccessible(key, travelAccess);
                return (
                  <div key={key} style={{borderRadius:10,padding:'10px 6px',textAlign:'center',background:'var(--card)',border:`1.5px solid ${acc?cat.color:'var(--border)'}`,boxShadow:acc?`0 0 10px ${cat.color}44`:'none',opacity:acc?1:0.5}}>
                    <div style={{fontSize:20,marginBottom:3}}>{cat.icon}</div>
                    <div style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:1}}>{cat.label}</div>
                    <div style={{fontSize:12,color:'var(--text3)',marginBottom:4}}>{cat.labelEN}</div>
                    <div style={{fontSize:18,fontWeight:900,color:acc?cat.color:'var(--text3)'}}>{visited}/{tot}</div>
                    <div style={{display:'flex',gap:2,justifyContent:'center',marginTop:4,flexWrap:'wrap'}}>
                      {Array.from({length:Math.min(tot,8)},(_,i)=>(
                        <div key={i} style={{width:6,height:6,borderRadius:'50%',background:i<visited?cat.color:'var(--border)'}}/>
                      ))}
                    </div>
                    <div style={{display:'inline-block',padding:'2px 6px',borderRadius:99,fontSize:12,fontWeight:700,marginTop:5,
                      background:acc?cat.bg:'var(--bg)',color:acc?cat.color:'var(--text3)'}}>
                      {acc?'✓ aperto':'🔒 bloccato'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scheda città selezionata */}
          {selected && (
            <div style={{...S.sec,background:CAT_COLORS[selected.cat].color+'11',borderBottom:`1.5px solid ${CAT_COLORS[selected.cat].color}33`}}>
              <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:8}}>
                <span style={{fontSize:24,flexShrink:0}}>{selected.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:17,fontWeight:900,color:'var(--text)'}}>{selected.name}</div>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginTop:2,flexWrap:'wrap'}}>
                    <span style={{fontSize:14,color:'var(--text3)'}}>{selected.regione}</span>
                    <span style={{fontSize:14}}>{selected.cluster}</span>
                    <span style={{fontSize:13,fontWeight:700,padding:'1px 6px',borderRadius:99,
                      background:CAT_COLORS[selected.cat].bg,color:CAT_COLORS[selected.cat].color}}>
                      {CAT_COLORS[selected.cat].label}
                    </span>
                  </div>
                  <div style={{fontSize:14,color:'var(--text3)',marginTop:3}}>{selected.desc}</div>
                  <div style={{fontSize:14,color:'var(--text3)',fontStyle:'italic'}}>{selected.descEn}</div>
                </div>
                <button onClick={()=>{setSelected(null);setRevisiting(false);}}
                  style={{background:'none',border:'none',color:'var(--text3)',fontSize:18,cursor:'pointer'}}>✕</button>
              </div>
              {selected.fact && (
                <div style={{background:'var(--bg)',borderLeft:`3px solid ${CAT_COLORS[selected.cat].color}`,borderRadius:'0 8px 8px 0',padding:'6px 10px',fontSize:14,color:'var(--text2)',lineHeight:1.5,marginBottom:8}}>
                  💡 {selected.fact}
                </div>
              )}
              {selected.always ? (
                <div style={{background:'#FF9B4222',color:'#FF9B42',borderRadius:10,padding:'8px 12px',fontSize:15,fontWeight:700,textAlign:'center'}}>
                  ☀️ Casa — il Bar di Mario ti aspetta sempre! / Mario's bar always awaits!
                </div>
              ) : isUnlocked(selected) ? (
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  <div style={{background:'var(--ok-bar)',color:'var(--ok-text)',borderRadius:10,padding:'7px 12px',fontSize:15,fontWeight:700,textAlign:'center'}}>
                    ✅ Visitata / Visited — lezioni locali in arrivo!
                  </div>
                  <button onClick={()=>setRevisiting(r=>!r)}
                    style={{background:CAT_COLORS[selected.cat].color+'22',color:CAT_COLORS[selected.cat].color,border:`1px solid ${CAT_COLORS[selected.cat].color}44`,borderRadius:10,padding:'7px 12px',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                    🔁 Rivedi il ricordo / Revisit memory
                  </button>
                  {revisiting && (
                    <div style={{background:'var(--card)',border:`1px solid ${CAT_COLORS[selected.cat].color}33`,borderRadius:10,padding:'9px 12px',fontSize:15,color:'var(--text2)',lineHeight:1.6,fontStyle:'italic'}}>
                      ✨ {RICORDI[selected.id]||'Un ricordo indimenticabile! / An unforgettable memory!'}
                    </div>
                  )}
                </div>
              ) : !accessible(selected) ? (
                <div style={{background:'var(--err-bar)',color:'var(--err-text)',borderRadius:10,padding:'8px 12px',fontSize:14,textAlign:'center'}}>
                  🔒 {selected.cat==='capitali'?'Ricarica al 90% / Recharge to 90%':selected.cat==='citta'?'Ricarica al 60% / Recharge to 60%':'Ricarica al 25% / Recharge to 25%'}
                </div>
              ) : !canAfford(selected) ? (
                <div style={{background:'var(--card)',color:'var(--text2)',borderRadius:10,padding:'8px 12px',fontSize:14,textAlign:'center',border:'1px solid var(--border)'}}>
                  💳 Crediti insufficienti: {credits}/{getCost(selected)} cr / Not enough credits
                </div>
              ) : (
                <button onClick={()=>handleBuy(selected)}
                  style={{background:'var(--primary)',color:'#fff',border:'none',borderRadius:10,padding:'10px 14px',fontSize:16,fontWeight:900,cursor:'pointer',fontFamily:'inherit',width:'100%',boxShadow:'0 2px 12px #58CC0244'}}>
                  🎫 Compra biglietto — {getCost(selected)} cr / Buy ticket
                </button>
              )}
            </div>
          )}

          {/* Ricerca */}
          <div style={{padding:'8px 16px',borderBottom:'1px solid var(--border)'}}>
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="🔍 Cerca una destinazione / Search a destination..."
              style={{width:'100%',padding:'9px 12px',borderRadius:10,border:'1px solid var(--border)',background:'var(--card)',fontSize:16,color:'var(--text)',fontFamily:'inherit',outline:'none'}}
            />
          </div>

          {/* Tab Capitali / Città / Mete */}
          <div style={{display:'flex',borderBottom:'1px solid var(--border)',background:'var(--card)',flexShrink:0}}>
            {Object.entries(CAT_COLORS).map(([key,cat])=>(
              <button key={key} onClick={()=>setFilter(key)}
                style={{flex:1,padding:'10px 4px',fontSize:14,fontWeight:700,border:'none',background:'transparent',cursor:'pointer',fontFamily:'inherit',
                  color:filter===key?cat.color:'var(--text3)',
                  borderBottom:filter===key?`2px solid ${cat.color}`:'2px solid transparent',
                  transition:'all 0.2s'}}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Lista per regione */}
          <div style={{padding:'0 16px 32px'}}>
            {Object.entries(byRegione).map(([regione, cities])=>{
              // Cluster della regione = cluster più comune nelle città
              const clusterCounts = cities.reduce((a,c)=>{a[c.cluster]=(a[c.cluster]||0)+1;return a},{});
              const regionCluster = Object.entries(clusterCounts).sort((a,b)=>b[1]-a[1])[0]?.[0]||'🟢';
              return (
                <div key={regione}>
                  {/* Header regione */}
                  <div style={{display:'flex',alignItems:'center',gap:8,padding:'12px 0 6px',borderBottom:'0.5px solid var(--border)',marginBottom:2}}>
                    <span style={{fontSize:16}}>{regionCluster}</span>
                    <span style={{fontSize:14,fontWeight:700,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{regione}</span>
                    <span style={{fontSize:13,color:'var(--text3)',marginLeft:'auto'}}>{cities.length} {filter==='capitali'?'capital':filter==='citta'?'citt':filter==='mete'?'met':''}{cities.length>1?'e':'a'} / {cities.length}</span>
                  </div>

                  {/* Napoli speciale in cima a Campania */}
                  {regione==='Campania' && filter==='capitali' && (() => {
                    const napoli = CITIES.find(c=>c.id==='napoli');
                    return (
                      <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0 8px 8px',borderBottom:'0.5px solid var(--border)',background:'#FF9B4211',borderRadius:8}}>
                        <span style={{fontSize:18}}>☀️</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:16,fontWeight:700,color:'#FF9B42'}}>Napoli</div>
                          <div style={{fontSize:13,color:'var(--text3)'}}>Base di partenza · sempre aperta / always open</div>
                        </div>
                        <span style={{fontSize:13,fontWeight:700,color:'#FF9B42',background:'#FF9B4222',padding:'2px 8px',borderRadius:99}}>🏠 base</span>
                      </div>
                    );
                  })()}

                  {/* Città della regione ordinate per cluster 🔴→🟡→🟢 */}
                  {[...cities].sort((a,b)=>{
                    const order={'🔴':0,'🟡':1,'🟢':2};
                    return (order[a.cluster]||0)-(order[b.cluster]||0);
                  }).map(city=>{
                    const unlocked = isUnlocked(city);
                    const access   = accessible(city);
                    const isSel    = selected?.id===city.id;
                    const catColor = CAT_COLORS[city.cat].color;
                    const clColor  = CLUSTER_COLOR[city.cluster]||'#888';
                    return (
                      <div key={city.id}
                        onClick={()=>setSelected(prev=>prev?.id===city.id?null:city)}
                        style={{display:'flex',alignItems:'center',gap:8,padding:'9px 0 9px 4px',borderBottom:'0.5px solid var(--border)',cursor:'pointer',
                          background:isSel?catColor+'11':'transparent',
                          borderRadius:isSel?8:0,paddingLeft:isSel?8:4,
                          transition:'all 0.15s',opacity:access?1:0.4}}>
                        {/* Pallino cluster */}
                        <div style={{width:8,height:8,borderRadius:'50%',flexShrink:0,background:clColor,boxShadow:`0 0 4px ${clColor}`}}/>
                        <span style={{fontSize:18,flexShrink:0}}>{city.emoji}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:16,fontWeight:700,color:isSel?catColor:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{city.name}</div>
                          <div style={{fontSize:13,color:'var(--text3)',marginTop:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{city.desc}</div>
                        </div>
                        {/* Badge destra */}
                        {unlocked ? (
                          <span style={{fontSize:13,fontWeight:700,color:'var(--ok-text)',background:'var(--ok-bar)',padding:'2px 7px',borderRadius:99,flexShrink:0,whiteSpace:'nowrap'}}>✓</span>
                        ) : !access ? (
                          <span style={{fontSize:15,color:'var(--text3)',flexShrink:0}}>🔒</span>
                        ) : canAfford(city) ? (
                          <span style={{fontSize:13,fontWeight:700,color:'white',background:clColor,padding:'2px 7px',borderRadius:99,flexShrink:0,whiteSpace:'nowrap'}}>{getCost(city)} 🎫</span>
                        ) : (
                          <span style={{fontSize:13,color:'var(--text3)',flexShrink:0}}>💳</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {Object.keys(byRegione).length===0 && (
              <div style={{textAlign:'center',padding:'24px 0',color:'var(--text3)',fontSize:16}}>
                Nessun risultato / No results found
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
