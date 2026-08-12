# TEST v13.80.1

1. Open Control → Inbox → existing conversation.
2. Enter non-empty text.
3. Click **Senden**.
4. Immediately expect inline `Antwort wird versendet …` feedback.
5. On success expect `Antwort wurde erfolgreich versendet.` and persisted message after reload.
6. On failure expect the exact backend error inline.
7. Verify clicking Senden and native form submit route into the same `sendFromForm()` implementation.
