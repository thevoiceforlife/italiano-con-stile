# Decisioni Architettura v2 — Italiano con Stile

**Data**: 20 Aprile 2026
**Sessione**: brainstorming ristrutturazione contenuto post-audit
**Commit base di riferimento**: 6027f42

---

## Scopo di questo documento

Questo documento raccoglie le decisioni di architettura prese durante la sessione del 20 aprile 2026.
È la **fonte autoritativa** per tutto il lavoro successivo di ristrutturazione del contenuto.

Non sostituisce la bibbia attuale — la integra con la **nuova matrice** che andrà applicata a partire dal pilota.
La bibbia esistente resta valida per il motore, il design system, la taxonomy semantica, il validator.

Struttura del documento:
1. Contesto e motivazione
2. Struttura contenuto (matrice v2)
3. 8 attività standard
4. Distribuzione attività (3 versioni)
5. Regola personaggi
6. Tema 1 Saluti — casting definito
7. Rewards
8. Regole editoriali
9. Motore (invariato)
10. Cambi nome
11. Roadmap implementazione
12. Cosa NON è stato deciso

---

## 1. Contesto e motivazione

### Da dove partiamo
L'app Italiano con Stile è live su Vercel, ha A1 completo (15 temi × 2 unità × 5 lezioni + boss = 90 sessioni, 738 domande, 30 schede biblioteca, 145 destinazioni viaggi, 13 componenti domanda, validator con 9 check attivi).

### Perché cambiare struttura
L'audit del 20 aprile 2026 ha rilevato debito documentale (bibbia "piena di pezze") e debito di contenuto (391 feedback non tradotti, 421 generici, bias options[0], mismatch semantici). La struttura contenuto attuale è funzionale ma **non scala** in modo chiaro ai livelli A2-C2.

### Cosa cambia e cosa NON cambia

**Cambia**:
- Struttura temi/unità/lezioni
- Tipi di attività (introduzione Decision, Pattern/WHY, Dialogue come attività di primo livello)
- Regola personaggi (Mario onnipresente + co-protagonisti variabili)
- UI del fumetto personaggio (figura intera + 4 espressioni)

**Non cambia**:
- Stack tecnico (Next.js, Vercel, localStorage)
- Sistema energia / cibo / viaggi
- Biblioteca grammatica
- Dashboard e mappa Italia
- Taxonomy semantica context↔answer
- Validator pre-commit

### Approccio scelto
**Pilota su 1 tema completo prima di estendere.** Non si riscrive l'app da zero. Si costruisce UN tema con la nuova matrice, si valida, se funziona si estende ai restanti 49 temi A1 e poi ai livelli successivi.

Tema pilota: **#1 Saluti**.

---

## 2. Struttura contenuto — matrice v2

### Gerarchia
```
1 LIVELLO (A1, A2, B1, B2, C1, C2)
  └─ 50 temi
      └─ 5 unità per tema
          └─ 6 lezioni per unità
              └─ 8 attività per lezione
          └─ 1 sfida personaggio per unità
```

### Unità — focus progressivo
Le 5 unità di ogni tema seguono un focus pedagogico progressivo:

| Unità | Focus |
|---|---|
| U1 | Introduzione vocaboli |
| U2 | Costruzione frasi |
| U3 | Uso in contesto |
| U4 | Simulazione |
| U5 | Consolidamento + WHY |

### Lezioni — format progressivo
Le 6 lezioni di ogni unità seguono un format progressivo:

| Lezione | Format |
|---|---|
| L1 | Onboarding Game |
| L2 | Memory + Build |
| L3 | Story Mode |
| L4 | Simulation |
| L5 | WHY Focus |
| L6 | Challenge Prep |

### Vocabolario — distribuzione
- L1: 3 parole nuove
- L2: 3 parole nuove
- L3-L6: reinforcement (nessuna parola nuova)
- **6 parole per unità × 5 unità = 30 parole per tema**

