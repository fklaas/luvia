-- Luvia v13.68.10 / Core 4.68.10
-- Multilingual Reply Decision Classification & Review-State Fix

begin;

-- Deterministic multilingual restaurant reply classifier.
-- Safety ordering is intentional: explicit declines/negations are evaluated before alternatives and confirmations.
create or replace function public.luvia_booking_classify_reply(p_subject text,p_body_text text)
returns jsonb
language plpgsql
immutable
as $$
declare
  v_reply text:=trim(coalesce(p_body_text,''));
  v_text text;
  v_intent text:='unknown';
  v_conf numeric:=0.45;
  v_status text:=null;
  v_auto boolean:=false;
  v_action boolean:=true;
  v_review boolean:=false;
  v_evidence jsonb:='[]'::jsonb;
  v_extracted jsonb:='{}'::jsonb;
  v_time text;
  v_date text;
begin
  -- Remove common quoted-reply blocks so the original outbound request cannot influence classification.
  v_reply:=regexp_replace(v_reply,E'(?is)\\n[^\\n]{0,240}schrieb am[^\\n]*:.*$','','g');
  v_reply:=regexp_replace(v_reply,E'(?is)\\nOn [^\\n]{0,240} wrote:.*$','','g');
  v_reply:=regexp_replace(v_reply,E'(?is)\\nLe [^\\n]{0,240} a écrit\\s*:.*$','','g');
  v_reply:=regexp_replace(v_reply,E'(?is)\\nEl [^\\n]{0,240} escribió\\s*:.*$','','g');
  v_reply:=regexp_replace(v_reply,E'(?is)\\nIl [^\\n]{0,240} ha scritto\\s*:.*$','','g');
  v_reply:=regexp_replace(v_reply,E'(?is)\\nOp [^\\n]{0,240} schreef\\s*:.*$','','g');
  v_reply:=regexp_replace(v_reply,E'(?is)\\n>.*$','','g');
  if length(trim(v_reply))=0 then v_reply:=left(coalesce(p_body_text,''),4000); end if;
  v_text:=lower(coalesce(p_subject,'')||E'\\n'||v_reply);

  -- 1) EXPLICIT DECLINE / UNAVAILABLE. Must run before confirmation to avoid negated confirmation false positives.
  if v_text ~ (
    '(leider.{0,100}(nicht|keine|kein|ausgebucht|voll)|nicht möglich|nicht verfügbar|keine verfügbarkeit|ausgebucht|vollständig belegt|nicht bestätigen|können.{0,40}nicht.{0,40}bestätigen'
    ||'|cannot confirm|can.?t confirm|unable to confirm|no availability|not available|fully booked|unable to accommodate|cannot accommodate'
    ||'|aucune disponibilité|indisponible|complet|complète|ne pouvons pas confirmer|impossible de confirmer'
    ||'|sin disponibilidad|no disponible|completo|completa|no podemos confirmar|no es posible confirmar'
    ||'|nessuna disponibilità|non disponibile|al completo|non possiamo confermare|impossibile confermare'
    ||'|sem disponibilidade|não disponível|lotado|lotada|não podemos confirmar|não é possível confirmar'
    ||'|geen beschikbaarheid|niet beschikbaar|volgeboekt|kunnen.{0,40}niet bevestigen'
    ||'|ingen ledige|ikke tilgjengelig|fullbooket|fuldt booket|ikke ledig|kan ikke bekræfte|kan inte bekräfta|fullbokat'
    ||'|ei saatavuutta|ei vapaita|täynnä|emme voi vahvistaa'
    ||'|brak dostępności|brak miejsc|nie możemy potwierdzić|pełna rezerwacja|pełne'
    ||'|není k dispozici|bez volných míst|nemůžeme potvrdit|plně obsazeno'
    ||'|nie je k dispozícii|bez voľných miest|nemôžeme potvrdiť|plne obsadené'
    ||'|nincs szabad hely|nem elérhető|nem tudjuk megerősíteni|teltház'
    ||'|nu este disponibil|fără disponibilitate|complet rezervat|nu putem confirma'
    ||'|nema dostupnosti|nije dostupno|popunjeno|ne možemo potvrditi|nema slobodnih mjesta|nema slobodnih mesta'
    ||'|ni na voljo|brez prostih mest|ne moremo potrditi|zasedeno'
    ||'|няма свободни места|няма наличност|не можем да потвърдим|заето'
    ||'|δεν υπάρχει διαθεσιμότητα|μη διαθέσιμο|πλήρες|δεν μπορούμε να επιβεβαιώσουμε'
    ||'|müsait değil|yer yok|doluyuz|teyit edemiyoruz|onaylayamıyoruz'
    ||'|нет мест|мест нет|недоступно|не можем подтвердить|полностью забронировано'
    ||'|немає місць|місць немає|недоступно|не можемо підтвердити|повністю заброньовано'
    ||'|لا توجد أماكن|لا يوجد توفر|غير متاح|لا يمكننا التأكيد'
    ||'|אין מקום|אין זמינות|לא זמין|לא יכולים לאשר'
    ||'|没有空位|无空位|无法确认|已订满|沒有空位|無法確認|已訂滿'
    ||'|空きがありません|満席|確認できません|予約できません'
    ||'|예약이 마감|자리가 없습니다|확인할 수 없습니다|예약할 수 없습니다)'
  ) then
    v_intent:='declined';v_conf:=0.97;v_status:='declined';v_action:=false;v_evidence:='["explicit_decline_multilingual"]'::jsonb;

  -- 2) ALTERNATIVE OFFER / DIFFERENT TIME OR DATE.
  elsif v_text ~ (
    '(stattdessen|alternativ|als alternative|andere uhrzeit|anderen termin|können.{0,30}(um|ab).{0,20}[0-9]{1,2}[:.]?[0-9]{0,2}'
    ||'|available at|another time|alternative time|instead|we can offer|we could offer'
    ||'|proposons|nous pouvons proposer|disponible à|autre horaire|autre créneau'
    ||'|podemos ofrecer|podemos ofrecerle|otra hora|otro horario|como alternativa'
    ||'|possiamo offrire|possiamo proporre|altro orario|in alternativa'
    ||'|podemos oferecer|outro horário|como alternativa'
    ||'|wij kunnen aanbieden|ander tijdstip|alternatief|andere tijd'
    ||'|vi kan tilbyde|andet tidspunkt|alternativt|vi kan erbjuda|annan tid|vi kan tilby|annet tidspunkt'
    ||'|voimme tarjota|toinen aika|vaihtoehtoinen aika'
    ||'|możemy zaproponować|inna godzina|alternatywny termin'
    ||'|můžeme nabídnout|jiný čas|alternativní termín|môžeme ponúknuť|iný čas|alternatívny termín'
    ||'|tudunk ajánlani|másik időpont|alternatív időpont'
    ||'|putem oferi|altă oră|alt interval'
    ||'|možemo ponuditi|drugi termin|drugo vrijeme|drugo vreme|lahko ponudimo|drug termin'
    ||'|можем да предложим|друг час|алтернативен час'
    ||'|μπορούμε να προτείνουμε|άλλη ώρα|εναλλακτική ώρα'
    ||'|şu saati önerebiliriz|başka bir saat|alternatif saat|önerebiliriz'
    ||'|можем предложить|другое время|альтернативное время|можемо запропонувати|інший час|альтернативний час'
    ||'|يمكننا اقتراح|وقت آخر|موعد بديل|נוכל להציע|שעה אחרת|מועד חלופי'
    ||'|可以提供其他时间|可以改为|其他时间|可提供其他時間|其他時間'
    ||'|別の時間|別の時間をご案内|代替時間|다른 시간|대체 시간|다른 시간을 제안)'
  ) then
    v_intent:='alternative_proposed';v_conf:=0.94;v_status:='needs_action';v_action:=true;v_evidence:='["explicit_alternative_multilingual"]'::jsonb;

  -- 3) EXPLICIT CONFIRMATION / RESERVED.
  elsif trim(lower(v_reply)) ~ '^(bestätigt|confirmed|confirmée|confirmee|confirmado|confirmada|confermato|confermata|confirmado|bevestigd|bekræftet|bekräftad|vahvistettu|potwierdzono|potvrzeno|potvrdené|megerősítve|confirmată|potvrđeno|potrjeno|потвърдено|επιβεβαιώθηκε|onaylandı|подтверждено|підтверджено|تم التأكيد|מאושר|已确认|已確認|確認済み|확정)[.! ]*$'
    or v_text ~ (
      '((reservierung|buchung|tisch).{0,55}(ist|wurde|wird).{0,16}bestätigt|wir.{0,20}bestätigen.{0,80}(reservierung|buchung|tisch)|bestätigen.{0,20}(ihre|die).{0,40}(reservierung|buchung)|ist für sie reserviert|haben wir.{0,40}reserviert'
      ||'|we.{0,20}confirm.{0,80}(reservation|booking|table)|reservation is confirmed|your booking is confirmed|booking has been confirmed|table is reserved|we have reserved'
      ||'|nous.{0,20}confirmons.{0,80}(réservation|reservation|table)|réservation.{0,40}confirmée|reservation.{0,40}confirmee|table.{0,40}réservée'
      ||'|confirmamos.{0,80}(reserva|reservación|reservacion|mesa)|su reserva.{0,40}(está|esta).{0,15}confirmada|mesa.{0,40}reservada'
      ||'|confermiamo.{0,80}(prenotazione|tavolo)|prenotazione.{0,40}confermata|tavolo.{0,40}riservato'
      ||'|confirmamos.{0,80}(reserva|mesa)|sua reserva.{0,40}(está|esta).{0,15}confirmada|mesa.{0,40}reservada'
      ||'|wij.{0,20}bevestigen.{0,80}(reservering|boeking|tafel)|reservering.{0,40}bevestigd|tafel.{0,40}gereserveerd'
      ||'|vi.{0,20}(bekræfter|bekräftar).{0,80}(reservation|bord)|reservationen.{0,40}(er bekræftet|är bekräftad)|bordet.{0,40}(er reserveret|är reserverat)'
      ||'|vi.{0,20}bekrefter.{0,80}(reservasjon|bord)|reservasjonen.{0,40}er bekreftet|bordet.{0,40}er reservert'
      ||'|vahvistamme.{0,80}(varauksen|pöytävarauksen)|varaus.{0,40}on vahvistettu|pöytä.{0,40}on varattu'
      ||'|potwierdzamy.{0,80}(rezerwację|rezerwacje|stolik)|rezerwacja.{0,40}(jest )?potwierdzona|stolik.{0,40}zarezerwowany'
      ||'|potvrzujeme.{0,80}(rezervaci|rezerváciu|stůl|stôl)|rezervace.{0,40}je potvrzena|rezervácia.{0,40}je potvrdená'
      ||'|megerősítjük.{0,80}(foglalását|foglalást)|foglalás.{0,40}megerősítve|asztal.{0,40}lefoglalva'
      ||'|confirmăm.{0,80}(rezervarea|masa)|rezervarea.{0,40}este confirmată|masa.{0,40}este rezervată'
      ||'|potvrđujemo.{0,80}(rezervaciju|stol)|rezervacija.{0,40}je potvrđena|stol.{0,40}je rezerviran|potrjujemo.{0,80}(rezervacijo|mizo)|rezervacija.{0,40}je potrjena'
      ||'|потвърждаваме.{0,80}(резервацията|резервация)|резервацията.{0,40}е потвърдена'
      ||'|επιβεβαιώνουμε.{0,80}(κράτηση|τραπέζι)|η κράτηση.{0,40}επιβεβαιώθηκε|το τραπέζι.{0,40}κρατήθηκε'
      ||'|rezervasyonunuzu.{0,40}onaylıyoruz|rezervasyon.{0,40}onaylandı|masanız.{0,40}ayrıldı|teyit ediyoruz'
      ||'|подтверждаем.{0,80}(бронирование|резервацию|стол)|бронирование.{0,40}подтверждено|стол.{0,40}забронирован'
      ||'|підтверджуємо.{0,80}(бронювання|резервацію|стіл)|бронювання.{0,40}підтверджено|стіл.{0,40}заброньовано'
      ||'|نؤكد.{0,80}(الحجز|حجزكم)|تم تأكيد.{0,40}الحجز|تم حجز.{0,40}الطاولة'
      ||'|אנו מאשרים.{0,80}(את ההזמנה|הזמנה)|ההזמנה.{0,40}מאושרת|השולחן.{0,40}שמור'
      ||'|我们确认.{0,80}(预订|预约)|您的预订.{0,40}已确认|桌位.{0,40}已预留|我們確認.{0,80}(預訂|預約)|您的預訂.{0,40}已確認'
      ||'|ご予約.{0,40}(を確認しました|が確定しました|を承りました)|お席.{0,40}を確保しました|予約.{0,40}確定'
      ||'|예약.{0,40}(확정되었습니다|확인되었습니다)|예약을.{0,40}확인했습니다|좌석.{0,40}예약되었습니다)'
    ) then
    v_intent:='confirmed';v_conf:=0.98;v_status:='confirmed';v_action:=false;v_evidence:='["explicit_confirmation_multilingual"]'::jsonb;

  -- 4) ACTION REQUIRED / QUESTION / PAYMENT / USER CONFIRMATION.
  elsif v_text ~ (
    '(kreditkarte|kartendaten|anzahlung|vorkasse|zahlung|deposit|prepayment|credit card|payment link'
    ||'|carte bancaire|acompte|prépaiement|tarjeta de crédito|depósito|pago|carta di credito|deposito|pagamento'
    ||'|cartão de crédito|pagamento|borg|betaling|kredietkaart|aanbetaling|betalingslink'
    ||'|karta kredytowa|zaliczka|płatność|platební karta|záloha|platba|bankkártya|előleg|fizetés'
    ||'|card de credit|avans|plată|kreditna kartica|predujam|plaćanje|плащане|депозит|πιστωτική κάρτα|προκαταβολή|πληρωμή'
    ||'|kredi kartı|ön ödeme|ödeme|кредитная карта|предоплата|оплата|кредитна картка|передоплата|оплата'
    ||'|please confirm|please reply|please call|please choose|bitte.{0,40}(bestätigen|antworten|anrufen|kontaktieren|auswählen)'
    ||'|merci de.{0,40}(confirmer|répondre|appeler|choisir)|por favor.{0,40}(confirme|responda|llame|elija)'
    ||'|la preghiamo di.{0,40}(confermare|rispondere|chiamare|scegliere)|por favor.{0,40}(confirme|responda|ligue|escolha)'
    ||'|kunt u.{0,40}(bevestigen|antwoorden|bellen|kiezen)|prosimy.{0,40}(potwierdzić|odpowiedzieć|zadzwonić|wybrać)'
    ||'|prosíme.{0,40}(potvrdit|odpovědět|zavolat|vybrat)|prosíme.{0,40}(potvrdiť|odpovedať|zavolať|vybrať)'
    ||'|يرجى.{0,40}(التأكيد|الرد|الاتصال)|נא.{0,40}(לאשר|להשיב|להתקשר)|请.{0,40}(确认|回复|致电)|請.{0,40}(確認|回覆|致電)|ご確認ください|ご返信ください|확인해 주세요|회신해 주세요)'
  ) then
    v_intent:='needs_action';v_conf:=0.92;v_status:='needs_action';v_action:=true;v_evidence:='["explicit_action_required_multilingual"]'::jsonb;

  -- 5) INFORMATIONAL / PROCESSING, no decision yet.
  elsif v_text ~ (
    '(wir melden uns|in bearbeitung|wird geprüft|wir prüfen|we will get back|under review|we are checking|pending confirmation'
    ||'|nous revenons vers vous|en cours de traitement|nous vérifions|le responderemos|estamos comprobando|en revisión'
    ||'|vi faremo sapere|stiamo verificando|in elaborazione|entraremos em contato|estamos verificando'
    ||'|wij komen erop terug|wordt gecontroleerd|in behandeling|vi vender tilbage|vi undersøger|vi återkommer|vi kontrollerar'
    ||'|otamme yhteyttä|tarkistamme|käsittelyssä|skontaktujemy się|sprawdzamy|w trakcie weryfikacji'
    ||'|ozveme se|ověřujeme|kontrolujeme|ozveme sa|overujeme|ellenőrizzük|hamarosan válaszolunk'
    ||'|revenim cu un răspuns|verificăm|provjeravamo|javit ćemo se|preverjamo|oglasimo se'
    ||'|ще се свържем|проверяваме|θα επανέλθουμε|ελέγχουμε|size döneceğiz|kontrol ediyoruz'
    ||'|мы свяжемся|проверяем|мы уточняем|ми зв’яжемося|перевіряємо|سنتواصل معكم|نتحقق|נחזור אליכם|בודקים'
    ||'|我们会回复|正在确认|正在核实|我們會回覆|正在確認|確認中|確認してご連絡|확인 후 연락|검토 중)'
  ) then
    v_intent:='informational';v_conf:=0.82;v_status:=null;v_action:=false;v_evidence:='["informational_reply_multilingual"]'::jsonb;

  -- Booking-related language exists, but no safe decision could be inferred.
  elsif v_text ~ (
    '(bestätig|reservierung|buchung|tisch|confirm|reservation|booking|table|réservation|reserva|reservación|prenotazione|reservering'
    ||'|reservationen|reservasjon|varaus|rezerwac|rezervac|foglal|rezervarea|rezervacij|rezervacijo|резервац|κράτηση|rezervasyon'
    ||'|бронирован|бронюван|حجز|הזמנה|预订|預訂|予約|예약)'
  ) then
    v_intent:='unknown';v_conf:=0.66;v_status:=null;v_action:=true;v_review:=true;v_evidence:='["booking_language_without_safe_decision"]'::jsonb;
  end if;

  -- Extract common 24h clock expressions across multiple languages.
  select (regexp_match(v_reply,'(?i)\\b(?:um|at|à|a las|alle|às|om|kl\\.?|klo|o|ve|v|la|στις|saat)?\\s*([01]?[0-9]|2[0-3])[:.]([0-5][0-9])\\s*(?:uhr|h|hrs)?\\b'))[1]
      ||':'||(regexp_match(v_reply,'(?i)\\b(?:um|at|à|a las|alle|às|om|kl\\.?|klo|o|ve|v|la|στις|saat)?\\s*([01]?[0-9]|2[0-3])[:.]([0-5][0-9])\\s*(?:uhr|h|hrs)?\\b'))[2]
    into v_time;
  if v_time is not null then
    v_extracted:=v_extracted||jsonb_build_object('proposedTime',lpad(split_part(v_time,':',1),2,'0')||':'||split_part(v_time,':',2));
  end if;

  select (regexp_match(v_reply,'\\b([0-3]?[0-9])[./-]([01]?[0-9])[./-](20[0-9]{2})\\b'))[3]
      ||'-'||lpad((regexp_match(v_reply,'\\b([0-3]?[0-9])[./-]([01]?[0-9])[./-](20[0-9]{2})\\b'))[2],2,'0')
      ||'-'||lpad((regexp_match(v_reply,'\\b([0-3]?[0-9])[./-]([01]?[0-9])[./-](20[0-9]{2})\\b'))[1],2,'0')
    into v_date;
  if v_date is not null then v_extracted:=v_extracted||jsonb_build_object('proposedDate',v_date); end if;

  v_auto:=v_conf>=0.90 and v_status is not null;
  -- Review any ambiguous booking-related decision, plus normal medium-confidence cases.
  v_review:=v_review or (not v_auto and (v_conf>=0.70 or (v_intent='unknown' and v_action)));

  return jsonb_build_object(
    'classifier','rules',
    'version','0.5.0-email-multilingual',
    'intent',v_intent,
    'confidence',v_conf,
    'proposedStatus',v_status,
    'autoApply',v_auto,
    'requiresUserAction',v_action,
    'reviewRequired',v_review,
    'visibleReply',trim(v_reply),
    'evidence',v_evidence,
    'extracted',v_extracted,
    'languageCoverage',jsonb_build_array(
      'de','en','fr','es','it','pt','nl','da','sv','no','fi','pl','cs','sk','hu','ro','hr-bs-sr','sl','bg','el','tr','ru','uk','ar','he','zh','ja','ko'
    )
  );
