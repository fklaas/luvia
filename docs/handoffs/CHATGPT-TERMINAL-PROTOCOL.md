# Verbindliches ChatGPT↔PowerShell-Protokoll

Stand: 2026-09-03

## Grundmodell

Der normale ChatGPT-Chat besitzt keinen direkten Zugriff auf Repository,
Terminal, Browser, Cloudflare oder Supabase. Er analysiert, plant und formuliert
exakte Befehle. Der Nutzer führt sie in PowerShell aus und kopiert die Ausgabe
zurück. Erst diese zurückkopierte Ausgabe ist Evidenz.

## Format jeder Terminalanweisung

ChatGPT gibt immer genau einen in sich geschlossenen PowerShell-Block aus und
rahmt ihn außerhalb des Codeblocks so ein:

**TERMINAL — AB HIER KOPIEREN**

```powershell
Set-Location -LiteralPath 'C:\Users\fabia\Documents\GitHub\luvia-integration'
Write-Output '===== ERGEBNIS AB HIER KOPIEREN ====='
# genau ein begrenzter Arbeits- oder Prüfschritt
Write-Output '===== ERGEBNIS BIS HIER KOPIEREN ====='
```

**TERMINAL — BIS HIER KOPIEREN**

Die beiden äußeren fettgedruckten Zeilen werden nicht ins Terminal kopiert. Die
inneren `Write-Output`-Marker werden ausgeführt. Der Nutzer kopiert anschließend
alles von `ERGEBNIS AB HIER KOPIEREN` bis einschließlich
`ERGEBNIS BIS HIER KOPIEREN` in den Chat zurück.

ChatGPT wartet danach auf die Ausgabe. Es gibt nicht mehrere abhängige
Befehlsblöcke im Voraus aus und behauptet nie ein Ergebnis, bevor es vorliegt.

## Erster Bootstrap-Befehl im neuen Chat

Der erste ChatGPT-Schritt muss genau diesen read-only Kontextabruf liefern:

**TERMINAL — AB HIER KOPIEREN**

```powershell
Set-Location -LiteralPath 'C:\Users\fabia\Documents\GitHub\luvia-integration'
Write-Output '===== ERGEBNIS AB HIER KOPIEREN ====='
Write-Output '=== GIT-ZUSTAND ==='
git branch --show-current
git rev-parse HEAD
git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>$null
git rev-list --left-right --count '@{u}...HEAD' 2>$null
git status --short
Write-Output '=== AKTUELLE UEBERGABE ==='
Get-Content -LiteralPath 'HANDOFF-NORMAL-CHATGPT-CURRENT.md' -Raw
Write-Output '=== AKTIVER KARTEN-SLICE ==='
Get-Content -LiteralPath 'docs\handoffs\CURRENT-MAP-MINI-INFO-SLICE.md' -Raw
Write-Output '===== ERGEBNIS BIS HIER KOPIEREN ====='
```

**TERMINAL — BIS HIER KOPIEREN**

## Arbeitsregeln für ChatGPT

1. Ergebnis zuerst erklären, danach nur den nächsten begrenzten Befehl geben.
2. Vor einer Änderung Branch, HEAD, Upstream, Divergenz und Worktree prüfen.
3. Bereits vorhandene Änderungen und unversionierte Nutzerdateien bewahren.
4. Bei der Suche zuerst `rg` beziehungsweise `rg --files` verwenden.
5. Dateien vor einer Änderung vollständig beziehungsweise in klar benannten
   relevanten Abschnitten lesen. `AGENTS.md` und untergeordnete Anweisungen sind
   bindend.
6. Keine konkurrierenden Core-, Store-, Map-, Sheet- oder Modal-Systeme bauen.
7. Diagnose und Implementierung trennen: erst Ursache belegen, dann kleinsten
   Owner-konformen Slice ändern.
8. Nach einer Änderung den exakten Diff, Syntax, fokussierte Tests und danach
   die kontrollierte Regression prüfen.
9. Version, Bundles, Inventare und Dokumentation nur gemeinsam aktualisieren.
10. Ein öffentliches Ergebnis benötigt echte Browser-/Gerätebedienung,
    Deploymentstatus, Bytebeleg und Rollback; HTTP 200 allein genügt nicht.
11. Nutzerfeedback ist Gegenbeleg. Ein zuvor grüner Test macht eine sichtbar
    abgelehnte Oberfläche nicht fertig.

## Sichere Dateiänderungen im manuellen Modus

ChatGPT liefert kleine, überprüfbare Änderungen als Unified Diff. Der
PowerShell-Block legt den Patch nur in einer aufgabenspezifischen Variablen ab,
prüft ihn zuerst mit `git apply --check` und wendet ihn erst danach mit
`git apply` an. Danach werden `git diff --check` und der begrenzte Diff
ausgegeben. Bei einem fehlgeschlagenen Check wird nicht mit einem alternativen
Blindschreibbefehl weitergemacht.

Mechanische Generatoren oder bestehende Buildskripte dürfen ihre vorgesehenen
Artefakte schreiben. Freie Such-und-Ersetz-Aktionen über das ganze Repository
sind nicht erlaubt.

## Prüf- und Commitgrenze

Vor einem Commit muss die zurückkopierte Ausgabe mindestens enthalten:

- `git status --short`;
- `git diff --check`;
- `git diff --stat`;
- fokussierte Testergebnisse;
- vollständige Safe Regression, wenn Runtime/Consumer betroffen ist;
- NFR-0;
- aktualisierte Inventare/Bundles bei einer Versionsänderung;
- ausdrückliche Liste der zu commitenden Pfade.

ChatGPT formuliert den `git add`-Befehl mit expliziten Pfaden. Es verwendet
nicht pauschal `git add .`, wenn fremde unversionierte Dateien existieren.

## Deploymentgrenze

- Ohne ausdrücklichen Auftrag wird nicht deployed.
- Integration heißt immer `integration-luvia`.
- Jeder Wrangler-Befehl enthält ausdrücklich `--name integration-luvia`.
- `--name luvia` ist ohne gesonderten Produktionsauftrag verboten.
- Vor dem Deploy: sauberer Commit, sauberes Git-Archiv, Versionskonsistenz,
  vollständige Tests und bekannter Rollback.
- Nach dem Deploy: `npx wrangler deployments status --name integration-luvia`,
  öffentlicher Versionsabruf, öffentliche Bedienung und Bytevergleich.
- Ein Nachfolge-Slice von `.167` verwendet für App-only-Rollback:

```powershell
npx wrangler versions deploy b2ab956a-729f-402a-8d3d-56778614d61a@100 --name integration-luvia --message "Rollback map/mini-info successor to App 13.82.168" --yes
```

Dieser Rollback wird nur bei einem tatsächlich abgelehnten/defekten Deploy und
nach eindeutiger Zielprüfung ausgeführt.

## Verbotene Ausgaben und Aktionen

- keine `.env`-Inhalte, Secret-Listen oder vollständigen Umgebungsvariablen;
- keine Tokens, Passwörter, Steuer- oder Zahlungsdaten;
- kein `git reset --hard`, `git clean -fd`, Force Push oder breite Löschung;
- keine DB-/RLS-/Edge-/Secret-Mutation ohne eigene Autorisierung und Recovery;
- kein Production-Deploy als Nebenwirkung eines Integration-Befehls;
- keine erfundenen PASS-, Provider-, Preis-, Buchungs- oder
  Nutzerakzeptanzbehauptungen.