### Numeri complessivi
- Per unità: 48 attività (6 × 8) + 1 sfida = 49 esercizi
- Per tema: 240 attività + 5 sfide = 245 esercizi
- Per livello A1: 50 × 245 = **12.000 attività + 250 sfide = ~12.250 esercizi**
- Per 6 livelli: ~73.500 esercizi totali
- Vocaboli per livello: 50 × 30 = **1.500 parole**

---

## 3. Le 8 attività standard

Ogni lezione contiene 8 attività. Ogni attività compare almeno una volta per unità. I tipi:

| # | Nome | Stato attuale | Note |
|---|---|---|---|
| 1 | Match | ✅ Esiste (VocabMatch + abbina_coppia) | Riuso componente |
| 2 | MCQ | ✅ Esiste (multipla) | Riuso componente |
| 3 | Listen | ✅ Esiste (ascolta_scegli) | Riuso componente |
| 4 | Build sentence | ✅ Esiste (word_bank) | Riuso componente |
| 5 | Fill gap | ✅ Esiste (fill_blank) | **Modifica**: frase EN sempre completa |
| 6 | Decision | ⚠️ Esiste parzialmente (tap_right) | **Da ridisegnare** |
| 7 | Pattern/WHY | ❌ Nuovo | **Da progettare da zero** |
| 8 | Dialogue | ⚠️ Esiste ma usato poco (DomandaDialogo) | **Da potenziare** |