end $$;

revoke all on function public.luvia_booking_classify_reply(text,text) from public,anon,authenticated;
grant execute on function public.luvia_booking_classify_reply(text,text) to service_role;

-- Keep the trusted-sender provenance contract from v13.68.9, but persist the new classifier version.
create or replace function public.luvia_booking_process_inbound_intelligence_v2(p_message_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_msg public.booking_messages;
  v_booking public.bookings;
  v_result jsonb;
  v_intent text;
  v_conf numeric;
  v_proposed text;
  v_classifier_auto boolean;
  v_effective_auto boolean:=false;
  v_signal jsonb:=null;
  v_signal_id uuid:=null;
  v_applied boolean:=false;
  v_applied_status text:=null;
  v_sender_email text;
  v_trusted_sender boolean:=false;
  v_trusted_candidate_id uuid:=null;
  v_review boolean:=false;
  v_requires_action boolean:=false;
  v_evidence jsonb:='[]'::jsonb;
  v_extracted jsonb:='{}'::jsonb;
begin
  if not public.luvia_booking_is_service_role_request() then
    raise exception 'SERVICE_ROLE_REQUIRED';
  end if;

  select * into v_msg from public.booking_messages where id=p_message_id and direction='inbound' for update;
  if not found then raise exception 'INBOUND_MESSAGE_NOT_FOUND'; end if;
  select * into v_booking from public.bookings where id=v_msg.booking_id for update;
  if not found then raise exception 'BOOKING_NOT_FOUND'; end if;

  v_sender_email:=lower(trim(regexp_replace(coalesce(v_msg.sender,''),'^.*<([^>]+)>.*$','\\1')));

  select c.id into v_trusted_candidate_id
  from public.booking_contact_candidates c
  where c.booking_id=v_booking.id and c.channel='email' and c.is_public=true and c.is_official=true
    and c.verification_status='verified' and c.auto_usable=true
    and lower(trim(coalesce(c.contact_value,'')))=v_sender_email
  order by c.last_verified_at desc nulls last,c.created_at desc limit 1;
  v_trusted_sender:=v_trusted_candidate_id is not null;

  v_result:=public.luvia_booking_classify_reply(v_msg.subject,v_msg.body_text);
  v_intent:=v_result->>'intent';
  v_conf:=(v_result->>'confidence')::numeric;
  v_proposed:=nullif(v_result->>'proposedStatus','');
  v_classifier_auto:=coalesce((v_result->>'autoApply')::boolean,false);
  v_effective_auto:=v_classifier_auto and v_trusted_sender;
  v_review:=coalesce((v_result->>'reviewRequired')::boolean,false) or (v_classifier_auto and not v_trusted_sender);
  v_requires_action:=coalesce((v_result->>'requiresUserAction')::boolean,false) or (v_classifier_auto and not v_trusted_sender);
  v_evidence:=coalesce(v_result->'evidence','[]'::jsonb);
  if not v_trusted_sender then v_evidence:=v_evidence||jsonb_build_array('untrusted_sender_not_auto_applied'); end if;
  v_extracted:=coalesce(v_result->'extracted','{}'::jsonb);

  if v_effective_auto and v_proposed is not null then
    v_signal:=public.luvia_booking_ingest_status_signal_internal(
      v_booking.id,'email',v_msg.provider_message_id,v_intent,v_proposed,'email_reply',
      coalesce(v_msg.webhook_event_id,v_msg.id::text),v_conf,
      jsonb_build_object(
        'messageId',v_msg.id,'classifierVersion','0.5.0-email-multilingual','emailThreadId',v_msg.email_thread_id,
        'sender',v_sender_email,'senderTrusted',true,'trustedCandidateId',v_trusted_candidate_id,
        'senderTrustMethod','verified_candidate_exact_match','languageCoverage',v_result->'languageCoverage'
      ),
      coalesce(v_msg.received_at,v_msg.created_at),false
    );
    v_signal_id:=nullif(v_signal#>>'{signal,id}','')::uuid;
    v_applied:=coalesce((v_signal->>'applied')::boolean,false);
    if v_applied then v_applied_status:=v_proposed; end if;
  end if;

  insert into public.booking_message_intelligence(
    booking_id,message_id,classifier,classifier_version,intent,confidence,proposed_status,
    auto_apply,applied,applied_status,requires_user_action,review_required,visible_reply,
    evidence,extracted,raw_result,classified_at,updated_at
  ) values(
    v_booking.id,v_msg.id,'rules','0.5.0-email-multilingual',v_intent,v_conf,v_proposed,
    v_effective_auto,v_applied,v_applied_status,v_requires_action,v_review,v_result->>'visibleReply',
    v_evidence,v_extracted,
    v_result||jsonb_build_object(
      'statusSignal',v_signal,'classifierAutoApply',v_classifier_auto,'effectiveAutoApply',v_effective_auto,
      'sender',v_sender_email,'senderTrusted',v_trusted_sender,'trustedCandidateId',v_trusted_candidate_id,
      'senderTrustMethod',case when v_trusted_sender then 'verified_candidate_exact_match' else 'none' end,
      'autoApplyBlockedReason',case when v_classifier_auto and not v_trusted_sender then 'UNTRUSTED_EMAIL_SENDER' else null end
    ),now(),now()
  )
  on conflict(message_id) do update set
    classifier='rules',classifier_version='0.5.0-email-multilingual',intent=excluded.intent,
    confidence=excluded.confidence,proposed_status=excluded.proposed_status,auto_apply=excluded.auto_apply,
    applied=excluded.applied,applied_status=excluded.applied_status,
    requires_user_action=excluded.requires_user_action,review_required=excluded.review_required,
    visible_reply=excluded.visible_reply,evidence=excluded.evidence,extracted=excluded.extracted,
    raw_result=excluded.raw_result,classified_at=now(),updated_at=now();

  update public.booking_email_threads
  set state='replied',last_inbound_message_id=v_msg.id,last_activity_at=now(),updated_at=now()
  where id=v_msg.email_thread_id;

  insert into public.booking_events(booking_id,trip_id,event_type,payload)
  values(v_booking.id,v_booking.trip_id,'booking.email.reply.classified',jsonb_build_object(
    'messageId',v_msg.id,'intent',v_intent,'confidence',v_conf,'statusSignalId',v_signal_id,
    'applied',v_applied,'sender',v_sender_email,'senderTrusted',v_trusted_sender,
    'trustedCandidateId',v_trusted_candidate_id,'effectiveAutoApply',v_effective_auto,
    'reviewRequired',v_review,'classifierVersion','0.5.0-email-multilingual'
  ));

  return v_result||jsonb_build_object(
    'bookingId',v_booking.id,'messageId',v_msg.id,'statusSignalId',v_signal_id,
    'applied',v_applied,'appliedStatus',v_applied_status,
    'classifierAutoApply',v_classifier_auto,'autoApply',v_effective_auto,
    'sender',v_sender_email,'senderTrusted',v_trusted_sender,'trustedCandidateId',v_trusted_candidate_id,
    'reviewRequired',v_review,
    'autoApplyBlockedReason',case when v_classifier_auto and not v_trusted_sender then 'UNTRUSTED_EMAIL_SENDER' else null end
  );
end $$;

revoke all on function public.luvia_booking_process_inbound_intelligence_v2(uuid) from public,anon,authenticated;
grant execute on function public.luvia_booking_process_inbound_intelligence_v2(uuid) to service_role;

comment on function public.luvia_booking_classify_reply(text,text) is
'Email Booking V2 multilingual deterministic restaurant reply classifier. Safety order: decline/negation, alternative, confirmation, action required, informational, ambiguous review. Covers 29 language/locale groups.';
comment on function public.luvia_booking_process_inbound_intelligence_v2(uuid) is
'Email Booking V2.2: multilingual classification plus exact verified venue sender provenance before any email_reply auto-apply.';

insert into public.booking_health_checks(check_key,status,details,checked_at)
values('release','ok',jsonb_build_object(
  'version','1.0.17','integration_ready',true,'luvia_core','4.68.10','luvia_build','13.68.10',
  'feature','Multilingual Reply Decision Classification & Review-State Fix',
  'classifier_version','0.5.0-email-multilingual','language_groups',29,
  'decline_before_confirmation',true,'ambiguous_booking_reply_review_required',true,
  'trusted_sender_contract_preserved',true,'checked_at',now()
),now())
on conflict(check_key) do update set status=excluded.status,details=excluded.details,checked_at=excluded.checked_at;

commit;
