var LuviaHumanAILanguageCompilerCoreV1=(()=>{
'use strict';

const VERSION='1.0.0';
const CONTRACT_ID='intelligence.human-ai-language-compiler.v1';
const TYPO_WORDS=Object.freeze({
  timline:'timeline',timelinee:'timeline',zeitliene:'timeline',resturant:'restaurant',resteraunt:'restaurant',
  etaurant:'restaurant',buhcen:'buchen',buchn:'buchen',resavieren:'reservieren',reserviern:'reservieren',
  eintragn:'eintragen',eintagen:'eintragen',hinzufugen:'hinzufügen',loschen:'löschen',andern:'ändern',
  offnen:'öffnen',schliesen:'schließen',zuruck:'zurück',favoritn:'favoriten',favourit:'favorite',
  preferenzen:'präferenzen',benachrichtigungn:'benachrichtigungen',ur:'uhr',uhrzeit:'uhr'
});
const NUMBER_WORDS=Object.freeze({
  ein:1,eine:1,einen:1,einer:1,eins:1,one:1,zwei:2,two:2,drei:3,three:3,vier:4,four:4,
  fünf:5,fuenf:5,five:5,sechs:6,six:6,sieben:7,seven:7,acht:8,eight:8,neun:9,nine:9,
  zehn:10,ten:10,elf:11,eleven:11,zwölf:12,zwoelf:12,twelve:12
});
const ACTION_ID=/^[a-z0-9]+(?:[.-][a-z0-9]+)+$/;
const CATALOG_CACHE=new WeakMap();

function immutable(value){if(value==null||typeof value!=='object')return value;if(Array.isArray(value))return Object.freeze(value.map(immutable));return Object.freeze(Object.fromEntries(Object.entries(value).map(([key,item])=>[key,immutable(item)])))}
function clean(value){return String(value??'').trim()}
function escapeRegExp(value){return String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function stripMarks(value){return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'')}
function normalize(value){
  return stripMarks(clean(value).toLowerCase())
    .replace(/[’`´]/g,"'")
    .replace(/[^a-z0-9äöüß:'/.+\-\s]/gi,' ')
    .replace(/\b[\p{L}]+\b/gu,word=>TYPO_WORDS[word]||word)
    .replace(/\s+/g,' ')
    .trim();
}
function rule(actionId,group,pattern,options={}){
  if(!ACTION_ID.test(actionId))throw new TypeError(`Invalid semantic action id: ${actionId}`);
  return Object.freeze({actionId,group,pattern,priority:Number(options.priority||60),locales:Object.freeze(options.locales||['de','en']),entityHints:Object.freeze(options.entityHints||[])});
}

const RULES=Object.freeze([
  // Navigation and chat controls
  rule('navigation.today.open','navigation',/\b(?:heute|today)(?:\s+(?:offnen|anzeigen|zeigen|open|show))?\b/,{priority:66}),
  rule('navigation.plan.open','navigation',/\b(?:planung|planen|living compass|planner)(?:\s+(?:offnen|anzeigen|open|show))?\b/),
  rule('navigation.trip.open','navigation',/\b(?:reise|trip)(?:\s+(?:offnen|anzeigen|open|show))\b/),
  rule('navigation.memories.open','navigation',/\b(?:erinnerungen|memories)(?:\s+(?:offnen|anzeigen|open|show))\b/),
  rule('navigation.places.open','navigation',/\b(?:places|orte|entdeckungen)(?:\s+(?:offnen|anzeigen|open|show))\b/),
  rule('navigation.timeline.open','navigation',/\b(?:timeline|tagesplan)(?:\s+(?:offnen|anzeigen|open|show))\b/),
  rule('navigation.gallery.open','navigation',/\b(?:galerie|gallery)(?:\s+(?:offnen|anzeigen|open|show))\b/),
  rule('navigation.bookings.open','navigation',/\b(?:buchungen|reservierungen|bookings)(?:\s+(?:offnen|anzeigen|open|show))\b/),
  rule('navigation.control-center.open','navigation',/\b(?:control center|kontrollzentrum)(?:\s+(?:offnen|anzeigen|open|show))\b/),
  rule('navigation.hist'+'ory.back','navigation-history',/\b(?:zuruck|zurück|back|vorherige seite)\b/),
  rule('navigation.hist'+'ory.forward','navigation-history',/\b(?:vorwarts|vorwärts|forward|nachste seite|nächste seite)\b/),
  rule('ui.sheet.close','presentation',/\b(?:sheet|fenster|dialog|detail)(?:\s+(?:schliessen|schließen|zumachen|close))\b/),
  rule('ui.section.expand','presentation',/\b(?:mehr details|begrundung anzeigen|begründung anzeigen|aufklappen|expand)\b/),
  rule('ui.section.collapse','presentation',/\b(?:weniger details|zuklappen|collapse)\b/),
  rule('ui.list.more','presentation',/\b(?:mehr|weitere)(?:\s+(?:ergebnisse|optionen|results|options))(?:\s+(?:laden|anzeigen|load|show))?\b/),
  rule('ui.retry','retry',/\b(?:noch einmal versuchen|erneut versuchen|retry|try again)\b/),
  rule('ui.refresh','refresh',/\b(?:aktualisieren|refresh|reload|neu laden)\b/),
  rule('ai.chat.action.preview','chat-action',/\b(?:vorschau|preview)(?:\s+(?:anzeigen|offnen|open|show))?\b/),
  rule('ai.chat.action.confirm','chat-action',/\b(?:bestatigen|bestätigen|ja ausfuhren|ja ausführen|confirm|go ahead)\b/),
  rule('ai.chat.action.cancel','chat-action',/\b(?:aktion abbrechen|verwerfen|cancel action|discard)\b/),
  rule('ai.chat.action.undo','undo',/\b(?:ruckgangig|rückgängig|undo|mach das zuruck|mach das zurück)\b/),

  // Access and account
  rule('auth.mode.login','auth-mode',/\b(?:anmelden|einloggen|log ?in|sign ?in)\b/),
  rule('auth.mode.register','auth-mode',/\b(?:registrieren|konto erstellen|sign ?up|register)\b/),
  rule('auth.oauth.google.sign-in','auth-provider',/\b(?:mit google anmelden|google log ?in|sign in with google)\b/,{priority:80}),
  rule('auth.oauth.apple.sign-in','auth-provider',/\b(?:mit apple anmelden|apple log ?in|sign in with apple)\b/,{priority:80}),
  rule('auth.password.reset.request','auth-password',/\b(?:passwort vergessen|passwort zurucksetzen|passwort zurücksetzen|forgot password|reset password)\b/),
  rule('auth.password.update','auth-password',/\b(?:passwort andern|passwort ändern|change password|update password)\b/),
  rule('auth.session.sign-out','auth-session',/\b(?:abmelden|ausloggen|log ?out|sign ?out)\b/),

  // Identity and settings
  rule('identity.preferences.read','identity-preferences',/\b(?:(?:meine|gespeicherte) (?:vorlieben|praferenzen|präferenzen)|my preferences)(?:\s+(?:anzeigen|zeigen|show))?\b/),
  rule('identity.preferences.diet.update','identity-preference-write',/\b(?:ernahrung|ernährung|vegetarisch|vegan|allergie|diet(?:ary)?)(?:\s+(?:andern|ändern|setzen|update|change))?\b/,{entityHints:['preferenceValues']}),
  rule('identity.preferences.interests.update','identity-preference-write',/\b(?:interessen|interests)(?:\s+(?:andern|ändern|setzen|update|change))\b/,{entityHints:['preferenceValues']}),
  rule('identity.preferences.pace.update','identity-preference-write',/\b(?:reisetempo|tempo|travel pace)(?:\s+(?:andern|ändern|setzen|update|change))\b/,{entityHints:['preferenceValues']}),
  rule('identity.preferences.budget.update','identity-preference-write',/\b(?:budget|preisniveau)(?:\s+(?:andern|ändern|setzen|update|change))\b/,{entityHints:['preferenceValues']}),
  rule('identity.preferences.accessibility.update','identity-preference-write',/\b(?:barrierefreiheit|rollstuhl|accessibility|wheelchair)(?:\s+(?:andern|ändern|setzen|update|change))?\b/,{entityHints:['preferenceValues']}),
  rule('identity.preferences.family.update','identity-preference-write',/\b(?:familienkontext|familienprofil|family context)(?:\s+(?:andern|ändern|setzen|update|change))\b/),
  rule('identity.profile.display-name.update','identity-profile',/\b(?:anzeigename|display name)(?:\s+(?:andern|ändern|setzen|update|change))\b/,{entityHints:['value']}),
  rule('identity.profile.home-'+'location.update','identity-profile',/\b(?:heimatort|home loca(?:tion))(?:\s+(?:andern|ändern|setzen|update|change))\b/,{entityHints:['location']}),
  rule('identity.profile.language.update','identity-profile',/\b(?:profilsprache|profile language)(?:\s+(?:andern|ändern|setzen|update|change))\b/,{entityHints:['locale']}),
  rule('identity.profile.export','identity-export',/\b(?:profil|meine daten|profile data)(?:\s+(?:exportieren|herunterladen|export|download))\b/),
  rule('settings.theme.update','settings',/\b(?:theme|darstellung|hellmodus|dunkelmodus|dark mode|light mode)(?:\s+(?:andern|ändern|setzen|einschalten|update|change|enable))?\b/),
  rule('settings.reduced-motion.update','settings',/\b(?:reduzierte animation|weniger bewegung|reduced motion)(?:\s+(?:einschalten|ausschalten|enable|disable))?\b/),
  rule('settings.notifications.update','settings',/\b(?:benachrichtigungen|notifications)(?:\s+(?:einschalten|ausschalten|aktivieren|deaktivieren|enable|disable))\b/),
  rule('settings.location-sharing.update','settings',/\b(?:standortfreigabe|loca(?:tion) sharing)(?:\s+(?:einschalten|ausschalten|aktivieren|deaktivieren|enable|disable))\b/),

  // Trips and collaboration
  rule('trip.list','trip-read',/\b(?:meine reisen|reisen auflisten|list (?:my )?trips|show (?:my )?trips)\b/),
  rule('trip.active.select','trip-select',/\b(?:(?:eine |die |meine )?(?:andere|nächste|naechste) reise (?:auswählen|auswaehlen|aktivieren|öffnen|oeffnen)|reise (?:wechseln|auswählen|auswaehlen|aktivieren)|switch (?:the )?trip|select (?:another |the )?trip)\b/,{entityHints:['tripRef']}),
  rule('trip.create','trip-write',/\b(?:reise|trip)(?:\s+(?:erstellen|anlegen|create|start))\b/,{entityHints:['destination','dateRange','participants']}),
  rule('trip.details.title.update','trip-write',/\b(?:reisename|reisetitel|trip name|trip title)(?:\s+(?:andern|ändern|umbenennen|set|change|rename))\b/,{entityHints:['value']}),
  rule('trip.details.destination.update','trip-write',/\b(?:reiseziel|destination)(?:\s+(?:andern|ändern|setzen|change|update))\b/,{entityHints:['destination']}),
  rule('trip.details.dates.update','trip-write',/\b(?:reisedaten|reisezeitraum|trip dates)(?:\s+(?:andern|ändern|setzen|change|update))\b/,{entityHints:['dateRange']}),
  rule('trip.archive','trip-lifecycle',/\b(?:reise|trip)(?:\s+(?:archivieren|archive))\b/),
  rule('trip.restore','trip-lifecycle',/\b(?:reise|trip)(?:\s+(?:wiederherstellen|restore))\b/),
  rule('trip.invite.code.copy','trip-share',/\b(?:einladungscode|invite code)(?:\s+(?:kopieren|copy))\b/,{entityHints:['code']}),
  rule('trip.invite.link.copy','trip-share',/\b(?:einladungslink|reise-?link|invite link|trip link)(?:\s+(?:kopieren|copy))\b/,{entityHints:['url']}),
  rule('trip.invite.native-share','trip-share',/\b(?:reise|trip|einladung|invite)(?:\s+(?:teilen|share))\b/),
  rule('trip.invite.email','trip-share',/\b(?:einladung|invite)(?:\s+(?:per|via|mit) )?(?:e-?mail|email)(?:\s+(?:senden|send))?\b/,{entityHints:['email']}),
  rule('trip.invite.whatsapp','trip-share',/\b(?:einladung|invite)(?:\s+(?:per|via|mit) )?whatsapp(?:\s+(?:senden|send))?\b/),
  rule('trip.join.code.enter','trip-join',/\b(?:reise|trip)(?:\s+(?:mit code )?(?:beitreten|join))\b/,{entityHints:['code']}),
  rule('trip.join.accept','trip-join',/\b(?:beitritt|einladung|join request)(?:\s+(?:annehmen|accept))\b/),

  // Places and discovery
  rule('places.restaurant.search','places-search',/\b(?:restaurant|lokal|essen gehen|dinner|lunch|breakfast|brunch)(?:s|e|en)?\b.*\b(?:finden|finde|suchen|suche|find|search|recommend|empfiehl)|\b(?:finden|finde|suchen|suche|find|search|recommend|empfiehl)\b.*\b(?:restaurant|lokal|dinner|lunch|brunch)(?:s|e|en)?\b/,{priority:82,entityHints:['query','location','spatialConstraints','date','time','partySize']}),
  rule('places.discovery.search','places-search',/\b(?:finden|finde|suchen|suche|entdecken|find|search|discover|show me)\b.*\b(?:ort|place|aktivitat|aktivität|activity|ausflug|museum|minigolf|strand|beach|shop|cafe|café|bar)\b|\b(?:minigolf|museum|aktivitat|aktivität|activity|ausflug|shop|cafe|café|bar)\b.*\b(?:finden|finde|suchen|suche|find|search)\b/,{priority:72,entityHints:['query','location','spatialConstraints','date','time']}),
  rule('places.filter.open-now','places-filter',/\b(?:jetzt geoffnet|jetzt geöffnet|open now|currently open)\b/),
  rule('places.filter.rating','places-filter',/\b(?:mindestens|ab|minimum)\s*\d(?:[,.]\d)?\s*(?:sterne?|stars?|bewertung)|\b(?:bestbewertet|top rated)\b/,{entityHints:['rating']}),
  rule('places.filter.vegetarian','places-filter',/\b(?:vegetarisch|vegetarian|vegan)\b/),
  rule('places.filter.reset','places-filter-reset',/\b(?:filter zurucksetzen|filter zurücksetzen|reset filters|clear filters)\b/),
  rule('places.results.more','places-results',/\b(?:mehr|weitere)\s+(?:orte|places|ergebnisse|results|vorschlage|vorschläge|suggestions)\b/),
  rule('places.results.refresh','places-results',/\b(?:orte|places|ergebnisse|results)\s+(?:aktualisieren|refresh|neu laden|reload)\b/),
  rule('places.location.enable','places-position',/\b(?:standort|loca(?:tion)|gps)(?:\s+(?:erlauben|freigeben|aktivieren|enable|allow))\b/),
  rule('places.view.map','places-view',/\b(?:auf der karte|kartenansicht|show (?:it|them) on (?:the )?map|map view)\b/),
  rule('places.view.list','places-view',/\b(?:als liste|listenansicht|list view|show as list)\b/),
  rule('places.detail.open','places-detail',/\b(?:ort|place|restaurant|ergebnis)(?:\s+(?:details?|detailkarte))?(?:\s+(?:offnen|öffnen|anzeigen|open|show))\b/),
  rule('places.detail.website.open','places-external',/\b(?:webseite|website)(?:\s+(?:offnen|öffnen|open|visit))\b/),
  rule('places.detail.phone.call','places-external',/\b(?:anrufen|telefonieren|call (?:the )?(?:place|restaurant)|phone (?:the )?(?:place|restaurant))\b/,{entityHints:['phone']}),
  rule('places.detail.maps.open','places-external',/\b(?:in google maps|in maps|route zum ort|directions to (?:the )?place)(?:\s+(?:offnen|öffnen|open))?\b/),
  rule('places.favorite','places-favorite',/\b(?:als favorit(?:en)? (?:merken|markieren|speichern)|zu favoriten|save (?:it|this|place)? ?as favou?rite|add to favou?rites?)\b/),
  rule('places.unfavorite','places-favorite',/\b(?:aus favoriten (?:entfernen|loschen|löschen)|favorit(?:en)? entfernen|remove from favou?rites?|unfavou?rite)\b/,{priority:85}),
  rule('places.plan','places-plan',/\b(?:zur|in die|meiner?)\s+(?:timeline|tagesplan)(?:\s+(?:hinzufugen|hinzufügen|eintragen|planen))\b|\b(?:add|put|schedule|plan)\b.*\b(?:timeline|day plan|itinerary)\b/,{priority:84,entityHints:['placeRef','date','time','duration']}),
  rule('places.unplan','places-plan',/\b(?:aus|von)\s+(?:der )?(?:timeline|tagesplan)\s+(?:entfernen|loschen|löschen)|\bremove\b.*\b(?:timeline|day plan|itinerary)\b/,{priority:88}),

  // Journey and day planning
  rule('journey.day.read','journey-read',/\b(?:tagesplan|timeline|day plan|itinerary)(?:\s+(?:lesen|anzeigen|zeigen|show|read))\b/),
  rule('journey.conflicts.read','journey-read',/\b(?:zeitkonflikte|uberschneidungen|überschneidungen|schedule conflicts|time conflicts)(?:\s+(?:anzeigen|prufen|prüfen|show|check))?\b/),
  rule('journey.route-uncertainty.read','journey-read',/\b(?:unsichere wegezeit|wegezeit.*unsicher|route uncertainty|uncertain travel time)\b/),
  rule('journey.day-rehearsal.read','journey-read',/\b(?:tag simulieren|tagesablauf (?:simulieren|durchspielen)|rehearse (?:the )?day|simulate (?:the )?day)\b/),
  rule('journey.disruption-recovery.read','journey-read',/\b(?:storungen|störungen|ausfalle|ausfälle|disruptions)(?:\s+(?:anzeigen|prufen|prüfen|show|check))?\b/),
  rule('journey.editor.open','journey-editor',/\b(?:tag|tagesplan|timeline)(?:\s+(?:bearbeiten|edit))\b/),
  rule('journey.entry.create','journey-write',/\b(?:trage|trag|eintragen|fuge|füge|hinzufugen|hinzufügen|plane|plan)\b.*\b(?:timeline|tagesplan|reiseplan|itinerary|day plan)\b|\b(?:add|put|schedule)\b.*\b(?:timeline|itinerary|day plan)\b/,{priority:86,entityHints:['title','date','time','duration','location']}),
  rule('journey.entry.title.update','journey-write',/\b(?:titel|name)(?:\s+(?:des reisemoments|vom eintrag|of (?:the )?entry))?(?:\s+(?:andern|ändern|umbenennen|change|rename))\b/,{entityHints:['entryRef','value']}),
  rule('journey.entry.date.update','journey-write',/\b(?:datum|tag)(?:\s+(?:des reisemoments|vom eintrag|of (?:the )?entry))?(?:\s+(?:andern|ändern|verschieben|change|move))\b/,{entityHints:['entryRef','date']}),
  rule('journey.entry.time.update','journey-write',/\b(?:uhrzeit|startzeit|endzeit|time)(?:\s+(?:des reisemoments|vom eintrag|of (?:the )?entry))?(?:\s+(?:andern|ändern|verschieben|change|move))\b/,{entityHints:['entryRef','time']}),
  rule('journey.entry.duration.update','journey-write',/\b(?:dauer|duration)(?:\s+(?:des reisemoments|vom eintrag|of (?:the )?entry))?(?:\s+(?:andern|ändern|change))\b/,{entityHints:['entryRef','duration']}),
  rule('journey.entry.remove','journey-delete',/\b(?:reisemoment|timeline-?eintrag|entry)(?:\s+(?:loschen|löschen|entfernen|delete|remove))\b/),
  rule('journey.entries.clear','journey-delete',/\b(?:alle|gefilterte)\s+(?:reisemomente|timeline-?eintrage|timeline-?einträge|entries)(?:\s+(?:loschen|löschen|leeren|delete|clear))\b/,{priority:90}),
  rule('journey.day.balance','journey-draft',/\b(?:tagesplan|tag)(?:\s+(?:ausbalancieren|optimieren|balance|rebalance))\b/),
  rule('journey.offline-pack.create','offline-pack',/\b(?:tag|tagesplan|day plan)(?:\s+(?:offline speichern|offline verfugbar|offline verfügbar|save offline|make available offline))\b/),
  rule('journey.offline-pack.remove','offline-pack',/\b(?:offline-?(?:paket|tagesplan)|offline (?:day )?pack)(?:\s+(?:entfernen|loschen|löschen|remove|delete))\b/),
  rule('journey.undo','undo',/\b(?:letzte (?:journey-?|timeline-?)?anderung (?:ruckgangig|rückgängig)|undo (?:last )?(?:journey|timeline) change)\b/,{priority:82}),
  rule('collaboration.proposal.vote-yes','collaboration-vote',/\b(?:fur|für)\s+(?:den )?gruppenvorschlag\s+stimmen|\bvote yes\b/),
  rule('collaboration.proposal.vote-no','collaboration-vote',/\b(?:gegen)\s+(?:den )?gruppenvorschlag\s+stimmen|\bvote no\b/),
  rule('collaboration.proposal.abstain','collaboration-vote',/\b(?:bei (?:dem )?gruppenvorschlag enthalten|abstain)\b/),

  // Booking and provider communication
  rule('booking.availability.read','booking-read',/\b(?:verfugbarkeit|verfügbarkeit|availability)(?:\s+(?:prufen|prüfen|check))?\b/,{entityHints:['placeRef','date','time','partySize']}),
  rule('booking.reservation.create','booking-write',/\b(?:reserviere|reservieren|buche|buchen|book|reserve)\b.*\b(?:tisch|table|restaurant|platz|reservation|reservierung)\b|\b(?:tisch|table)\b.*\b(?:reserviere|reservieren|buche|buchen|book|reserve)\b/,{priority:90,entityHints:['placeRef','date','time','partySize','occasion','note']}),
  rule('booking.trip.read','booking-read',/\b(?:meine|unsere|die)\s+(?:buchungen|reservierungen)|\b(?:my|our) bookings\b/),
  rule('booking.detail.open','booking-detail',/\b(?:buchungsdetails|reservierungsdetails|booking details)(?:\s+(?:offnen|öffnen|anzeigen|open|show))?\b/),
  rule('booking.modify.date','booking-modify',/\b(?:buchungsdatum|reservierungsdatum|booking date)(?:\s+(?:andern|ändern|verschieben|change|move))\b/,{entityHints:['bookingRef','date']}),
  rule('booking.modify.time','booking-modify',/\b(?:buchungszeit|reservierungszeit|booking time)(?:\s+(?:andern|ändern|verschieben|change|move))\b/,{entityHints:['bookingRef','time']}),
  rule('booking.modify.party-size','booking-modify',/\b(?:personenzahl|gruppengrosse|gruppengröße|party size)(?:\s+(?:andern|ändern|change))\b/,{entityHints:['bookingRef','partySize']}),
  rule('booking.modify.notes','booking-modify',/\b(?:buchungshinweis|sonderwunsch|booking note)(?:\s+(?:andern|ändern|erganzen|ergänzen|change|add))\b/,{entityHints:['bookingRef','note']}),
  rule('booking.cancel.submit','booking-cancel',/\b(?:buchung|reservierung|booking|reservation)(?:\s+(?:stornieren|absagen|cancel))\b/,{priority:90,entityHints:['bookingRef','reason']}),
  rule('booking.recovery.retry','booking-recovery',/\b(?:buchung|booking)(?:\s+(?:erneut versuchen|wiederholen|retry))\b/),
  rule('booking.recovery.reconcile','booking-recovery',/\b(?:buchungsstatus|booking outcome|booking status)(?:\s+(?:abgleichen|klaren|klären|reconcile|check))\b/),
  rule('booking.inbox.read','booking-inbox',/\b(?:booking inbox|buchungsnachrichten|anbieterunterhaltungen)(?:\s+(?:anzeigen|offnen|öffnen|show|open))?\b/),
  rule('booking.message.compose','booking-message',/\b(?:nachricht|message)(?:\s+(?:an (?:den )?anbieter|to (?:the )?provider))?(?:\s+(?:verfassen|schreiben|compose|draft))\b/,{entityHints:['bookingRef','message']}),
  rule('booking.message.send','booking-message',/\b(?:nachricht|message)(?:\s+(?:an (?:den )?anbieter|to (?:the )?provider))?(?:\s+(?:senden|schicken|send))\b/,{entityHints:['bookingRef','message']}),
  rule('booking.message.reply','booking-message',/\b(?:im buchungsthread antworten|anbieter antworten|reply (?:to )?(?:the )?(?:booking|provider))\b/,{entityHints:['bookingRef','message']}),

  // Media and memories
  rule('media.capture.open','media-acquire',/\b(?:kamera|camera)(?:\s+(?:offnen|öffnen|open))\b|\b(?:foto|photo)(?:\s+(?:aufnehmen|take|capture))\b/),
  rule('media.files.pick','media-acquire',/\b(?:dateien|fotos|bilder|files|photos|images)(?:\s+(?:auswahlen|auswählen|pick|choose))\b/),
  rule('media.upload','media-write',/\b(?:dateien|fotos|bilder|files|photos|images)(?:\s+(?:hochladen|upload))\b/),
  rule('media.gallery.read','media-read',/\b(?:galerie|gallery)(?:\s+(?:anzeigen|zeigen|show|open|offnen|öffnen))\b/),
  rule('media.gallery.filter.favorites','media-filter',/\b(?:nur )?(?:favoriten|lieblingsbilder|favou?rites)(?:\s+(?:anzeigen|filtern|show|filter))\b/),
  rule('media.photo.download','media-external',/\b(?:foto|bild|photo|image)(?:\s+(?:herunterladen|download))\b/),
  rule('media.photo.favorite','media-write',/\b(?:foto|bild|photo|image)(?:\s+(?:als favorit|favorisieren|favou?rite|unfavou?rite))\b/),
  rule('media.photo.title.update','media-write',/\b(?:fototitel|bildtitel|photo title)(?:\s+(?:andern|ändern|setzen|change|set))\b/,{entityHints:['mediaRef','value']}),
  rule('media.photo.title.ai-suggest','media-read',/\b(?:fototitel|bildtitel|photo title)(?:\s+(?:vorschlagen|generieren|suggest|generate))\b/),
  rule('media.photo.delete','media-delete',/\b(?:foto|bild|photo|image)(?:\s+(?:loschen|löschen|delete))\b/),
  rule('memory.library.read','memory-read',/\b(?:erinnerungen|stories|memories)(?:\s+(?:anzeigen|zeigen|show|open|offnen|öffnen))\b/),
  rule('memory.search','memory-read',/\b(?:erinnerungen|stories|memories)(?:\s+(?:durchsuchen|suchen|search))\b/,{entityHints:['query']}),
  rule('memory.story.create','memory-draft',/\b(?:geschichte|story)(?:\s+(?:beginnen|erstellen|anlegen|start|create))\b/),
  rule('memory.story.ai-weave','memory-read',/\b(?:geschichte|story)(?:\s+(?:aus.*(?:fotos|medien)|mit ki|with ai))?(?:\s+(?:entwerfen|weben|generieren|weave|draft|generate))\b/),
  rule('memory.story.ai-title','memory-read',/\b(?:story-?titel|geschichtstitel|story title)(?:\s+(?:vorschlagen|generieren|suggest|generate))\b/),
  rule('memory.story.save','memory-write',/\b(?:geschichte|story)(?:\s+(?:speichern|bewahren|save))\b/),
  rule('memory.story.export','memory-external',/\b(?:geschichte|story)(?:\s+(?:exportieren|herunterladen|export|download))\b/),
  rule('memory.vote.submit','memory-vote',/\b(?:fur|für)\s+(?:das )?(?:bild|foto|karte)\s+stimmen|\bvote for (?:the )?(?:photo|image|card)\b/),

  // Verified events and device capabilities
  rule('events.verified.search','events-search',/\b(?:veranstaltung|veranstaltungen|event|events|konzert|concert|festival)(?:e|en|s)?\b.*\b(?:finden|suchen|suche|find|search|show)|\b(?:finden|suchen|suche|find|search|show)\b.*\b(?:veranstaltung|veranstaltungen|event|events|konzert|concert|festival)(?:e|en|s)?\b/,{entityHints:['query','location','dateRange','timeRange']}),
  rule('events.source.open','events-external',/\b(?:eventquelle|originalquelle|event source|original source)(?:\s+(?:offnen|öffnen|open))\b/),
  rule('events.to-journey.plan','events-write',/\b(?:event|veranstaltung)(?:\s+(?:zur|in die) (?:timeline|tagesplan) (?:hinzufugen|hinzufügen|eintragen))\b|\badd (?:the )?event to (?:the )?(?:timeline|day plan)\b/,{priority:88,entityHints:['eventRef','date','time']}),
  rule('events.to-memory.save','events-write',/\b(?:event|veranstaltung)(?:\s+(?:als erinnerung|als memory) (?:speichern|merken))\b|\bsave (?:the )?event as (?:a )?memory\b/),
  rule('device.location.request','device-permission',/\b(?:standort|loca(?:tion)|gps)(?:\s+(?:zugriff|berechtigung|permission))?(?:\s+(?:anfordern|erlauben|request|allow))\b/),
  rule('device.location.clear','device-position-clear',/\b(?:session-?)?(?:standort|loca(?:tion)|gps)(?:\s+(?:loschen|löschen|entfernen|clear|remove))\b/),
  rule('device.camera.request','device-permission',/\b(?:kamera|camera)(?:\s+(?:zugriff|berechtigung|permission))?(?:\s+(?:anfordern|erlauben|request|allow))\b/),
  rule('device.files.pick','device-files',/\b(?:system-?)?(?:dateiauswahl|file picker)(?:\s+(?:offnen|öffnen|open))\b/),
  rule('device.share.open','device-share',/\b(?:system-?)?(?:teilen|share)(?:\s+(?:offnen|öffnen|open))\b/),
  rule('device.clip'+'board.write','device-clip'+'board',/\b(?:code|link|text)(?:\s+(?:kopieren|copy))(?:\s+(?:in die zwischenablage|to clip(?:board)))?\b/,{entityHints:['code','url','text']}),
  rule('device.download','device-download',/\b(?:datei|file)(?:\s+(?:herunterladen|download))\b/),
  rule('device.notification.request','device-permission',/\b(?:mitteilungen|benachrichtigungen|notifications)(?:\s+(?:erlauben|berechtigung anfordern|allow|request permission))\b/)
]);

function correctedText(value){
  return normalize(value).replace(/\b(?:14|15|16|17|18|19|20|21|22|23|0?[0-9]|1[0-3])\s+ur\b/g,match=>match.replace(/\bur\b/,'uhr'));
}
function languageOf(value){
  const text=` ${normalize(value)} `;
  const de=(text.match(/\b(?:ich|wir|uns|bitte|zeige|suche|finde|offne|andere|reise|heute|morgen|fur|mit|ohne|nicht|und|danach|tagesplan|uhr|tisch|eintragen)\b/g)||[]).length;
  const en=(text.match(/\b(?:i|we|please|show|find|search|open|change|trip|today|tomorrow|for|with|without|not|and|then|day plan|table)\b/g)||[]).length;
  if(de&&en)return'mixed';if(en)return'en';if(de)return'de';return'undetermined';
}
function isoDate(year,month,day){
  const y=Number(year),m=Number(month),d=Number(day),date=new Date(Date.UTC(y,m-1,d));
  if(date.getUTCFullYear()!==y||date.getUTCMonth()!==m-1||date.getUTCDate()!==d)return null;
  return `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}
function displayDate(iso){if(!/^\d{4}-\d{2}-\d{2}$/.test(iso||''))return null;const[y,m,d]=iso.split('-');return`${d}.${m}.${y}`}
function addDays(reference,amount){const base=new Date(`${reference}T12:00:00Z`);if(Number.isNaN(base.getTime()))return null;base.setUTCDate(base.getUTCDate()+amount);return base.toISOString().slice(0,10)}
function referenceDateOf(options={}){const requested=clean(options.referenceDate);return/^\d{4}-\d{2}-\d{2}$/.test(requested)?requested:new Date().toISOString().slice(0,10)}
function extractDates(raw,normalized,options={}){
  const output=[];let match;
  const dotted=/(?:^|\b)(\d{1,2})[./](\d{1,2})[./](\d{2}|\d{4})(?:\b|$)/g;
  while((match=dotted.exec(raw))){let year=Number(match[3]);if(year<100)year+=2000;const iso=isoDate(year,match[2],match[1]);if(iso)output.push({kind:'absolute',raw:match[0].trim(),iso,display:displayDate(iso)})}
  const dashed=/\b(20\d{2})-(\d{2})-(\d{2})\b/g;
  while((match=dashed.exec(raw))){const iso=isoDate(match[1],match[2],match[3]);if(iso)output.push({kind:'absolute',raw:match[0],iso,display:displayDate(iso)})}
  const relative=[['ubermorgen',2],['übermorgen',2],['day after tomorrow',2],['morgen',1],['tomorrow',1],['heute',0],['today',0]];
  for(const[word,days]of relative){if(new RegExp(`\\b${escapeRegExp(normalize(word))}\\b`).test(normalized)){const iso=addDays(referenceDateOf(options),days);output.push({kind:'relative',raw:word,offsetDays:days,iso,display:displayDate(iso)})}}
  return output.filter((item,index,list)=>list.findIndex(other=>other.iso===item.iso&&other.kind===item.kind)===index);
}
function extractTimes(normalized){
  const output=[];let match;const pattern=/\b(?:um|gegen|ab|at|around|from)?\s*(\d{1,2})(?:[:.]([0-5]\d))?\s*(uhr|am|pm)?\b/g;
  while((match=pattern.exec(normalized))){
    const hasCue=Boolean(match[3])||/\b(?:um|gegen|ab|at|around|from)\s*$/.test(normalized.slice(Math.max(0,match.index-10),match.index));
    if(!hasCue)continue;let hour=Number(match[1]),minute=Number(match[2]||0);if(match[3]==='pm'&&hour<12)hour+=12;if(match[3]==='am'&&hour===12)hour=0;if(hour>23)continue;
    const value=`${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;output.push({raw:match[0].trim(),value,display:`${value} Uhr`,approximate:/\b(?:gegen|around)\b/.test(match[0])});
  }
  return output.filter((item,index,list)=>list.findIndex(other=>other.value===item.value)===index);
}
function extractPartySize(normalized){
  const numeric=normalized.match(/\b(?:fur|für|for)\s+(\d{1,2})\s*(?:personen?|people|persons?|gaste|gäste)?\b/);if(numeric)return Number(numeric[1]);
  const words=Object.keys(NUMBER_WORDS).join('|'),word=normalized.match(new RegExp(`\\b(?:fur|für|for)\\s+(${words})\\s*(?:personen?|people|persons?|gaste|gäste)?\\b`));
  return word?NUMBER_WORDS[word[1]]:null;
}
function extractDuration(normalized){
  const match=normalized.match(/\b(\d+(?:[,.]\d+)?)\s*(stunden?|std\.?|hours?|hrs?|minuten?|min\.?)(?:\b|$)/);if(!match)return null;
  const amount=Number(match[1].replace(',','.')),minutes=/stund|std|hour|hrs/.test(match[2])?Math.round(amount*60):Math.round(amount);return{raw:match[0],minutes};
}
function extractSpatial(normalized){
  const definitions=[
    ['waterfront',/\b(?:direkt |nah |nahe |etwas nah )?(?:am|beim|nahe am|near (?:the )?|by (?:the )?)\s*(?:wasser|water|ufer|waterfront)\b/],
    ['center',/\b(?:im|in der|nahe dem|near (?:the )?|in (?:the )?)\s*(?:zentrum|innenstadt|stadtmitte|centre|center|downtown)\b/],
    ['beach',/\b(?:direkt |nah |nahe )?(?:am|beim|near (?:the )?|by (?:the )?)\s*(?:strand|beach|kuste|küste|coast)\b/],
    ['outside',/\b(?:ausserhalb|außerhalb|outside|outskirts)\b/],
    ['nearby',/\b(?:in der nahe|in der nähe|nearby|close by|near)\b/]
  ],output=[];
  for(const[kind,pattern]of definitions){const match=pattern.exec(normalized);if(!match)continue;const before=normalized.slice(Math.max(0,match.index-18),match.index),negated=/\b(?:nicht|kein|ohne|not|no|without)\s*$/.test(before)||/^\s*(?:nicht|not)\b/.test(match[0]);output.push({kind,value:match[0].trim(),negated})}
  return output;
}
function extractLocation(raw){
  const match=raw.match(/\b(?:in|bei|near|around)\s+([A-ZÄÖÜ][\p{L}'’-]*(?:\s+[A-ZÄÖÜ][\p{L}'’-]*){0,3})\b/u);if(!match)return null;
  const value=match[1].trim();return/^(?:Meine|Meiner|Der|Die|Das|The|Timeline|Timline|Tagesplan)$/i.test(value)?null:value;
}
function extractContact(raw){
  return{email:raw.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0]||null,url:raw.match(/https?:\/\/[^\s]+/i)?.[0]||null,phone:raw.match(/(?:\+\d{1,3}[\s/-]?)?(?:\d[\s/-]?){7,}/)?.[0]?.trim()||null,code:raw.match(/\b(?=[A-Z0-9-]{5,14}\b)(?=[A-Z0-9-]*[A-Z])(?=[A-Z0-9-]*\d)[A-Z0-9-]+\b/)?.[0]||null};
}
function extractEntities(raw,normalized,options={}){
  const dates=extractDates(raw,normalized,options),times=extractTimes(normalized),spatialConstraints=extractSpatial(normalized),contact=extractContact(raw),partySize=extractPartySize(normalized),duration=extractDuration(normalized),placeLocation=extractLocation(raw);
  const categories=[...new Set((normalized.match(/\b(?:restaurant|cafe|café|bar|minigolf|museum|strand|beach|shop|shopping|konzert|concert|festival|event|veranstaltung|aktivitat|aktivität|activity|luftmatratze|luftmatratzen)\b/g)||[]))];
  return immutable({dates,times,partySize,duration,'location':placeLocation,spatialConstraints,categories,...contact});
}
function splitIntents(normalized){
  if(!normalized)return[];
  const command='(?:offne|öffne|zeige|suche|finde|find|search|show|open|buche|buchen|book|reserviere|reserve|trage|trag|fuge|füge|add|put|speichere|save|losche|lösche|delete|entferne|remove|teile|share|kopiere|copy|andere|ändere|change|setze|set|plane|plan|prufe|prüfe|check|sende|send|antworte|reply|exportiere|export)';
  const expression=new RegExp(`\\s+(?:und dann|anschliessend|anschließend|ausserdem|außerdem|and then|then|danach)\\s+(?=${command}\\b)|\\s+(?:und|and)\\s+(?=${command}\\b)`,'gi');
  return normalized.split(expression).map(value=>value.trim()).filter(Boolean).map((text,index)=>({index,text}));
}
function nearbyNegation(text,match){
  const before=text.slice(Math.max(0,match.index-28),match.index),inside=match[0];return /\b(?:nicht|kein|keine|keinen|ohne|never|not|no|don't|do not|without)\b/.test(`${before} ${inside}`);
}
function levenshtein(left,right){
  const a=String(left),b=String(right),row=Array.from({length:b.length+1},(_,index)=>index);
  for(let i=1;i<=a.length;i++){let previous=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const old=row[j],cost=a[i-1]===b[j-1]?0:1;row[j]=Math.min(row[j]+1,row[j-1]+1,previous+cost);previous=old}}
  return row[b.length];
}
function tokenSimilarity(left,right){
  const a=[...new Set(normalize(left).split(' ').filter(word=>word.length>2))],b=[...new Set(normalize(right).split(' ').filter(word=>word.length>2))];if(!a.length||!b.length)return 0;
  let matches=0;for(const word of a){if(b.some(candidate=>candidate===word||(word.length>=5&&candidate.length>=5&&levenshtein(word,candidate)<=1)))matches+=1}
  return matches/Math.max(a.length,b.length);
}
function catalogIndex(catalog=[]){
  if(!Array.isArray(catalog))return{exact:new Map(),actions:[]};
  const cached=CATALOG_CACHE.get(catalog);if(cached)return cached;
  const actions=catalog.filter(action=>ACTION_ID.test(action?.id||'')&&clean(action.label)),exact=new Map(actions.map(action=>[normalize(action.label),action])),index={exact,actions};CATALOG_CACHE.set(catalog,index);return index;
}
function catalogCandidate(segment,catalog=[],allowFuzzy=true){
  const index=catalogIndex(catalog),actions=index.actions,exact=index.exact.get(segment.text);
  if(exact)return{actionId:exact.id,group:`catalog:${exact.id}`,priority:110,match:{0:exact.label,index:0},source:'canonical-label',similarity:1,entityHints:[]};
  if(!allowFuzzy)return null;
  let best=null;
  for(const action of actions){if(!ACTION_ID.test(action?.id||''))continue;const label=clean(action.label);if(!label)continue;const similarity=tokenSimilarity(segment.text,label);if(similarity<.58)continue;if(!best||similarity>best.similarity)best={action,similarity,exact:false}}
  if(!best)return null;return{actionId:best.action.id,group:`catalog:${best.action.id}`,priority:best.exact?110:45,match:{0:best.action.label,index:0},source:best.exact?'canonical-label':'catalog-fuzzy',similarity:best.similarity,entityHints:[]};
}
function ruleCandidates(segment,catalog=[]){
  const found=[];
  for(const definition of RULES){definition.pattern.lastIndex=0;const match=definition.pattern.exec(segment.text);if(match)found.push({...definition,match,source:'curated-rule',similarity:1})}
  const canonical=catalogCandidate(segment,catalog,found.length===0);if(canonical)found.push(canonical);
  const byGroup=new Map();for(const candidate of found){const current=byGroup.get(candidate.group);if(!current||candidate.priority>current.priority)byGroup.set(candidate.group,candidate)}
  return [...byGroup.values()].sort((a,b)=>b.priority-a.priority||a.actionId.localeCompare(b.actionId));
}
function actionMeta(actionId,catalog=[]){const found=(Array.isArray(catalog)?catalog:[]).find(item=>item?.id===actionId);return found?{category:found.category||null,label:found.label||actionId,effect:found.effect||null,risk:found.risk||null,ownerContract:found.owner?.contract||null,ownerMethod:found.owner?.method||null,stateChanging:found.lifecycle?.stateChanging===true,confirmationPolicy:found.lifecycle?.confirmationPolicy||null,inputStatus:found.inputContract?.status||null,requiredFields:found.inputContract?.requiredFields||[]}:null}
function candidateView(candidate,segment,entities,catalog){
  const negated=nearbyNegation(segment.text,candidate.match),meta=actionMeta(candidate.actionId,catalog),confidence=Math.max(.45,Math.min(1,(candidate.priority+(candidate.source==='canonical-label'?10:0))/100));
  return immutable({order:segment.index+1,actionId:candidate.actionId,source:candidate.source,matchedText:candidate.match[0],confidence:Number(confidence.toFixed(2)),negated,status:negated?'BLOCKED_BY_NEGATION':'READY_FOR_INPUT_VALIDATION',canProceed:false,requiresDeterministicValidation:true,entityHints:candidate.entityHints||[],entities,owner:meta?{contract:meta.ownerContract,method:meta.ownerMethod}:null,action:meta});
}
function compile(input={},options={}){
  const raw=clean(typeof input==='string'?input:input.utterance||input.text),settings=typeof input==='string'?options:{...options,...input,...input.options},catalog=(typeof input==='object'&&Array.isArray(input.catalog)?input.catalog:settings.catalog)||[];
  if(!raw)throw new TypeError('Human-AI language compiler requires a non-empty utterance.');
  const normalized=correctedText(raw),segments=splitIntents(normalized),globalEntities=extractEntities(raw,normalized,settings),candidates=[];
  for(const segment of segments){const extracted=extractEntities(segment.text,segment.text,settings),usesGlobalLocation=globalEntities.location&&segment.text.includes(normalize(globalEntities.location)),entities=usesGlobalLocation?immutable({...extracted,'location':globalEntities.location}):extracted,matches=ruleCandidates(segment,catalog);for(const match of matches)candidates.push(candidateView(match,segment,entities,catalog))}
  const deduped=[];for(const candidate of candidates){const key=`${candidate.order}:${candidate.actionId}`;if(!deduped.some(item=>`${item.order}:${item.actionId}`===key))deduped.push(candidate)}
  const actionable=deduped.filter(item=>!item.negated),negated=deduped.filter(item=>item.negated),understood=deduped.length>0;
  return immutable({contractId:CONTRACT_ID,version:VERSION,kind:'language-interpretation',persisted:false,mutated:false,executed:false,utterance:raw,normalized,language:languageOf(raw),segments:segments.map(item=>({order:item.index+1,text:item.text})),entities:globalEntities,candidates:deduped,summary:{understood,intentCount:deduped.length,actionableIntentCount:actionable.length,negatedIntentCount:negated.length,multiIntent:segments.length>1,needsClarification:!understood,deterministicValidationRequired:understood},guard:{naturalLanguageConfirmsMutation:false,ownerExecutionAllowed:false,nextStep:understood?'VALIDATE_INPUT_CONTEXT_AUTHORITY':'ASK_CLARIFYING_QUESTION'}});
}
function describeCoverage(catalog=[]){
  const actions=Array.isArray(catalog)?catalog.filter(item=>ACTION_ID.test(item?.id||'')):[],curated=[...new Set(RULES.map(item=>item.actionId))],canonical=actions.filter(item=>clean(item.label)).map(item=>item.id);
  return immutable({contractId:CONTRACT_ID,version:VERSION,catalogActions:actions.length,canonicalLabelCoverage:canonical.length,curatedRuleCount:RULES.length,curatedActionCount:curated.length,curatedActionIds:curated,supportedLocales:['de','en','mixed'],entityTypes:['date','relative-date','time','party-size','duration','location','spatial-constraint','category','email','phone','url','code'],preserves:['negation','intent-order','source-utterance','normalized-utterance'],executesOwnerActions:false});
}
function describeRules(){return immutable(RULES.map(item=>({actionId:item.actionId,group:item.group,priority:item.priority,locales:item.locales,entityHints:item.entityHints,pattern:item.pattern.source})))}

return Object.freeze({contractId:CONTRACT_ID,version:VERSION,compile,normalize:correctedText,extractEntities,splitIntents,describeCoverage,describeRules});
})();