Le 3 attività con maggior lavoro di design (#6, #7, #8) sono il focus della fase P2 della roadmap.

---

## 4. Distribuzione attività — 3 versioni per progressione A1

Le 8 attività si distribuiscono nelle 6 lezioni con pesi diversi in base al tema (progressione interna ad A1).

### Principi di progettazione
1. Ogni lezione ha esattamente 8 attività
2. Ogni attività compare almeno una volta per unità
3. Il format della lezione detta le attività dominanti
4. Progressione difficoltà: L1 riconoscimento → L5 applicazione
5. Pattern/WHY non compare in L1-L2
6. Dialogue non compare in L1

### Profilo complessivo delle 3 versioni (su 48 attività per unità)

| Categoria | SOFT (temi 1-10) | STANDARD (temi 11-30) | ADVANCED (temi 31-50) |
|---|---|---|---|
| Ricettive (Match+MCQ) | 37% (18) | 31% (15) | 23% (11) |
| Medie (Listen+Build+Fill) | 40% (19) | 42% (20) | 40% (19) |
| Produttive (Decision+WHY+Dialogue) | 23% (11) | 27% (13) | 37% (18) |

### Versione SOFT — temi 1-10

| Lezione | Match | MCQ | Listen | Build | Fill | Decision | WHY | Dialogue | Tot |
|---|---|---|---|---|---|---|---|---|---|
| L1 Onboarding | 4 | 2 | 1 | 1 | 0 | 0 | 0 | 0 | 8 |
| L2 Memory+Build | 2 | 2 | 1 | 2 | 1 | 0 | 0 | 0 | 8 |
| L3 Story | 2 | 1 | 2 | 1 | 1 | 0 | 0 | 1 | 8 |
| L4 Simulation | 1 | 1 | 1 | 1 | 1 | 2 | 0 | 1 | 8 |
| L5 WHY Focus | 0 | 1 | 1 | 1 | 1 | 1 | 2 | 1 | 8 |
| L6 Challenge Prep | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 8 |
| **Totale unità** | **10** | **8** | **7** | **7** | **5** | **4** | **3** | **4** | **48** |

### Versione STANDARD — temi 11-30

| Lezione | Match | MCQ | Listen | Build | Fill | Decision | WHY | Dialogue | Tot |
|---|---|---|---|---|---|---|---|---|---|
| L1 Onboarding | 3 | 2 | 1 | 1 | 1 | 0 | 0 | 0 | 8 |
| L2 Memory+Build | 2 | 1 | 1 | 2 | 2 | 0 | 0 | 0 | 8 |
| L3 Story | 1 | 1 | 2 | 1 | 1 | 1 | 0 | 1 | 8 |
| L4 Simulation | 1 | 1 | 1 | 1 | 0 | 2 | 0 | 2 | 8 |
| L5 WHY Focus | 0 | 1 | 1 | 1 | 1 | 1 | 2 | 1 | 8 |
| L6 Challenge Prep | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 8 |
| **Totale unità** | **8** | **7** | **7** | **7** | **6** | **5** | **3** | **5** | **48** |

### Versione ADVANCED — temi 31-50

| Lezione | Match | MCQ | Listen | Build | Fill | Decision | WHY | Dialogue | Tot |
|---|---|---|---|---|---|---|---|---|---|
| L1 Onboarding | 3 | 1 | 1 | 1 | 1 | 1 | 0 | 0 | 8 |
| L2 Memory+Build | 1 | 1 | 1 | 2 | 2 | 1 | 0 | 0 | 8 |
| L3 Story | 1 | 1 | 2 | 1 | 0 | 1 | 0 | 2 | 8 |
| L4 Simulation | 0 | 1 | 1 | 1 | 0 | 2 | 1 | 2 | 8 |
| L5 WHY Focus | 0 | 0 | 1 | 1 | 1 | 1 | 3 | 1 | 8 |
| L6 Challenge Prep | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 8 |
| **Totale unità** | **6** | **5** | **7** | **7** | **5** | **7** | **5** | **6** | **48** |

---

## 5. Regola personaggi

### Principio generale
Mario è **onnipresente** ma con ruolo che varia per unità. Ogni unità (oltre Mario) ha **un solo co-protagonista**.

### Regola operativa (finale, confermata)

- **U1 di ogni tema**: Mario conduce TUTTE le 48 attività (L1-L6, tutti gli 8 tipi)
- **U2, U3, U4**: Mario conduce SOLO Match + MCQ in tutte le lezioni; il resto è condotto dal personaggio boss dell'unità precedente
- **U5**: Mario conduce Match + MCQ + sfida finale; il resto lo conduce il personaggio boss di U4

### Regola sfide finali

La sfida di fine-unità è sempre **teaser del personaggio dell'unità successiva**:

| Sfida | Condotta da | Teaser di |
|---|---|---|
| Fine U1 | Personaggio A | U2 (A diventa co-protagonista) |
| Fine U2 | Personaggio B | U3 |
| Fine U3 | Personaggio C | U4 |
| Fine U4 | Personaggio D | U5 |
| Fine U5 | **Mario** | Chiusura tema |

### Numero personaggi per tema
**5 totali**: Mario + 4 altri (A, B, C, D).

### Conteggio attività per tema (versione SOFT)

| Personaggio | Attività condotte |
|---|---|
| Mario | U1 intera (48) + Match+MCQ di U2-U5 (18 × 4 = 72) + sfida U5 = **~121 attività** |
| A (U2 + sfida U1) | 30 attività U2 + 10 sfida = ~40 |
| B (U3 + sfida U2) | 30 + 10 = ~40 |
| C (U4 + sfida U3) | 30 + 10 = ~40 |
| D (U5 + sfida U4) | 30 + 10 = ~40 |

Mario = protagonista narrativo (~50%). 4 personaggi = colore emotivo ciascuno su 1 unità.

---

## 6. Tema 1 "Saluti" — casting definito

### Vocabolario Tema 1 (30 parole, da xlsx)
Base di partenza — i 6 vocaboli fondamentali del tema:
`ciao · buongiorno · buonasera · arrivederci · grazie · per favore`

Le altre 24 parole distribuite nelle 5 unità saranno definite in fase di scrittura pilota.

### Personaggi

| Ruolo | Personaggio | Età | Origine | Registro |
|---|---|---|---|---|
| Protagonista narrativo fisso | **Mario** | 45 | Napoli | Accogliente |
| Co-protagonista U2 (= boss U1) | **Sofia** | 26 | Bologna | Informale (Ciao) |
| Co-protagonista U3 (= boss U2) | **Emma** ⚠️ ex Patricia | 58 | Miami | Formale (Buongiorno) |
| Co-protagonista U4 (= boss U3) | **Hans** | 42 | Monaco | Formale europea |
| Co-protagonista U5 (= boss U4) | **Yuki** | 27 | Osaka | Contrasto culturale |
| Boss finale U5 | **Mario** | — | — | Chiusura tema |

### Contrasti narrativi
- Italia-giovane (Sofia) vs Italia-adulto (Mario) = dualità italiana
- USA-anziana (Emma) vs Germania-mezza età (Hans) = formalità occidentali
- Giappone-giovane (Yuki) = contrasto culturale forte con saluti italiani

---

## 7. Rewards

| Trigger | Reward |
|---|---|
| Completare lezione | XP + ingrediente |
| Completare unità | Piatto 🍝 |
| Completare tema | Esperienza Italia + crediti |

### Sfida — comportamento
- **Non si fallisce mai**. L'utente passa sempre.
- I crediti guadagnati scalano con gli errori:
  - Zero errori → crediti pieni
  - Pochi errori → crediti ridotti
  - Molti errori → crediti minimi (ma si passa)
- Design friendly stile Duolingo

---

## 8. Regole editoriali

### Bilinguismo universale
- Ogni testo visibile ha due righe: italiano prima, inglese dopo
- Mai affiancati, mai su una riga sola
- Vale per: fumetti, domande, opzioni, reazioni, feedback, hint

### Audio TTS
- Solo italiano, mai inglese
- Voce `it-IT`, rate 0.88
- Opzioni: parla solo se `opt.it !== opt.en`

### Formattazione testo
- EN pulito, nessuna parola IT
- **Eccezione**: quando il termine italiano è il focus della domanda, si marca con `«...»`
  - Es: `What does «per favore» mean?`
- Fill gap: la frase EN è **sempre completa** (con la traduzione target); il buco esiste solo in IT
  - Es: IT = `Mi ___ Mario` / EN = `My name is Mario`

### Emoji
- Solo in campi IT (domanda.it, contesto_it, intro_it, frase_it, feedback ok IT)
- **Mai** in campi EN

### Personaggi — voce narrativa
- Alla prima apparizione in una lezione, il personaggio **si presenta in prima persona**
  - Es: *"Ciao, sono il barista Mario. Tutte le conversazioni passano dal mio bar..."*
- Durante gli esercizi, testo neutro
- Personaggi a figura intera (non icone) con 4 espressioni + animazioni

### JSON — vincoli strutturali
- `correct: 0` SEMPRE nei JSON (shuffle a runtime)
- Boss/sfida usa solo lessico insegnato nell'unità

### Feedback
- Template `❌ → ✅ + REGOLA + analogia EN`
- Il feedback menziona la parola chiave della risposta corretta
- Max 2 righe
- Pattern/WHY è una attività dedicata alla regola, NON una sezione del feedback generico

---

## 9. Motore — decisioni invariate dal progetto attuale

Tutto il seguente è **ereditato dal codice esistente** e resta valido:

- Stack: Next.js 16, React 19, Vercel, localStorage, Web Speech API
- Sistema XP / energia / crediti (formule, cap, travelAccess)
- Streak settimanale (Lun→Dom, ≥2 lezioni/giorno)
- Sistema reward foods (slot colazione/fine_colazione/pranzo/aperitivo/cena/dolce)
- ItalyTravelModal (Capitali 🏛️ / Città 🏙️ / Mete 🗺️)
- Biblioteca con 30 schede grammatica (1800 esercizi)
- Dashboard + mappa Italia PNG
- Taxonomy semantica `context↔answer` (data/taxonomy/semantic-coherence-A1.yaml)
- Validator pre-commit (scripts/validate-lessons.py, 9 check attivi)
- Design system (colori già definiti)

**Nota**: alcuni aspetti del motore andranno estesi per supportare la nuova matrice (es. schema JSON per format lezione, nuove attività). Ma non si riscrivono da zero.

---

## 10. Cambi di nome

| Vecchio | Nuovo | Impatto |
|---|---|---|
| Patricia | **Emma** | Cambiare ID chiave in `data/config/personaggi.json` da `patricia` a `emma`. Aggiornare tutti i riferimenti nei JSON lezioni esistenti. Aggiornare avatar se già prodotti. |

Lista personaggi aggiornata (15):
`mario · sofia · zac · gino · matilde · vittoria · tamara · yuki · rafael · chenwei · jack · oliver · emma · priya · hans`

---

## 11. Roadmap implementazione

### Stato al 20/4/2026

| Tappa | Descrizione | Stato |
|---|---|---|
| P3 | Distribuzione 8 attività × 6 lezioni (3 versioni) | ✅ DONE |
| P4 | Regola personaggi | ✅ DONE |
| P4bis | Casting Tema 1 Saluti | ✅ DONE |
| P1 | Schema JSON nuova matrice | ⏭️ NEXT |
| P2 | Design 3 attività nuove (Decision, WHY, Dialogue) | ⏭️ NEXT |
| S4 | Scrittura pilota U1 Tema 1 | ⏭️ DOPO P1+P2 |

### Sessioni stimate per vedere pilota U1 live
4-5 sessioni. Dopo:
- Se U1 funziona → scrivere U2-U5 del Tema 1 in autonomia (Claude Code)
- Se Tema 1 funziona → validare, poi scalare ai restanti 49 temi A1
- Se A1 funziona → avviare A2

### Altro lavoro non coperto qui
Le modifiche parallele (dark mode, tokenizzazione colori, bonifica contenuto A1 esistente, estensione taxonomy, modifica componente PersonaggioBubble) sono rimandate a un flusso separato.

---

## 12. Cosa NON è stato deciso in questa sessione

Per evitare false certezze. Questi punti restano aperti:

1. **Schema JSON dettagliato della nuova matrice** → lo definiamo in P1
2. **UI e shape JSON di Decision, Pattern/WHY, Dialogue** → lo definiamo in P2
3. **Strategia migrazione A1 esistente** → il contenuto A1 attuale (15 temi × 2 unità × 5 lezioni) resta invariato? Si ri-organizza? Si butta? Decisione da prendere dopo pilota.
4. **Come la nuova matrice si integra col motore attuale** → serve decisione tecnica su routing, lessone-loader, componenti refactor
5. **Dark mode e tokenizzazione colori** → scope separato, non in questa decisione
6. **Revisione lista 50 temi A1** → accettata per il pilota, revisione CEFR rimandata
7. **Gestione avatar personaggi (4 espressioni + animazioni)** → da implementare dopo design pilota
8. **Mario a figura intera vs icona** → asset già prodotti (immagini Gemini ricevute), da integrare in P2

### Checklist "cosa serve prima di partire col pilota"

- [ ] P1: schema JSON definitivo della lezione v2 (campi format, activity_type, reward, challenge)
- [ ] P2: design completo delle 3 attività nuove (Decision, Pattern/WHY, Dialogue)
- [ ] Decisione su migrazione contenuto A1 esistente (separata)
- [ ] Avatar Mario + Sofia + Emma + Hans + Yuki in 4 espressioni (asset pipeline)

---

## Firma sessione

**Chat sorgente**: sessione 20 aprile 2026, ~2 ore di conversazione.
**Decisioni prese**: 12 grandi, tutte documentate qui.
**Prossima sessione**: P1 schema JSON (o P2 design attività, se si preferisce).
**Commit suggerito**: `docs(architettura): v2 matrice contenuto + regola personaggi + casting tema 1`
