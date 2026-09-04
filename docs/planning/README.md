# Luvia konsolidierte Arbeitsplanung

Stand 4. September 2026. A1 Dokumentkonsolidierung ist abgeschlossen. A2 sichtbare B1-Abnahme ist begonnen und hat einen konkreten P03-Gegenbeleg geliefert. Kein Runtime-Fix und kein neuer App-/Gateway-Deploy gehören zu diesem Dokument-Slice.

- [Masterfahrplan v6](MASTERFAHRPLAN-v6.md): konsolidierter gültiger Umfang und Gesamtweg bis M22, alle P01–P50 und detaillierte bestehende M18-Blueprints.
- [Statusplan](STATUSPLAN-2026-09-04.md): einzelne Paketstände, Grenzen und nächste Abschlussnachweise.
- [Statusdaten](status-plan.v1.json): dieselben 50 Pakete als maschinenlesbare Daten.
- [Aktuelle sichtbare B1-Abnahme](B1-END-TO-END-ACCEPTANCE-2026-09-04.md): Places-Karte und Tagesplan-Read positiv, Chat-Places-Suche offen, keine Mutation als bestanden behauptet.
- [Quellenherkunft](source-provenance-2026-09-04.json): vier Nutzerquellen unverändert erhalten, mit SHA-256 und ursprünglicher Master-Kapitelübersicht.
- [Vorheriger aktiver Dokumentstand](archive/2026-09-04-before-consolidation/README.md): zwölf unveränderte Repository-Dokumente vor der Konsolidierung.

Die Word-Ausgaben liegen in C:/Users/fabia/Documents/ChatGPT/Luvia/outputs/LUVIA_Planstand_2026-09-04. Master: 29 Seiten. Normaler ChatGPT-Handoff und Codex-Handoff: jeweils 3 Seiten. Die drei Dateien wurden in Microsoft Word paginiert, mit dem Documents-Skill-Renderer als PNG ausgegeben und seitenweise visuell kontrolliert. Der technische Export ist scripts/export-masterplan-docx.py; er wird mit dem gebündelten Dokument-Python ausgeführt.

Die Vollständigkeitsprüfung vergleicht alle 50 Pakete, technischen Umfänge, Statusbelege und nächsten Abschlussnachweise zwischen JSON, Statusplan und Master. 16 Archivquellen sind per Hash geprüft. Die Werte 210/210 und 18/18 sind ausdrücklich frühere .37-Runtime-Belege; es wurde keine neue volle Runtime-Regression für reine Dokumentänderungen behauptet.

Pflege: zuerst die tatsächlich gemessenen Fakten und betroffenen Pakete aktualisieren, danach alle aktiven Lesefassungen und Word-Exporte gemeinsam aktualisieren. Alte Quellen bleiben historisch. Der aktuelle Nutzerauftrag und tatsächlich vorhandene Werkzeuge bestimmen den Arbeitsmodus; alte Handoffs dürfen keine bereits erteilte Autorisierung aufheben.
