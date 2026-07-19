# optionstudy

Interfaccia per OptionStrat

## OptionStrat Strategy Builder

Applicazione web per costruire strategie di opzioni e aprirle direttamente su OptionStrat.com in una nuova tab.

### Funzionalità
- **Sinistra (80%)**: Anteprima live della strategia costruita con tutte le opzioni aggiunte
- **Destra (20%)**: Controlli per aggiungere opzioni
  - Casella ticker (es. AAPL, XSP)
  - Casella scadenza (formato YYMMDD, es. 260430)
  - Pulsanti: Compra PUT, Vendi PUT, Compra CALL, Vendi CALL
  - Caselle per strike e prezzo (prezzo opzionale)
  - Visualizzazione URL di OptionStrat in tempo reale
  - Pulsante "Apri su OptionStrat" per aprire la strategia in una nuova tab

### Come usare
1. Avvia il server: `python3 -m http.server 8000` nella directory del progetto
2. Apri http://localhost:8000 in un browser
3. Compila ticker, scadenza e strike
4. Clicca sui pulsanti per aggiungere opzioni alla estrategia
5. Visualizza l'anteprima della strategia sulla sinistra
6. (Opzionale) Inserisci il prezzo per ogni opzione
7. Clicca **"Apri su OptionStrat"** per aprire la strategia in una nuova tab con OptionStrat.com

### Formato della scadenza
- YYMMDD (es. 260430 = 30 aprile 2026)
- 260402 = 2 aprile 2026

### Export
- Puoi copiare l'URL dal box "URL Preview" e condividerlo con altri
- L'URL contiene tutta la configurazione della strategia
