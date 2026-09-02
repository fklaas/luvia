'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'config', 'luvia-human-ai-action-registry.v1.json');
const SCHEMA_PATH = path.join(ROOT, 'config', 'luvia-human-ai-action-registry.v1.schema.json');
const SOURCE_AUDIT_PATH = path.join(ROOT, 'config', 'luvia-human-ai-action-source-audit.v1.json');
const INPUT_CONTRACTS_PATH = path.join(ROOT, 'config', 'luvia-ai-action-input-contracts.v1.json');
const ACTION_CORE_PATH = path.join(ROOT, 'core', 'intelligence', 'intelligence-action-contract-core.js');
const NAVIGATION_CORE_PATH = path.join(ROOT, 'core', 'runtime', 'navigation-contract-core.js');
const NAVIGATION_HISTORY_CORE_PATH = path.join(ROOT, 'core', 'runtime', 'navigation-history-policy-core.js');
const IDENTITY_CORE_PATH = path.join(ROOT, 'core', 'identity', 'identity-domain-contract-core.js');
const IDENTITY_ADAPTER_PATH = path.join(ROOT, 'core', 'platform', 'identity-contract-adapter.js');
const AUTH_CORE_PATH = path.join(ROOT, 'core', 'runtime', 'auth-command-contract-core.js');
const AUTH_ADAPTER_PATH = path.join(ROOT, 'core', 'platform', 'auth-contract-adapter.js');
const INTELLIGENCE_CORE_PATH = path.join(ROOT, 'core', 'intelligence', 'intelligence-domain-contract-core.js');
const INTELLIGENCE_ADAPTER_PATH = path.join(ROOT, 'core', 'platform', 'intelligence-contract-adapter.js');
const TRIP_DRAFT_CORE_PATH = path.join(ROOT, 'core', 'trips', 'trip-draft-core.js');
const TRIP_ADAPTER_PATH = path.join(ROOT, 'core', 'platform', 'trip-contract-adapter.js');
const MEDIA_CORE_PATH = path.join(ROOT, 'core', 'media', 'media-domain-contract-core.js');
const MEDIA_ADAPTER_PATH = path.join(ROOT, 'core', 'platform', 'media-contract-adapter.js');
const JOURNEY_CORE_PATH = path.join(ROOT, 'core', 'journey', 'journey-domain-contract-core.js');
const JOURNEY_RESILIENCE_PATH = path.join(ROOT, 'core', 'journey', 'journey-resilience-core.js');
const JOURNEY_ADAPTER_PATH = path.join(ROOT, 'core', 'platform', 'journey-contract-adapter.js');
const BOOKING_ADAPTER_PATH = path.join(ROOT, 'core', 'platform', 'booking-contract-adapter.js');
const BOOKING_DRAFT_CORE_PATH = path.join(ROOT, 'core', 'booking', 'booking-draft-core.js');
const COLLABORATION_CORE_PATH = path.join(ROOT, 'core', 'collaboration', 'collaboration-interaction-contract-core.js');
const COLLABORATION_ADAPTER_PATH = path.join(ROOT, 'core', 'platform', 'collaboration-contract-adapter.js');
const PLACES_CORE_PATH = path.join(ROOT, 'core', 'places', 'places-domain-contract-core.js');
const PLACES_ADAPTER_PATH = path.join(ROOT, 'core', 'platform', 'places-contract-adapter.js');
const MEMORY_CORE_PATH = path.join(ROOT, 'core', 'memory', 'memory-domain-contract-core.js');
const MEMORY_ADAPTER_PATH = path.join(ROOT, 'core', 'platform', 'memory-contract-adapter.js');
const PLATFORM_ACTION_CORE_PATH = path.join(ROOT, 'core', 'runtime', 'platform-action-contract-core.js');
const PLATFORM_ACTION_ADAPTER_PATH = path.join(ROOT, 'app', 'adapters', 'platform-action-web-adapter.js');
const VISUAL_INVENTORY_PATH = path.join(ROOT, 'config', 'luvia-visual-surface-inventory.json');
const FAILURE_MATRIX_PATH = path.join(ROOT, 'config', 'luvia-human-ai-parity-failure-matrix.v1.json');
const DEFAULT_REPORT_PATH = path.join(ROOT, 'docs', 'modularization', 'M16.5-HUMAN-AI-ACTION-PARITY-REPORT.md');
const SOURCE_WORKBOOK_SHA256 = '42E4B9D2115EE6CF38E3B7E9EDA1148AAACCB63CF14C8780C9EDA8A67CE48E46';

const OWNER_BINDING_DECISIONS_BUNDLE_1 = Object.freeze({
  'places.category.select': { contract: 'places.v1', method: 'reads.categories', operationKey: 'category' },
  'places.quick-query.select': { contract: 'places.v1', method: 'reads.recommend', operationKey: 'query' },
  'places.filter.open-now': { contract: 'places.v1', method: 'reads.recommend', operationKey: 'openNow' },
  'places.filter.rating': { contract: 'places.v1', method: 'reads.recommend', operationKey: 'minRating' },
  'places.filter.vegetarian': { contract: 'places.v1', method: 'reads.recommend', operationKey: 'vegetarianOnly' },
  'places.filter.category': { contract: 'places.v1', method: 'reads.recommend', operationKey: 'category' },
  'places.filter.sort': { contract: 'places.v1', method: 'reads.recommend', operationKey: 'sortBy' },
  'places.filter.reset': { contract: 'places.v1', method: 'reads.recommend', operationKey: 'resetFilters' },
  'places.results.more': { contract: 'places.v1', method: 'reads.recommend', operationKey: 'page' },
  'places.results.refresh': { contract: 'places.v1', method: 'reads.recommend', operationKey: 'forceRefresh' },
  'places.results.retry': { contract: 'places.v1', method: 'reads.recommend', operationKey: 'retry' },
  'places.location.enable': { contract: 'places.v1', method: 'commands.setLocationEnabled', operationKey: 'enabled' },
  'places.location.refresh': { contract: 'places.v1', method: 'commands.refreshLocation', operationKey: 'userGesture' },
  'places.map.pin.select': { contract: 'places.v1', method: 'reads.getCard', operationKey: 'providerPlaceId' },
  'places.result.select': { contract: 'places.v1', method: 'reads.getCard', operationKey: 'providerPlaceId' },
  'places.detail.open': { contract: 'places.v1', method: 'reads.getDetails', operationKey: 'providerPlaceId' },
  'places.detail.gallery.open': { contract: 'places.v1', method: 'reads.getCard', operationKey: 'providerPlaceId' },
  'places.detail.alternative.open': { contract: 'places.v1', method: 'reads.getDetails', operationKey: 'providerPlaceId' },
  'places.lifecycle.visited.confirm': { contract: 'places.v1', method: 'commands.confirmVisit', operationKey: 'placeId|visitId' },
  'places.lifecycle.visited.reject': { contract: 'places.v1', method: 'commands.rejectVisit', operationKey: 'visitId|reason' },
  'places.favorites.clear': { contract: 'places.v1', method: 'commands.clearFavorites', operationKey: 'placeType|tripId', primaryDomain: 'places' },
  'places.plan.edit': { contract: 'journey.v1', method: 'commands.editEntry', operationKey: 'entryId|plannedAt' },
  'places.schedule.clear': { contract: 'journey.v1', method: 'commands.clearEntries', operationKey: 'entityType|tripId' },
  'places.lifecycle.discovered': { contract: 'places.v1', method: 'commands.updateLifecycle', operationKey: 'tripPlaceId|discovered', primaryDomain: 'places' },
  'places.lifecycle.memory.open': { contract: 'journey.v1', method: 'commands.openPhotoMemory', operationKey: 'entryId' },
  'journey.entry.create': { contract: 'journey.v1', method: 'commands.recordEvent', operationKey: 'tripId|title|startAt' },
  'journey.entry.title.update': { contract: 'journey.v1', method: 'commands.editEntry', operationKey: 'entryId|title' },
  'journey.entry.date.update': { contract: 'journey.v1', method: 'commands.editEntry', operationKey: 'entryId|date' },
  'journey.entry.time.update': { contract: 'journey.v1', method: 'commands.editEntry', operationKey: 'entryId|startAt|endAt' },
  'journey.entry.duration.update': { contract: 'journey.v1', method: 'commands.editEntry', operationKey: 'entryId|durationMinutes' },
  'journey.entry.notes.update': { contract: 'journey.v1', method: 'commands.editEntry', operationKey: 'entryId|notes' },
  'journey.entry.alternative.select': { contract: 'journey.v1', method: 'commands.editEntry', operationKey: 'entryId|alternativeId' },
  'journey.day.balance': { contract: 'journey.v1', method: 'reads.rehearseDay', operationKey: 'date|entries' },
  'memory.search': { contract: 'memory.v1', method: 'reads.library', operationKey: 'query' },
  'memory.filter': { contract: 'memory.v1', method: 'reads.library', operationKey: 'filter' },
  'memory.sort': { contract: 'memory.v1', method: 'reads.library', operationKey: 'sort' },
  'memory.media.select': { contract: 'memory.v1', method: 'composition.toggleSelection', operationKey: 'mediaId' },
  'memory.selection.clear': { contract: 'memory.v1', method: 'composition.createSelection', operationKey: 'clear' },
  'memory.preview.open': { contract: 'memory.v1', method: 'reads.signedAsset', operationKey: 'mediaId' },
  'memory.story.open': { contract: 'memory.v1', method: 'reads.getStory', operationKey: 'storyId' },
  'memory.moment.create': { contract: 'memory.v1', method: 'commands.cards.save', operationKey: 'tripId|content|mediaId' },
  'memory.journey.create': { contract: 'memory.v1', method: 'commands.stories.save', operationKey: 'tripId|items' },
  'memory.story.create': { contract: 'memory.v1', method: 'commands.stories.save', operationKey: 'tripId|title|items' },
  'memory.story.title.update': { contract: 'memory.v1', method: 'commands.stories.save', operationKey: 'storyId|title' },
  'memory.story.mood.update': { contract: 'memory.v1', method: 'commands.stories.save', operationKey: 'storyId|mood' },
  'memory.story.description.update': { contract: 'memory.v1', method: 'commands.stories.save', operationKey: 'storyId|description' },
  'memory.story.media.reorder': { contract: 'memory.v1', method: 'commands.stories.save', operationKey: 'storyId|items' },
  'memory.story.cover.select': { contract: 'memory.v1', method: 'commands.stories.save', operationKey: 'storyId|coverMediaId' },
  'memory.story.favorite-media.select': { contract: 'memory.v1', method: 'commands.stories.save', operationKey: 'storyId|favoriteMediaIds' },
  'memory.story.participants.select': { contract: 'memory.v1', method: 'commands.stories.save', operationKey: 'storyId|participantIds' },
  'memory.story.date-range.update': { contract: 'memory.v1', method: 'commands.stories.save', operationKey: 'storyId|startAt|endAt' },
  'memory.story.location.update': { contract: 'memory.v1', method: 'commands.stories.save', operationKey: 'storyId|placeId' },
  'memory.story.chapter.update': { contract: 'memory.v1', method: 'commands.stories.save', operationKey: 'storyId|chapters' },
  'memory.story.edit': { contract: 'memory.v1', method: 'reads.getStory', operationKey: 'storyId' },
  'memory.contribution.answer': { contract: 'memory.v1', method: 'commands.stories.contribute', operationKey: 'storyId|answerText' },
  'memory.contribution.reaction': { contract: 'memory.v1', method: 'commands.stories.contribute', operationKey: 'storyId|reaction' },
  'memory.review.include': { contract: 'memory.v1', method: 'composition.toggleSelection', operationKey: 'mediaId|include' },
  'memory.review.exclude': { contract: 'memory.v1', method: 'composition.toggleSelection', operationKey: 'mediaId|exclude' },
  'events.to-journey.plan': { contract: 'journey.v1', method: 'commands.recordEvent', operationKey: 'eventId|startAt|endAt|venue', primaryDomain: 'journey' },
  'events.to-memory.save': { contract: 'memory.v1', method: 'commands.cards.save', operationKey: 'eventId|attendanceEvidence|mediaIds', primaryDomain: 'memory' },
});

const OWNER_BINDING_DECISIONS_BUNDLE_2 = Object.freeze({
  'trip.open': { contract: 'trip.v1', method: 'reads.getActiveTrip', operationKey: 'activeTrip' },
  'trip.draft.title.set': { contract: 'trip.v1', method: 'composition.updateDraft', operationKey: 'title' },
  'trip.draft.subtitle.set': { contract: 'trip.v1', method: 'composition.updateDraft', operationKey: 'subtitle' },
  'trip.draft.symbol.set': { contract: 'trip.v1', method: 'composition.updateDraft', operationKey: 'symbol' },
  'trip.draft.feelings.set': { contract: 'trip.v1', method: 'composition.updateDraft', operationKey: 'feelings' },
  'trip.draft.destination.search': { contract: 'places.v1', method: 'reads.suggestDestinations', operationKey: 'query', primaryDomain: 'places' },
  'trip.draft.destination.select': { contract: 'trip.v1', method: 'composition.updateDraft', operationKey: 'destination' },
  'trip.draft.schedule-mode.set': { contract: 'trip.v1', method: 'composition.updateDraft', operationKey: 'scheduleMode' },
  'trip.draft.dates.set': { contract: 'trip.v1', method: 'composition.updateDraft', operationKey: 'startDate|endDate' },
  'trip.draft.flexibility.set': { contract: 'trip.v1', method: 'composition.updateDraft', operationKey: 'flexibility' },
  'trip.draft.participants-mode.set': { contract: 'trip.v1', method: 'composition.updateDraft', operationKey: 'participantPlan' },
  'trip.draft.privacy.set': { contract: 'trip.v1', method: 'composition.updateDraft', operationKey: 'privacy' },
  'trip.draft.modules.set': { contract: 'trip.v1', method: 'composition.updateDraft', operationKey: 'modules' },
  'trip.draft.accent.set': { contract: 'trip.v1', method: 'composition.updateDraft', operationKey: 'accent' },
  'trip.draft.defer': { contract: 'trip.v1', method: 'composition.deferDraft', operationKey: 'deferred' },
  'trip.create': { contract: 'trip.v1', method: 'commands.createFirstTrip', operationKey: 'draft|idempotencyKey' },
  'media.upload': { contract: 'media.v1', method: 'commands.media.upload', operationKey: 'file|options' },
  'media.gallery.read': { contract: 'media.v1', method: 'reads.listMedia', operationKey: 'tripId' },
  'media.gallery.filter.all': { contract: 'media.v1', method: 'reads.listMedia', operationKey: 'all' },
  'media.gallery.filter.favorites': { contract: 'media.v1', method: 'reads.listMedia', operationKey: 'favorite' },
  'media.gallery.filter.days': { contract: 'media.v1', method: 'reads.listMedia', operationKey: 'dayKey' },
  'media.photo.open': { contract: 'media.v1', method: 'reads.getMedia', operationKey: 'mediaId' },
  'media.photo.download': { contract: 'media.v1', method: 'reads.download', operationKey: 'mediaId|variant' },
  'media.photo.favorite': { contract: 'media.v1', method: 'commands.media.toggleFavorite', operationKey: 'mediaId' },
  'media.photo.title.update': { contract: 'media.v1', method: 'commands.media.update', operationKey: 'mediaId|displayName' },
  'media.photo.metadata.update': { contract: 'media.v1', method: 'commands.media.update', operationKey: 'mediaId|capturedAt|placeId|metadata' },
  'media.photo.rotate': { contract: 'media.v1', method: 'commands.media.update', operationKey: 'mediaId|editSettings.rotation' },
  'media.photo.preset.apply': { contract: 'media.v1', method: 'commands.media.update', operationKey: 'mediaId|editSettings.filter' },
  'media.photo.ratio.update': { contract: 'media.v1', method: 'commands.media.update', operationKey: 'mediaId|editSettings.crop' },
  'media.photo.polaroid.create': { contract: 'media.v1', method: 'commands.media.setPolaroid', operationKey: 'mediaId|dayKey' },
  'media.photo.delete': { contract: 'media.v1', method: 'commands.media.remove', operationKey: 'mediaId' },
  'identity.learning-signal.confirm': { contract: 'intelligence.v1', method: 'commands.confirmLearningSignal', operationKey: 'signalId|confirmed', primaryDomain: 'intelligence' },
  'identity.learning-signal.dismiss': { contract: 'intelligence.v1', method: 'commands.dismissLearningSignal', operationKey: 'signalId|dismissed', primaryDomain: 'intelligence' },
  'settings.dashboard-widget.toggle': { contract: 'identity.v1', method: 'commands.updateDashboardLayout', operationKey: 'widgetId|enabled' },
  'settings.dashboard-widget.move': { contract: 'identity.v1', method: 'commands.updateDashboardLayout', operationKey: 'widgetId|position' },
  'device.location.refresh': { contract: 'places.v1', method: 'commands.refreshLocation', operationKey: 'userGesture', primaryDomain: 'places' },
  'device.notifications.request': { contract: 'identity.v1', method: 'commands.requestNotificationPermission', operationKey: 'userGesture' },
  'trip.archive': { contract: 'identity.v1', method: 'commands.setTripArchived', operationKey: 'tripId|archived' },
  'trip.restore': { contract: 'identity.v1', method: 'commands.setTripArchived', operationKey: 'tripId|archived' },
});

const OWNER_BINDING_DECISIONS_BUNDLE_3 = Object.freeze({
  'auth.mode.login': { contract: 'auth.v1', method: 'composition.selectMode', operationKey: 'login' },
  'auth.mode.register': { contract: 'auth.v1', method: 'composition.selectMode', operationKey: 'register' },
  'auth.email.sign-in': { contract: 'auth.v1', method: 'commands.signInWithPassword', operationKey: 'email|password' },
  'auth.email.sign-up': { contract: 'auth.v1', method: 'commands.signUpWithPassword', operationKey: 'email|password|profile' },
  'auth.oauth.google.sign-in': { contract: 'auth.v1', method: 'commands.signInWithProvider', operationKey: 'google' },
  'auth.oauth.apple.sign-in': { contract: 'auth.v1', method: 'commands.signInWithProvider', operationKey: 'apple' },
  'auth.password.reset.request': { contract: 'auth.v1', method: 'commands.requestPasswordReset', operationKey: 'email' },
  'auth.password.reset.complete': { contract: 'auth.v1', method: 'commands.completePasswordReset', operationKey: 'password' },
  'auth.recovery.new-link': { contract: 'auth.v1', method: 'commands.requestPasswordReset', operationKey: 'email' },
  'auth.provider.google.link': { contract: 'auth.v1', method: 'commands.linkProvider', operationKey: 'google' },
  'auth.provider.apple.link': { contract: 'auth.v1', method: 'commands.linkProvider', operationKey: 'apple' },
  'auth.password.update': { contract: 'auth.v1', method: 'commands.updatePassword', operationKey: 'password' },
  'auth.session.sign-out': { contract: 'auth.v1', method: 'commands.signOut', operationKey: 'local-session' },
  'auth.anonymous-upgrade.request-email': { contract: 'auth.v1', method: 'commands.requestAnonymousEmail', operationKey: 'email|displayName' },
  'auth.anonymous-upgrade.check': { contract: 'auth.v1', method: 'reads.checkAnonymousUpgrade', operationKey: 'pendingUpgrade' },
  'auth.anonymous-upgrade.resend': { contract: 'auth.v1', method: 'commands.resendAnonymousEmail', operationKey: 'pendingUpgrade' },
  'auth.anonymous-upgrade.change-email': { contract: 'auth.v1', method: 'commands.changeAnonymousEmail', operationKey: 'email|pendingUpgrade' },
  'auth.anonymous-upgrade.complete': { contract: 'auth.v1', method: 'commands.completeAnonymousUpgrade', operationKey: 'password' },
  'identity.profile.export': { contract: 'identity.v1', method: 'reads.exportData', operationKey: 'self' },

  'trip.invite.open': { contract: 'collaboration.interaction.v1', method: 'commands.openInvite', operationKey: 'trip' },
  'trip.invite.code.copy': { contract: 'collaboration.interaction.v1', method: 'commands.copyInviteCode', operationKey: 'trip' },
  'trip.invite.link.copy': { contract: 'collaboration.interaction.v1', method: 'commands.copyInviteLink', operationKey: 'trip' },
  'trip.invite.native-share': { contract: 'collaboration.interaction.v1', method: 'commands.shareInvite', operationKey: 'trip' },
  'trip.invite.email': { contract: 'collaboration.interaction.v1', method: 'commands.openInviteEmail', operationKey: 'trip' },
  'trip.invite.whatsapp': { contract: 'collaboration.interaction.v1', method: 'commands.openInviteWhatsApp', operationKey: 'trip' },
  'trip.join.code.enter': { contract: 'collaboration.interaction.v1', method: 'commands.setPendingJoinCode', operationKey: 'code' },
  'trip.join.preview': { contract: 'collaboration.interaction.v1', method: 'reads.previewInvite', operationKey: 'code' },
  'trip.join.accept': { contract: 'collaboration.interaction.v1', method: 'commands.joinTrip', operationKey: 'code|memberName' },
  'trip.join.cancel': { contract: 'collaboration.interaction.v1', method: 'commands.cancelJoin', operationKey: 'pendingJoin' },
  'trip.join.open': { contract: 'collaboration.interaction.v1', method: 'commands.openJoinedTrip', operationKey: 'tripId' },
  'journey.visit.confirm': { contract: 'places.v1', method: 'commands.confirmVisit', operationKey: 'placeId|visitId', primaryDomain: 'places' },
  'journey.visit.reject': { contract: 'places.v1', method: 'commands.rejectVisit', operationKey: 'visitId|reason', primaryDomain: 'places' },
  'collaboration.proposal.open': { contract: 'collaboration.interaction.v1', method: 'reads.listProposals', operationKey: 'tripId|proposalId' },
  'collaboration.proposal.vote-yes': { contract: 'collaboration.interaction.v1', method: 'commands.voteProposal', operationKey: 'proposalId|yes' },
  'collaboration.proposal.vote-no': { contract: 'collaboration.interaction.v1', method: 'commands.voteProposal', operationKey: 'proposalId|no' },
  'collaboration.proposal.abstain': { contract: 'collaboration.interaction.v1', method: 'commands.voteProposal', operationKey: 'proposalId|abstain' },

  'booking.availability.read': { contract: 'booking.v1', method: 'reads.checkAvailability', operationKey: 'providerId|venueReference|date|time|partySize' },
  'booking.draft.date.set': { contract: 'booking.v1', method: 'composition.updateDraft', operationKey: 'date' },
  'booking.draft.time.set': { contract: 'booking.v1', method: 'composition.updateDraft', operationKey: 'time' },
  'booking.draft.party-size.set': { contract: 'booking.v1', method: 'composition.updateDraft', operationKey: 'partySize' },
  'booking.draft.occasion.set': { contract: 'booking.v1', method: 'composition.updateDraft', operationKey: 'occasion' },
  'booking.draft.note.set': { contract: 'booking.v1', method: 'composition.updateDraft', operationKey: 'note' },
  'booking.draft.contact.set': { contract: 'booking.v1', method: 'composition.updateDraft', operationKey: 'contact' },
  'booking.route.select': { contract: 'booking.v1', method: 'composition.selectRoute', operationKey: 'route' },
  'booking.external-handoff.open': { contract: 'booking.v1', method: 'commands.openExternalHandoff', operationKey: 'place|route' },
  'booking.route.open': { contract: 'booking.v1', method: 'commands.openRoute', operationKey: 'bookingId|place|route' },
  'booking.channel.resolve': { contract: 'booking.v1', method: 'reads.resolveChannel', operationKey: 'bookingId|place' },
  'booking.recovery.retry': { contract: 'booking.v1', method: 'commands.retryRecovery', operationKey: 'bookingId|action|idempotencyKey' },
  'booking.recovery.reconcile': { contract: 'booking.v1', method: 'reads.reconcileUnknownOutcome', operationKey: 'requestId|action' },
  'booking.message.compose': { contract: 'booking.v1', method: 'composition.composeMessageDraft', operationKey: 'bookingId|bodyText' },
  'booking.thread.resolve': { contract: 'booking.v1', method: 'commands.resolveThread', operationKey: 'bookingId|resolved' },
});

const OWNER_BINDING_DECISIONS_BUNDLE_4 = Object.freeze({
  'ui.retry': { contract: 'platform.actions.v1', method: 'composition.retryIntent', operationKey: 'target|operation', primaryDomain: 'platform' },
  'ui.refresh': { contract: 'platform.actions.v1', method: 'composition.refreshIntent', operationKey: 'target|operation', primaryDomain: 'platform' },
  'places.view.map': { contract: 'places.v1', method: 'composition.selectView', operationKey: 'map' },
  'places.view.list': { contract: 'places.v1', method: 'composition.selectView', operationKey: 'list' },
  'places.detail.website.open': { contract: 'places.v1', method: 'commands.openWebsite', operationKey: 'place|url|userGesture' },
  'places.detail.phone.call': { contract: 'places.v1', method: 'commands.openPhone', operationKey: 'place|phone|userGesture' },
  'places.detail.maps.open': { contract: 'places.v1', method: 'commands.openMaps', operationKey: 'place|coordinates|userGesture' },
  'journey.external-link.open': { contract: 'journey.v1', method: 'commands.openExternalLink', operationKey: 'entryId|url|userGesture' },
  'journey.offline-pack.create': { contract: 'journey.v1', method: 'commands.saveOfflinePack', operationKey: 'trip|date|day' },
  'journey.offline-pack.remove': { contract: 'journey.v1', method: 'commands.removeOfflinePack', operationKey: 'trip|date' },
  'journey.undo': { contract: 'journey.v1', method: 'commands.undo', operationKey: 'receipt|operation|entryId' },
  'media.capture.open': { contract: 'media.v1', method: 'commands.acquisition.capture', operationKey: 'userGesture|facingMode' },
  'media.files.pick': { contract: 'media.v1', method: 'commands.acquisition.pick', operationKey: 'userGesture|multiple' },
  'media.gallery.filter.clusters': { contract: 'memory.v1', method: 'reads.listClusters', operationKey: 'tripId', primaryDomain: 'memory' },
  'media.photo.timeline.open': { contract: 'navigation.v1', method: 'createIntent', operationKey: 'timeline', primaryDomain: 'platform' },
  'media.photo.title.ai-suggest': { contract: 'media.v1', method: 'composition.suggestTitles', operationKey: 'media|location|day' },
  'media.photo.remove': { contract: 'memory.v1', method: 'composition.toggleSelection', operationKey: 'mediaId|exclude', primaryDomain: 'memory' },
  'memory.story.ai-weave': { contract: 'memory.v1', method: 'composition.weaveStoryDraft', operationKey: 'contributions|locationName' },
  'memory.story.ai-title': { contract: 'memory.v1', method: 'composition.suggestStoryTitles', operationKey: 'title|locationName|mood' },
  'memory.contribution.question.refresh': { contract: 'memory.v1', method: 'composition.nextContributionQuestion', operationKey: 'currentQuestionId' },
  'memory.vote.open': { contract: 'memory.v1', method: 'reads.getVote', operationKey: 'clusterId|cardIds' },
  'memory.vote.submit': { contract: 'memory.v1', method: 'commands.cards.saveAlbumVotes', operationKey: 'clusterId|votes|budget' },
  'memory.stack.dissolve': { contract: 'memory.v1', method: 'commands.cards.dissolveStack', operationKey: 'clusterId' },
  'memory.story.export': { contract: 'memory.v1', method: 'commands.exportStory', operationKey: 'story|format|userGesture' },
  'device.location.request': { contract: 'platform.actions.v1', method: 'commands.requestLocation', operationKey: 'mode|accuracy|userGesture' },
  'device.location.clear': { contract: 'platform.actions.v1', method: 'commands.clearLocation', operationKey: 'watchId|userGesture' },
  'device.camera.request': { contract: 'platform.actions.v1', method: 'commands.captureMedia', operationKey: 'userGesture|facingMode' },
  'device.files.pick': { contract: 'platform.actions.v1', method: 'commands.pickFiles', operationKey: 'userGesture|multiple' },
  'device.share.open': { contract: 'platform.actions.v1', method: 'commands.share', operationKey: 'title|text|url|userGesture' },
  'device.clipboard.write': { contract: 'platform.actions.v1', method: 'commands.copyText', operationKey: 'text|userGesture' },
  'device.download': { contract: 'platform.actions.v1', method: 'commands.download', operationKey: 'asset|filename|userGesture' },
  'device.notification.request': { contract: 'identity.v1', method: 'commands.requestNotificationPermission', operationKey: 'userGesture', primaryDomain: 'identity' },
  'offline.day-pack.create': { contract: 'journey.v1', method: 'commands.saveOfflinePack', operationKey: 'trip|date|day', primaryDomain: 'journey' },
  'offline.day-pack.remove': { contract: 'journey.v1', method: 'commands.removeOfflinePack', operationKey: 'trip|date', primaryDomain: 'journey' },
});

const OWNER_BINDING_DECISIONS = Object.freeze({
  ...OWNER_BINDING_DECISIONS_BUNDLE_1,
  ...OWNER_BINDING_DECISIONS_BUNDLE_2,
  ...OWNER_BINDING_DECISIONS_BUNDLE_3,
  ...OWNER_BINDING_DECISIONS_BUNDLE_4,
});

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex').toUpperCase();
}

function countBy(items, select) {
  return Object.fromEntries(
    [...items.reduce((map, item) => {
      const key = select(item);
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map()).entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]), 'de'))
  );
}

function loadActionCore() {
  const source = fs.readFileSync(ACTION_CORE_PATH, 'utf8');
  const context = { Object, Array, String, Number, Boolean, Date, Intl, Math, RegExp, JSON, Set, Map, Error, TypeError };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: ACTION_CORE_PATH });
  return context.LuviaIntelligenceActionContractCoreV1;
}

function loadRuntimeActions() { return Array.from(loadActionCore().listActions()); }

function loadNavigationOwnerContracts() {
  const context = { Object, Array, String, Number, Boolean, Date, Math, RegExp, JSON, Set, Map, Error, TypeError, decodeURIComponent, encodeURIComponent };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(NAVIGATION_CORE_PATH, 'utf8'), context, { filename: NAVIGATION_CORE_PATH });
  vm.runInContext(fs.readFileSync(NAVIGATION_HISTORY_CORE_PATH, 'utf8'), context, { filename: NAVIGATION_HISTORY_CORE_PATH });
  const navigation = context.LuviaNavigationContractCoreV1;
  const history = context.LuviaNavigationHistoryPolicyCoreV1.createPolicy({ navigation });
  return { navigation, history };
}

function loadAuthOwnerContract() {
  const authState = { loading: false, anonymous: false, authenticated: true, signedOut: false, email: 'test@example.invalid', emailConfirmed: true, provider: 'email', identities: [{ provider: 'email' }], user: { id: 'user-1', email: 'test@example.invalid', user_metadata: { display_name: 'Luvia' } }, pendingUpgrade: null, lastEvent: 'TEST' };
  const auth = {
    getState: () => authState,
    signIn: async () => ({}), signUp: async () => ({}), signInWithProvider: async () => ({}), resetPassword: async () => true,
    updatePassword: async () => ({}), linkProvider: async () => ({}), signOut: async () => { authState.authenticated = false; authState.signedOut = true; authState.user = null; },
    requestAnonymousEmail: async input => { authState.pendingUpgrade = { ...input, stage: 'email-sent' }; return {}; },
    checkUpgradeConfirmation: async () => ({ confirmed: false }), cancelPendingUpgrade: () => { authState.pendingUpgrade = null; }, completeAnonymousUpgrade: async () => ({}),
  };
  const context = { Object, Array, String, Number, Boolean, Date, Math, RegExp, JSON, Set, Map, Error, TypeError, Promise, encodeURIComponent, LuviaAuth: auth, LuviaGlobalContracts: { register() {} } };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(AUTH_CORE_PATH, 'utf8'), context, { filename: AUTH_CORE_PATH });
  vm.runInContext(fs.readFileSync(AUTH_ADAPTER_PATH, 'utf8'), context, { filename: AUTH_ADAPTER_PATH });
  return context.LuviaAuthContractV1;
}

function loadIdentityOwnerContract() {
  const listeners = new Map();
  const context = {
    Object, Array, String, Number, Boolean, Date, Math, RegExp, JSON, Set, Map, Error, TypeError, Promise, structuredClone,
    CustomEvent: function CustomEvent(name, options) { this.type = name; this.detail = options?.detail; },
    addEventListener(name, listener) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(listener); },
    removeEventListener(name, listener) { listeners.get(name)?.delete(listener); },
    dispatchEvent() {},
    LuviaProfileService: {
      snapshot: () => ({ profile: { userId: 'b0-owner-audit', displayName: 'Luvia', archivedTripIds: [] } }),
      save: patch => patch,
      saveDashboardLayout: layout => ({ userId: 'b0-owner-audit', displayName: 'Luvia', layout }),
      archiveTrip: (tripId, archived) => ({ userId: 'b0-owner-audit', displayName: 'Luvia', archivedTripIds: archived ? [tripId] : [] }),
    },
    LuviaUserPreferences: { get: () => ({}), update: patch => patch, replaceCategory: (category, value) => ({ [category]: value }) },
    LuviaTravelPreferences: {},
    LuviaPlatformPorts: { get: id => id === 'NotificationPort' ? { requestPermission: async () => 'granted', status: () => ({ supported: true, permission: 'granted' }) } : null, has: id => id === 'NotificationPort' },
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(IDENTITY_CORE_PATH, 'utf8'), context, { filename: IDENTITY_CORE_PATH });
  vm.runInContext(fs.readFileSync(IDENTITY_ADAPTER_PATH, 'utf8'), context, { filename: IDENTITY_ADAPTER_PATH });
  return { contract: context.LuviaIdentityContractV1, core: context.LuviaIdentityDomainContractCoreV1 };
}

function loadIntelligenceOwnerContract() {
  const context = {
    Object, Array, String, Number, Boolean, Date, Intl, Math, RegExp, JSON, Set, Map, Error, TypeError, Promise,
    LuviaAIMemory: {
      snapshot: () => ({ signals: [] }),
      confirmSignal: async signal => ({ ...signal, status: 'confirmed' }),
      dismissSignal: async signal => ({ ...signal, status: 'dismissed' }),
      subscribe: () => () => {},
    },
    LuviaFeatureFlagRegistry: { register() {} },
    LuviaGlobalContracts: { register() {} },
  };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(INTELLIGENCE_CORE_PATH, 'utf8'), context, { filename: INTELLIGENCE_CORE_PATH });
  vm.runInContext(fs.readFileSync(INTELLIGENCE_ADAPTER_PATH, 'utf8'), context, { filename: INTELLIGENCE_ADAPTER_PATH });
  return context.LuviaIntelligenceContractV1;
}

function loadTripOwnerContract() {
  let activeTrip = { id: 'trip-1', title: 'Scharbeutz', destination: { name: 'Scharbeutz', placeId: 'place-scharbeutz' }, modules: ['places'] };
  const snapshot = () => ({ trips: [activeTrip], activeTrip, activeTripId: activeTrip.id, loaded: true });
  const store = {
    snapshot,
    subscribe: () => () => {},
    initialize() {},
    loadRemote: async () => {},
    setActive() {},
    upsert(trip) { activeTrip = { ...activeTrip, ...trip }; },
  };
  const context = {
    Object, Array, String, Number, Boolean, Date, Intl, Math, RegExp, JSON, Set, Map, Error, TypeError, Promise,
    CustomEvent: function CustomEvent(name, options) { this.type = name; this.detail = options?.detail; },
    addEventListener() {}, dispatchEvent() {},
    LuviaTripStore: store,
    LuviaTripStateReaderV1: store,
    LuviaTripContext: { getActiveTrip: () => activeTrip, getSnapshot: () => ({ tripId: activeTrip.id, hasActiveTrip: true }) },
    LuviaTripCreator: { save: async input => { activeTrip = { id: input.id || 'trip-created', ...input }; return activeTrip; } },
    LuviaTripExperience: { update: async (trip, patch) => { activeTrip = { ...trip, ...patch }; return activeTrip; } },
    LuviaJoinFlow: { join: async () => ({ tripId: activeTrip.id }) },
    LuviaGlobalContracts: { register() {} },
  };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(TRIP_DRAFT_CORE_PATH, 'utf8'), context, { filename: TRIP_DRAFT_CORE_PATH });
  vm.runInContext(fs.readFileSync(TRIP_ADAPTER_PATH, 'utf8'), context, { filename: TRIP_ADAPTER_PATH });
  return context.LuviaTripContractV1;
}

function loadCollaborationOwnerContract() {
  const trip = { id: 'trip-1', title: 'Scharbeutz', joinCode: 'LUVIA7K2', destinationName: 'Scharbeutz' };
  const context = {
    Object, Array, String, Number, Boolean, Date, Math, RegExp, JSON, Set, Map, Error, TypeError, Promise, encodeURIComponent,
    location: { origin: 'https://example.invalid', pathname: '/index.html' },
    LuviaTripContractV1: {
      reads: { getActiveTrip: () => trip },
      commands: { joinTrip: async () => ({ joined: true, tripId: trip.id }), selectActiveTrip: id => ({ activeTrip: { ...trip, id } }) },
    },
    LuviaJoinFlow: { preview: async () => ({ trip_id: trip.id, trip_name: trip.title }), setPending() {} },
    LuviaTripExperience: { openInvite() {} },
    LuviaJourneyPlaceProposals: { list: async () => [], vote: async (id, value) => ({ id, vote: value }) },
    LuviaPlatformPorts: { get: id => id === 'SharingPort' ? { copyText: async () => true, share: async () => true } : id === 'ExternalNavigationPort' ? { open: () => true } : null },
    LuviaGlobalContracts: { register() {} },
  };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(COLLABORATION_CORE_PATH, 'utf8'), context, { filename: COLLABORATION_CORE_PATH });
  vm.runInContext(fs.readFileSync(COLLABORATION_ADAPTER_PATH, 'utf8'), context, { filename: COLLABORATION_ADAPTER_PATH });
  return context.LuviaCollaborationInteractionContractV1;
}

function loadMediaOwnerContract() {
  const media = { id: 'media-1', tripId: 'trip-1', displayName: 'Meer', dayKey: '2026-09-01', favorite: false, metadata: {} };
  const context = {
    Object, Array, String, Number, Boolean, Date, Intl, Math, RegExp, JSON, Set, Map, Error, TypeError, Promise,
    addEventListener() {},
    LuviaMediaCore: {
      list: async () => [media], get: async () => media, signedUrl: async () => 'https://example.invalid/preview',
      signedOriginalUrl: async () => 'https://example.invalid/original', downloadAsset: async id => ({ id }),
      listPolaroids: async () => ({}), subscribe: async () => () => {}, uploadQueueDiagnostics: async () => ({ online: true, total: 0, counts: {} }),
      upload: async () => media, update: async (id, patch) => ({ ...media, id, ...patch }), updateLegacyGallery: async () => media,
      reanalyze: async () => media, toggleFavorite: async () => ({ ...media, favorite: true }), setPolaroid: async (mediaId, dayKey) => ({ mediaId, dayKey }),
      linkPlace: async (mediaId, placeId) => ({ mediaId, placeId }), remove: async () => true, saveRenderedPreview: async () => media,
      clearTripGallery: async () => ({ tripId: 'trip-1', count: 1 }),
    },
    LuviaMemoryAlbums: { list: async () => [], save: async input => input, remove: async () => true, setFavorite: async () => null, saveContribution: async () => null },
    LuviaMemoryCards: { list: async () => [], save: async input => input, setWeight: async () => null, dismiss: async () => true, setAlbumReview: async () => null, saveAlbumVotes: async () => [], updateStory: async () => null, syncPhotoCandidates: async () => true, saveTitleProposal: async () => null, dissolveStack: async () => true },
    LuviaMemoryJourneys: { list: async () => [], save: async input => input, saveContribution: async () => null },
    LuviaGlobalContracts: { register() {} },
  };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(MEDIA_CORE_PATH, 'utf8'), context, { filename: MEDIA_CORE_PATH });
  vm.runInContext(fs.readFileSync(MEDIA_ADAPTER_PATH, 'utf8'), context, { filename: MEDIA_ADAPTER_PATH });
  return context.LuviaMediaContractV1;
}

function loadJourneyOwnerContract() {
  const context = {
    Object, Array, String, Number, Boolean, Date, Intl, Math, RegExp, JSON, Set, Map, Error, TypeError, Promise,
    CustomEvent: function CustomEvent(name, options) { this.type = name; this.detail = options?.detail; },
    dispatchEvent() {},
    LuviaTimelineCore: {
      snapshot: () => ({ entries: [{ id: 'entry-1', source: 'schedule', tripId: 'trip-1', title: 'Abendessen', entityType: 'restaurant', startAt: '2026-09-01T18:00:00.000Z', durationMinutes: 90, metadata: { planTrust: 'confirmed' } }] }),
      subscribe: () => () => {},
      diagnostics: () => ({ cloudAuthoritative: true, realtime: false, metrics: {} }),
      removeEntry: async () => true,
      clearEntries: async () => true,
    },
    LuviaTripContractV1: { getActiveTrip: () => ({ id: 'trip-1', title: 'Scharbeutz', startDate: '2026-09-01', endDate: '2026-09-02' }) },
    LuviaFeatureFlagRegistry: { register() {} },
    LuviaGlobalContracts: { register() {} },
  };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(JOURNEY_CORE_PATH, 'utf8'), context, { filename: JOURNEY_CORE_PATH });
  vm.runInContext(fs.readFileSync(JOURNEY_RESILIENCE_PATH, 'utf8'), context, { filename: JOURNEY_RESILIENCE_PATH });
  vm.runInContext(fs.readFileSync(JOURNEY_ADAPTER_PATH, 'utf8'), context, { filename: JOURNEY_ADAPTER_PATH });
  return context.LuviaJourneyContractV1;
}

function loadBookingOwnerContract() {
  const runtime = {
    init: async () => ({}), listForTrip: async () => [], get: async () => null, conversation: async () => ({}), messages: async () => [],
    bookingTimeline: async () => ({ items: [] }), providerCapabilities: async () => [], conversationPreferences: async () => [],
    createForPlace: async input => input, reply: async (id, input) => ({ id, ...input }), performIntelligenceAction: async (id, input) => ({ id, ...input }),
    modifyBooking: async (id, input) => ({ id, ...input }), cancelBooking: async (id, input) => ({ id, ...input }),
    setConversationPreference: async (id, action, value) => ({ id, action, value }), updateContact: async (id, email) => ({ id, email }),
    reconcileTripReturns: async tripId => ({ tripId }), resolveRoute: async id => ({ provider: 'official', value: `https://example.invalid/book/${id}` }),
    resolvePlaceRoute: async () => ({ provider: 'official', value: 'https://example.invalid/book/place' }), recordHandoff: async () => ({}), recordPlaceHandoff: async () => ({}),
  };
  const context = {
    Object, Array, String, Number, Boolean, Date, Math, RegExp, JSON, Set, Map, Error, TypeError, Promise,
    LuviaBooking: runtime,
    LuviaBookingUI: { openForPlace: async () => ({ opened: true, channel: 'owner_dialog' }) },
    LuviaBookingAvailability: { check: async input => ({ available: true, input }) },
    LuviaBookingReservationRecovery: { reconcile: async input => ({ reconciled: true, input }) },
    LuviaPlatformPorts: { get: id => id === 'ExternalNavigationPort' ? { open: () => true } : null },
    LuviaGlobalContracts: { register() {} },
  };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(BOOKING_DRAFT_CORE_PATH, 'utf8'), context, { filename: BOOKING_DRAFT_CORE_PATH });
  vm.runInContext(fs.readFileSync(BOOKING_ADAPTER_PATH, 'utf8'), context, { filename: BOOKING_ADAPTER_PATH });
  return context.LuviaBookingContractV1;
}

function loadPlacesOwnerContract() {
  const deepLinks = [];
  const context = {
    Object, Array, String, Number, Boolean, Date, Math, RegExp, JSON, Set, Map, Error, TypeError, Promise,
    CustomEvent: function CustomEvent(name, options) { this.type = name; this.detail = options?.detail; },
    addEventListener() {}, dispatchEvent() {},
    LuviaPlaceCore: {
      search: async () => ({ places: [] }), getPlace: id => ({ id, providerPlaceId: id, name: 'Place' }), getPlaces: () => [],
      importProviderPlace: async id => ({ place: { id, providerPlaceId: id, name: 'Place' } }),
      updateLifecycleCloud: async (id, lifecycle) => ({ tripPlace: { id, lifecycle_status: lifecycle } }),
      recordVisit: async id => ({ id: `visit-${id}`, placeId: id, state: 'visited', isConfirmed: true }),
    },
    LuviaPlaces: {
      details: async id => ({ data: { place: { id, providerPlaceId: id, name: 'Place' } } }),
      autocomplete: async () => ({ data: { suggestions: [] } }), photo: async () => ({ data: {} }),
    },
    LuviaPlaceCommands: {
      favorite: async input => input, unfavorite: async input => input, toggleFavorite: async input => input,
      clearFavorites: async () => ({}), plan: async input => input, unplan: async input => input,
    },
    LuviaPlacesDiscoveryService: { listSaved: async () => [], recommend: async () => ({ places: [] }) },
    LuviaPresenceVisitCore: {
      confirmVisit: async id => ({ id: `visit-${id}`, placeId: id, state: 'visited', isConfirmed: true }),
      rejectVisit: async id => ({ id, placeId: 'place-1', state: 'rejected', isConfirmed: false }),
      setGlobalEnabled: async enabled => ({ enabled }), refreshLocation: async () => ({ permission: 'granted' }), pendingVisits: () => [],
    },
    LuviaPlatformPorts: {
      get: id => id === 'DeepLinkPort' ? { open: value => { deepLinks.push(value); return value; } } : null,
      has: id => id === 'DeepLinkPort',
    },
    LuviaGlobalContracts: { register() {} },
  };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(PLACES_CORE_PATH, 'utf8'), context, { filename: PLACES_CORE_PATH });
  vm.runInContext(fs.readFileSync(PLACES_ADAPTER_PATH, 'utf8'), context, { filename: PLACES_ADAPTER_PATH });
  return context.LuviaPlacesContractV1;
}

function loadMemoryOwnerContract() {
  const noopSubscribe = async () => () => {};
  const context = {
    Object, Array, String, Number, Boolean, Date, Intl, Math, RegExp, JSON, Set, Map, Error, TypeError, Promise,
    LuviaMediaContractV1: { reads: { listMedia: async () => [], uploadQueueSnapshot: async () => ({ online: true, running: false, total: 0, counts: {} }), signedUrl: async id => ({ id, url: 'https://example.invalid/asset' }), subscribe: noopSubscribe } },
    LuviaMemoryAlbums: { list: async () => [], listClusters: async () => [], save: async input => input, remove: async () => true, saveContribution: async (id, input) => ({ id, ...input }), subscribe: noopSubscribe },
    LuviaMemoryCards: { list: async () => [], save: async input => input, updateStory: async (id, content) => ({ id, content }), dismiss: async () => true, albumVotes: async () => ({}), saveAlbumVotes: async () => [], dissolveStack: async () => true, subscribe: noopSubscribe },
    LuviaMemoryJourneys: { list: async () => [], get: async id => ({ id, title: 'Story' }), save: async input => input, remove: async () => true, saveContribution: async (id, input) => ({ id, ...input }), subscribe: noopSubscribe },
    LuviaTripContractV1: { getActiveTrip: () => ({ id: 'trip-1' }) },
    LuviaGlobalContracts: { register() {} },
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(MEMORY_CORE_PATH, 'utf8'), context, { filename: MEMORY_CORE_PATH });
  vm.runInContext(fs.readFileSync(MEMORY_ADAPTER_PATH, 'utf8'), context, { filename: MEMORY_ADAPTER_PATH });
  return context.LuviaMemoryContractV1;
}

function loadPlatformActionOwnerContract() {
  const element = () => ({ hidden: false, click() {}, remove() {}, set href(value) { this._href = value; }, get href() { return this._href; }, set download(value) { this._download = value; }, get download() { return this._download; } });
  const ports = {
    LocationPort: { getCurrent: async () => ({ latitude: 54, longitude: 10 }), watch: () => 1, clearWatch() {} },
    MediaCapturePort: { captureImage: async () => null }, MediaPickerPort: { pickImages: async () => [] },
    SharingPort: { share: async () => true, copyText: async () => true },
  };
  const context = {
    Object, Array, String, Number, Boolean, Date, Math, RegExp, JSON, Set, Map, Error, TypeError, Promise, URL, Blob, setTimeout,
    document: { createElement: element, body: { appendChild() {} } }, location: { href: 'https://example.invalid/' },
    LuviaPlatformPorts: { get: id => ports[id] || null }, LuviaGlobalContracts: { register() {} },
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(PLATFORM_ACTION_CORE_PATH, 'utf8'), context, { filename: PLATFORM_ACTION_CORE_PATH });
  vm.runInContext(fs.readFileSync(PLATFORM_ACTION_ADAPTER_PATH, 'utf8'), context, { filename: PLATFORM_ACTION_ADAPTER_PATH });
  return context.LuviaPlatformActionContractV1;
}

function methodAt(contract, pathExpression) {
  return String(pathExpression || '').split('.').reduce((value, key) => value?.[key], contract);
}

function materializeOwnerBindingDecisions() {
  const registry = readJson(REGISTRY_PATH);
  for (const [id, decision] of Object.entries(OWNER_BINDING_DECISIONS)) {
    const action = registry.actions.find(item => item.id === id);
    assert.ok(action, `owner binding decision references unknown action ${id}`);
    Object.assign(action.owner, decision, { bindingStatus: 'PUBLIC_CONTRACT_BOUND' });
  }
  registry.summary.ownerBinding = countBy(registry.actions, action => action.owner.bindingStatus);
  fs.writeFileSync(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
}

function registrySummary(registry, sourceAudit, runtimeActions) {
  return {
    semanticActions: registry.actions.length,
    availableOrConditional: registry.actions.filter(action => action.human.status !== 'DEMO_ONLY').length,
    unavailableOrReservedOutcomes: registry.unavailableOutcomes.length,
    auditedDataMarkers: sourceAudit.markers.length,
    runtimeRegisteredActions: runtimeActions.length,
    categories: countBy(registry.actions, action => action.category),
    effects: countBy(registry.actions, action => action.effect),
    risks: countBy(registry.actions, action => action.risk),
    aiCoverage: countBy(registry.actions, action => action.ai.coverage),
    ownerBinding: countBy(registry.actions, action => action.owner.bindingStatus),
    inputContracts: countBy(registry.actions, action => action.inputContract.status),
  };
}

function materializeNavigationAIParity() {
  const registry = readJson(REGISTRY_PATH);
  const inputContracts = readJson(INPUT_CONTRACTS_PATH);
  const auditText = fs.readFileSync(SOURCE_AUDIT_PATH, 'utf8').replace(/\r\n?/g, '\n');
  const sourceAudit = JSON.parse(auditText);
  const runtimeActions = loadRuntimeActions();
  if (!registry.actions.some(action => action.id === 'navigation.hotels.open')) {
    registry.actions.push({
      sequence: registry.actions.length + 1,
      id: 'navigation.hotels.open',
      category: 'Navigation & Oberfläche',
      area: 'Hauptnavigation',
      label: 'Hotels & Unterkünfte öffnen',
      surface: 'Planen / Living Compass / Globaler Luvia Chat',
      human: { status: 'AVAILABLE', sourceStatus: 'VERFÜGBAR' },
      effect: 'NAVIGATION',
      risk: 'R0',
      owner: { label: 'Platform', domains: ['platform', 'booking'], primaryDomain: 'platform', contract: 'navigation.v1', method: 'createIntent', bindingStatus: 'PUBLIC_CONTRACT_BOUND', operationKey: 'hotels' },
      ai: { coverage: 'MISSING', sourceCoverage: 'FEHLT', actionId: null, runtimeRegistered: false },
      inputContract: { status: 'OPEN', schemaId: null, requiredFields: [], optionalFields: [], contextFields: [] },
      lifecycle: { stateChanging: false, confirmationPolicy: 'NEVER', confirmationDescription: 'Direkter Navigationswunsch im Chat oder Auswahl in Planen', idempotency: 'NONE', reversible: null, compensationActionId: null, recoveryDescription: 'Erneut öffnen / zur vorherigen Ansicht zurück', lifecycleAuditStatus: 'OPEN' },
      delivery: { block: 'B0.02-NAVIGATION', publicEvidence: 'LOCAL_E2E_PENDING' },
      sources: ['core/runtime/navigation-contract-core.js', 'app/module-hubs.js', 'app/app-shell.js', 'modules/accommodations/accommodation-module.js'],
      note: 'Hotels sind ein eigenständiger Planen-Bereich; Suche und Buchungsweg bleiben Places- beziehungsweise Booking-owned.',
    });
  }
  const contract = inputContracts.contracts['navigation.route.open'];
  for (const action of registry.actions.filter(action => action.owner.contract === 'navigation.v1' && action.owner.method === 'createIntent')) {
    action.ai = { coverage: 'REGISTERED_PARTIAL', sourceCoverage: 'RUNTIME REGISTRIERT · ÖFFENTLICHER E2E NOCH OFFEN', actionId: 'navigation.route.open', runtimeRegistered: true };
    action.inputContract = { status: 'READY', schemaId: contract.schemaId, requiredFields: contract.required, optionalFields: contract.optional, contextFields: contract.context };
    action.delivery.block = 'B0.02-NAVIGATION';
    if (action.delivery.publicEvidence === 'OPEN') action.delivery.publicEvidence = 'LOCAL_E2E_PENDING';
  }
  registry.runtimeActionIds = runtimeActions.map(action => action.id).sort();
  registry.markerAudit = {
    ...registry.markerAudit,
    count: sourceAudit.markers.length,
    registrySha256: sha256(auditText),
    classifications: countBy(sourceAudit.markers, marker => marker.classification),
    categories: countBy(sourceAudit.markers, marker => marker.category),
  };
  registry.summary = registrySummary(registry, sourceAudit, runtimeActions);
  fs.writeFileSync(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
}

function currentSourceMarkers() {
  const inventory = readJson(VISUAL_INVENTORY_PATH);
  const activeFiles = inventory.activeEntryReferences
    .filter(file => /\.(js|mjs|html)$/.test(file) && !file.includes('luvia-runtime-') && !file.startsWith('vendor/'))
    .filter(file => ['app/', 'core/', 'modules/', 'auth/', 'intelligence/', 'ambient.js', 'luvia-app-state.js']
      .some(prefix => file.startsWith(prefix) || file === prefix));
  const markerMap = new Map();
  for (const relative of activeFiles) {
    const absolute = path.join(ROOT, relative);
    if (!fs.existsSync(absolute)) continue;
    const source = fs.readFileSync(absolute, 'utf8');
    const markers = new Set([...source.matchAll(/data-[a-z0-9-]+/g)].map(match => match[0]));
    for (const marker of markers) {
      if (!markerMap.has(marker)) markerMap.set(marker, new Set());
      markerMap.get(marker).add(relative);
    }
  }
  return new Map([...markerMap.entries()].map(([marker, files]) => [marker, [...files].sort()]));
}

function validateRegistry() {
  const registry = readJson(REGISTRY_PATH);
  const schema = readJson(SCHEMA_PATH);
  const inputContracts = readJson(INPUT_CONTRACTS_PATH);
  const auditText = fs.readFileSync(SOURCE_AUDIT_PATH, 'utf8').replace(/\r\n?/g, '\n');
  const sourceAudit = JSON.parse(auditText);
  const runtimeActions = loadRuntimeActions();
  const actionCore = loadActionCore();
  const navigationOwners = loadNavigationOwnerContracts();
  const authOwner = loadAuthOwnerContract();
  const identityOwner = loadIdentityOwnerContract();
  const intelligenceOwner = loadIntelligenceOwnerContract();
  const tripOwner = loadTripOwnerContract();
  const collaborationOwner = loadCollaborationOwnerContract();
  const mediaOwner = loadMediaOwnerContract();
  const journeyOwner = loadJourneyOwnerContract();
  const bookingOwner = loadBookingOwnerContract();
  const placesOwner = loadPlacesOwnerContract();
  const memoryOwner = loadMemoryOwnerContract();
  const platformActionOwner = loadPlatformActionOwnerContract();
  const runtimeById = new Map(runtimeActions.map(action => [action.id, action]));

  assert.equal(registry.contractId, 'luvia.human-ai-action-registry.v1');
  assert.equal(inputContracts.contractId, 'luvia.ai-action-input-contracts.v1');
  assert.equal(inputContracts.actionContractId, 'intelligence.actions.v1');
  assert.equal(inputContracts.enforcement, 'BOUNDED_RUNTIME_ENFORCEMENT_ACTIVE');
  assert.deepEqual(inputContracts.runtimeEnforcement.runtimeEnforcedActionIds, ['navigation.route.open', 'places.place.favorite', 'places.place.unfavorite', 'places.place.plan', 'places.place.unplan', 'booking.place.open', 'booking.stay.search', 'booking.trip.read', 'booking.reservation.create', 'booking.reservation.modify', 'booking.reservation.cancel', 'journey.day.read', 'journey.day.open', 'trip.active.list', 'trip.active.select', 'trip.update.details', 'places.restaurant.recommend', 'places.discovery.recommend', 'events.verified.read', 'memory.library.read', 'memory.story.save', 'identity.preferences.read', 'identity.preferences.update']);
  assert.equal(inputContracts.runtimeEnforcement.metadataValidatedOpenActionIds, 0);
  assert.equal(inputContracts.runtimeEnforcement.rejectsBeforeLedgerAndOwnerInvocation, true);
  assert.deepEqual(Array.from(actionCore.policySnapshot().inputEnforcement.runtimeEnforced), inputContracts.runtimeEnforcement.runtimeEnforcedActionIds);
  assert.equal(actionCore.policySnapshot().inputEnforcement.remaining, inputContracts.runtimeEnforcement.metadataValidatedOpenActionIds);
  const validPlan = actionCore.validateActionInput('places.place.plan', { tripId: 'trip', providerPlaceId: 'place', date: '2026-06-14', time: '14:00', fields: { planned_at: '2026-06-14T12:00:00.000Z' } }, { timeZone: 'Europe/Berlin' });
  const conflictingPlan = actionCore.validateActionInput('places.place.plan', { tripId: 'trip', providerPlaceId: 'place', date: '2026-06-14', time: '14:00', fields: { planned_at: '2026-06-14T14:00:00.000Z' } }, { timeZone: 'Europe/Berlin' });
  assert.equal(validPlan.valid, true, '14:00 Europe/Berlin must map to the exact owner instant');
  assert.equal(validPlan.normalized.plannedAt, '2026-06-14T12:00:00.000Z');
  assert.equal(conflictingPlan.valid, false, 'a shifted owner instant must be rejected');
  assert.ok(conflictingPlan.issues.some(issue => issue.code === 'conflict' && issue.path === 'fields.planned_at'));
  assert.equal(schema.$id, 'https://schemas.luvia.app/human-ai-action-registry.v1.schema.json');
  assert.equal(registry.source.workbookSha256, SOURCE_WORKBOOK_SHA256, 'reviewed workbook provenance changed');
  assert.equal(sourceAudit.sourceWorkbookSha256, SOURCE_WORKBOOK_SHA256, 'source audit and workbook provenance diverged');
  assert.equal(registry.markerAudit.registrySha256, sha256(auditText), 'source-audit registry hash is stale');
  assert.equal(registry.invariants.humanAiParity, 'NO_PRODUCT_EXCEPTION');
  assert.equal(registry.invariants.sameOwnerBoundary, true);
  assert.equal(registry.invariants.naturalLanguageAloneConfirmsMutation, false);
  assert.equal(registry.invariants.publicE2eRequiredForPass, true);
  assert.equal(registry.invariants.newUiActionRequiresRegistryDecision, true);

  assert.equal(registry.actions.length, 329, 'semantic action count changed without deliberate registry revision');
  assert.equal(registry.actions.filter(action => action.human.status !== 'DEMO_ONLY').length, 318);
  assert.equal(registry.unavailableOutcomes.length, 24);
  assert.equal(sourceAudit.markers.length, 898);
  assert.equal(sourceAudit.markerCount, 898);

  const ids = registry.actions.map(action => action.id);
  assert.equal(new Set(ids).size, ids.length, 'semantic action IDs must be unique');
  assert.equal(Object.keys(OWNER_BINDING_DECISIONS_BUNDLE_1).length, 60, 'the coherent Places/Journey/Memory/Event owner bundle must stay complete');
  assert.equal(Object.keys(OWNER_BINDING_DECISIONS_BUNDLE_2).length, 39, 'the coherent Trip/Media/Identity owner bundle must stay complete');
  assert.equal(Object.keys(OWNER_BINDING_DECISIONS_BUNDLE_3).length, 51, 'the coherent Auth/Collaboration/Booking owner bundle must stay complete');
  assert.equal(Object.keys(OWNER_BINDING_DECISIONS_BUNDLE_4).length, 34, 'the final Platform/Places/Journey/Media/Memory owner bundle must stay complete');
  assert.equal(Object.keys(OWNER_BINDING_DECISIONS).length, 184, 'the combined Block 0 owner decisions must stay collision-free');
  for (const [id, decision] of Object.entries(OWNER_BINDING_DECISIONS)) {
    const action = registry.actions.find(item => item.id === id);
    assert.ok(action, `owner binding decision references unknown action ${id}`);
    assert.equal(action.owner.bindingStatus, 'PUBLIC_CONTRACT_BOUND', `${id} owner decision was not materialized`);
    for (const [key, value] of Object.entries(decision)) assert.equal(action.owner[key], value, `${id} owner ${key} drift`);
  }
  assert.deepEqual(registry.actions.map(action => action.sequence), Array.from({ length: 329 }, (_, index) => index + 1), 'semantic action sequence must stay contiguous');
  for (const action of registry.actions) {
    assert.match(action.id, /^[a-z0-9]+(?:[.-][a-z0-9]+)+$/, `invalid action id ${action.id}`);
    assert.ok(action.category && action.area && action.label && action.surface, `${action.id} misses human-facing identity`);
    assert.ok(action.owner.label && action.owner.domains.length, `${action.id} misses canonical owner domain`);
    assert.ok(action.sources.length, `${action.id} misses source evidence`);
    assert.ok(action.lifecycle.confirmationDescription, `${action.id} misses source confirmation semantics`);
    assert.ok(action.lifecycle.recoveryDescription, `${action.id} misses recovery semantics`);

    if (action.lifecycle.stateChanging) {
      assert.equal(action.lifecycle.confirmationPolicy, 'EXPLICIT', `${action.id} state change must require separate explicit confirmation`);
      assert.equal(action.lifecycle.idempotency, 'REQUIRED', `${action.id} state change must require idempotency`);
    }
    if (action.ai.runtimeRegistered) {
      const runtime = runtimeById.get(action.ai.actionId);
      assert.ok(runtime, `${action.id} references unknown runtime action ${action.ai.actionId}`);
      assert.equal(action.owner.contract, runtime.ownerContract, `${action.id} owner contract drift`);
      assert.equal(action.owner.method, runtime.ownerMethod, `${action.id} owner method drift`);
    }
    if (action.owner.bindingStatus === 'PUBLIC_CONTRACT_BOUND') {
      assert.ok(action.owner.contract && action.owner.method && action.owner.operationKey, `${action.id} needs a complete public Owner binding`);
      if (action.owner.contract === 'navigation.v1') {
        assert.equal(action.owner.method, 'createIntent', `${action.id} must enter navigation through createIntent`);
        assert.equal(typeof navigationOwners.navigation[action.owner.method], 'function', `${action.id} references a missing navigation method`);
        assert.ok(navigationOwners.navigation.get(action.owner.operationKey), `${action.id} references an unknown route ${action.owner.operationKey}`);
        const intent = navigationOwners.navigation.createIntent(action.owner.operationKey, { source: 'b0-owner-audit' });
        assert.equal(intent.route, action.owner.operationKey, `${action.id} route intent drift`);
        assert.equal(intent.requiresDomainCommand, false, `${action.id} navigation must not invent a Domain command`);
      } else if (action.owner.contract === 'navigation-history.v1') {
        assert.equal(action.owner.method, action.owner.operationKey, `${action.id} history method/key drift`);
        assert.equal(typeof navigationOwners.history[action.owner.method], 'function', `${action.id} references a missing history method`);
        const command = navigationOwners.history[action.owner.method]();
        assert.equal(command.kind, 'navigation.history', `${action.id} must produce a public history command`);
        assert.equal(command.action, action.owner.operationKey, `${action.id} history command drift`);
      } else if (action.owner.contract === 'identity.v1') {
        assert.equal(typeof methodAt(identityOwner.contract, action.owner.method), 'function', `${action.id} references a missing Identity method`);
        if (action.owner.method === 'commands.updateProfile') {
          const fields = action.owner.operationKey === 'profilePatch'
            ? ['displayName', 'firstName', 'lastName', 'avatarUrl', 'avatarColor', 'language', 'timezone', 'homeLocation']
            : action.owner.operationKey.split('|');
          assert.ok(fields.length, `${action.id} needs at least one Identity field`);
          for (const field of fields) assert.ok(identityOwner.core.profileWriteFields.includes(field), `${action.id} references disallowed Identity field ${field}`);
        }
      } else if (action.owner.contract === 'auth.v1') {
        assert.equal(typeof methodAt(authOwner, action.owner.method), 'function', `${action.id} references a missing Auth method`);
        assert.equal(action.owner.operationKey.length > 0, true, `${action.id} needs a bounded Auth operation key`);
      } else if (action.owner.contract === 'intelligence.v1') {
        assert.equal(typeof methodAt(intelligenceOwner, action.owner.method), 'function', `${action.id} references a missing Intelligence method`);
        assert.equal(action.owner.operationKey.length > 0, true, `${action.id} needs a bounded Intelligence operation key`);
      } else if (action.owner.contract === 'trip.v1') {
        assert.equal(typeof methodAt(tripOwner, action.owner.method), 'function', `${action.id} references a missing Trip method`);
        assert.equal(action.owner.operationKey.length > 0, true, `${action.id} needs a bounded Trip operation key`);
        if (action.owner.method === 'composition.updateDraft') {
          for (const field of action.owner.operationKey.split('|')) assert.ok(tripOwner.composition.createDraft && tripOwner.composition.updateDraft && tripOwner.composition.validateDraft && tripOwner.composition.createDraft && tripOwner.composition.updateDraft({}, { [field]: field }), `${action.id} references an invalid Trip draft field ${field}`);
        }
      } else if (action.owner.contract === 'collaboration.interaction.v1') {
        assert.equal(typeof methodAt(collaborationOwner, action.owner.method), 'function', `${action.id} references a missing Collaboration method`);
        assert.equal(action.owner.operationKey.length > 0, true, `${action.id} needs a bounded Collaboration operation key`);
      } else if (action.owner.contract === 'media.v1') {
        assert.equal(typeof methodAt(mediaOwner, action.owner.method), 'function', `${action.id} references a missing Media method`);
        assert.equal(action.owner.operationKey.length > 0, true, `${action.id} needs a bounded Media operation key`);
      } else if (action.owner.contract === 'journey.v1') {
        const [namespace, method] = action.owner.method.split('.');
        assert.ok(['reads', 'commands'].includes(namespace) && method, `${action.id} needs a namespaced Journey method`);
        assert.equal(typeof journeyOwner[namespace]?.[method], 'function', `${action.id} references a missing Journey method`);
        assert.equal(action.owner.operationKey.length > 0, true, `${action.id} needs a bounded Journey operation key`);
      } else if (action.owner.contract === 'booking.v1') {
        const [namespace, method] = action.owner.method.split('.');
        assert.ok(['reads', 'commands', 'composition'].includes(namespace) && method, `${action.id} needs a namespaced Booking method`);
        assert.equal(typeof bookingOwner[namespace]?.[method], 'function', `${action.id} references a missing Booking method`);
        assert.equal(action.owner.operationKey.length > 0, true, `${action.id} needs a bounded Booking operation key`);
        if (action.owner.method === 'composition.updateDraft') {
          for (const field of action.owner.operationKey.split('|')) {
            const value = field === 'partySize' ? 2
              : field === 'contact' ? { email: 'test@example.invalid' }
                : field === 'date' ? '2026-09-01'
                  : field === 'time' ? '18:30'
                    : field;
            assert.ok(bookingOwner.composition.updateDraft({}, { [field]: value }), `${action.id} references an invalid Booking draft field ${field}`);
          }
        }
      } else if (action.owner.contract === 'places.v1') {
        assert.equal(typeof methodAt(placesOwner, action.owner.method), 'function', `${action.id} references a missing Places method`);
        assert.equal(action.owner.operationKey.length > 0, true, `${action.id} needs a bounded Places operation key`);
      } else if (action.owner.contract === 'memory.v1') {
        assert.equal(typeof methodAt(memoryOwner, action.owner.method), 'function', `${action.id} references a missing Memory method`);
        assert.equal(action.owner.operationKey.length > 0, true, `${action.id} needs a bounded Memory operation key`);
      } else if (action.owner.contract === 'platform.actions.v1') {
        assert.equal(typeof methodAt(platformActionOwner, action.owner.method), 'function', `${action.id} references a missing Platform action method`);
        assert.equal(action.owner.operationKey.length > 0, true, `${action.id} needs a bounded Platform operation key`);
      } else {
        assert.fail(`${action.id} uses an unaudited public contract ${action.owner.contract}`);
      }
    }
    if (action.ai.coverage === 'PUBLIC_E2E_PASS') {
      assert.equal(action.ai.runtimeRegistered, true, `${action.id} cannot pass publicly without a runtime action`);
      assert.equal(action.owner.bindingStatus, 'PUBLIC_E2E_PROVEN');
      assert.equal(action.delivery.publicEvidence, 'PUBLIC_E2E_PASS');
    }
    if (action.human.status === 'DEMO_ONLY') {
      assert.equal(action.delivery.block, 'EXCLUDED_DEMO');
      assert.equal(action.ai.coverage, 'NOT_APPLICABLE');
    }
  }

  const runtimeIds = runtimeActions.map(action => action.id).sort();
  assert.equal(runtimeIds.length, 23, 'runtime registry count changed; update the parity registry deliberately');
  assert.deepEqual(registry.runtimeActionIds, runtimeIds, 'runtime action registry and parity control plane diverged');
  assert.deepEqual(Object.keys(inputContracts.contracts).sort(), runtimeIds, 'every runtime action needs exactly one typed input contract');
  const schemaIds = new Set();
  for (const id of runtimeIds) {
    assert.ok(registry.actions.some(action => action.ai.actionId === id), `runtime action ${id} has no human-action mapping`);
    const contract = inputContracts.contracts[id];
    assert.ok(contract.schemaId && !schemaIds.has(contract.schemaId), `${id} needs a unique schema ID`);
    schemaIds.add(contract.schemaId);
    assert.ok(Array.isArray(contract.required) && Array.isArray(contract.optional) && Array.isArray(contract.context), `${id} contract field lists are incomplete`);
    assert.equal(new Set([...contract.required, ...contract.optional]).size, contract.required.length + contract.optional.length, `${id} required/optional fields overlap`);
    assert.ok(contract.input && typeof contract.input === 'object', `${id} input schema is missing`);
    for (const action of registry.actions.filter(action => action.ai.actionId === id)) {
      assert.equal(action.inputContract.status, 'READY', `${action.id} must project the typed runtime input contract`);
      assert.equal(action.inputContract.schemaId, contract.schemaId);
      assert.deepEqual(action.inputContract.requiredFields, contract.required);
      assert.deepEqual(action.inputContract.optionalFields, contract.optional);
      assert.deepEqual(action.inputContract.contextFields, contract.context);
    }
  }

  const resolvePointer = pointer => pointer.split('/').slice(1).reduce((value, token) => value?.[token.replace(/~1/g, '/').replace(/~0/g, '~')], inputContracts);
  const visit = value => {
    if (!value || typeof value !== 'object') return;
    if (typeof value.$ref === 'string') {
      assert.ok(value.$ref.startsWith('#/'), `external input-schema ref is forbidden: ${value.$ref}`);
      assert.ok(resolvePointer(value.$ref.slice(1)), `unresolved input-schema ref ${value.$ref}`);
    }
    for (const child of Object.values(value)) visit(child);
  };
  visit(inputContracts.contracts);

  const derivedSummary = registrySummary(registry, sourceAudit, runtimeActions);
  assert.deepEqual(registry.summary, derivedSummary, 'registry summary is stale');

  const expectedMarkers = new Map(sourceAudit.markers.map(record => [record.marker, [...record.sources].sort()]));
  assert.equal(expectedMarkers.size, sourceAudit.markers.length, 'source-audit markers must be unique');
  const actualMarkers = currentSourceMarkers();
  assert.deepEqual([...actualMarkers.keys()].sort(), [...expectedMarkers.keys()].sort(), 'active data-* marker set changed; inventory and parity decision must be revised');
  for (const [marker, files] of actualMarkers) {
    assert.deepEqual(files, expectedMarkers.get(marker), `${marker} active-source mapping changed; source audit is stale`);
  }

  return { registry, sourceAudit, runtimeActions, inputContracts, derivedSummary };
}

function markdownTable(rows) {
  return rows.map(row => `| ${row.join(' | ')} |`).join('\n');
}

function buildReport(validated = validateRegistry()) {
  const { registry } = validated;
  const coverage = registry.summary.aiCoverage;
  const owner = registry.summary.ownerBinding;
  const input = registry.summary.inputContracts;
  const failure = readJson(FAILURE_MATRIX_PATH).summary;
  const release = failure.releaseStatus || {};
  const categories = Object.entries(registry.summary.categories).map(([category, total]) => {
    const actions = registry.actions.filter(action => action.category === category);
    return [
      category,
      total,
      actions.filter(action => action.ai.coverage === 'PUBLIC_E2E_PASS').length,
      actions.filter(action => action.ai.coverage === 'REGISTERED_PARTIAL').length,
      actions.filter(action => action.ai.coverage === 'MISSING').length,
      actions.filter(action => ['NATIVE_CHAT', 'NOT_REQUIRED', 'NOT_APPLICABLE'].includes(action.ai.coverage)).length,
    ];
  });
  return `# M16.5 Human ↔ AI Action Parity Control Plane\n\n` +
    `Date: 2026-09-02\n\n` +
    `Status: **B0.01–B0.10 CONTROL-PLANE EXIT PUBLICLY COMPLETE ON 13.82.135 / BLOCK 1 FOUNDATION PUBLIC ON 13.82.136 + CHAT-NATIVE TRIP-SELECTION READ PUBLIC ON 13.82.138, BLOCK STILL ACTIVE / PRODUCT PARITY CONTINUES ROW BY ROW THROUGH B1–B5**\n\n` +
    `Source: \`${registry.source.workbook}\` · SHA-256 \`${registry.source.workbookSha256}\` · Integration snapshot \`${registry.source.integrationBuild}\`.\n\n` +
    `## Plain-language position\n\n` +
    `The complete reviewed inventory is now a machine-readable release control plane. It records what a person can do, which Owner must perform it, whether the AI can reach the same path and exactly which contract work remains open. It does not make missing capabilities available by declaration.\n\n` +
    `## Binding counts\n\n` +
    markdownTable([
      ['Measure', 'Count'],
      ['---', '---:'],
      ['Semantic user actions', registry.summary.semanticActions],
      ['Available/conditional product actions', registry.summary.availableOrConditional],
      ['Public E2E pass', coverage.PUBLIC_E2E_PASS || 0],
      ['Registered/partial', coverage.REGISTERED_PARTIAL || 0],
      ['Missing AI parity', coverage.MISSING || 0],
      ['Native chat controls', coverage.NATIVE_CHAT || 0],
      ['Presentation-only / not required', coverage.NOT_REQUIRED || 0],
      ['Demo / not applicable', coverage.NOT_APPLICABLE || 0],
      ['Unavailable or reserved outcomes', registry.summary.unavailableOrReservedOutcomes],
      ['Audited active data-* markers', registry.summary.auditedDataMarkers],
      ['Existing runtime action IDs', registry.summary.runtimeRegisteredActions],
    ]) + `\n\n` +
    `## Category ledger\n\n` +
    markdownTable([
      ['Category', 'Total', 'Public pass', 'Registered/partial', 'Missing', 'Native/N/A'],
      ['---', '---:', '---:', '---:', '---:', '---:'],
      ...categories,
    ]) + `\n\n` +
    `## Honest contract gaps\n\n` +
    `- Owner method audit open: **${owner.OWNER_METHOD_AUDIT_OPEN || 0}** actions.\n` +
    `- Public contract binding proven locally, AI route still open: **${owner.PUBLIC_CONTRACT_BOUND || 0}** action rows.\n` +
    `- Runtime owner binding present but public proof open: **${owner.RUNTIME_REGISTERED || 0}** action rows.\n` +
    `- Public owner path proven: **${owner.PUBLIC_E2E_PROVEN || 0}** action rows.\n` +
    `- Typed action input contract open: **${input.OPEN || 0}** actions.\n` +
    `- Typed metadata contract ready for the existing ${registry.summary.runtimeRegisteredActions} runtime actions: **${input.READY || 0}** mapped human-action rows.\n` +
    `- Bounded runtime enforcement is active for **${registry.summary.runtimeRegisteredActions}/${registry.summary.runtimeRegisteredActions}** runtime actions. Navigation, Places, Events, Booking, Journey, Trip, Memory and Identity reject missing or contradictory input before Ledger creation or Owner invocation. Navigation is restricted to registered routes; writes retain visible confirmation and receipts; Booking R3 commands retain unknown-outcome reconciliation. Raw prompts, Story text and concrete preference values are omitted from the Action Ledger where only bounded references are required.\n\n` +
    `## Generated parity and failure evidence\n\n` +
    `- Matrix rows: **${registry.summary.semanticActions}/${registry.summary.semanticActions}** semantic actions after deterministic regeneration.\n` +
    `- Required dimensions per row: **12** — contract, compiler, permission,\n` +
    `  confirmation, idempotency, receipt, recovery, Undo, multilingual, typo,\n` +
    `  multi-intent and denial.\n` +
    `- Generated explicit failure evals: **${failure.generatedFailureCases}**.\n` +
    `- Current evidence states: **${failure.publicE2eProven}** public E2E proofs, **${failure.localAiPaths}** local AI paths,\n` +
    `  **${failure.manualOwnerPaths}** truthful manual Owner paths, **${release.BLOCKED || 0}** blocked rows and **${release.NOT_APPLICABLE || 0}**\n` +
    `  non-product rows.\n` +
    `- CI drift protection hashes the six source contracts and compares the checked-in\n` +
    `  matrix byte-for-byte with a fresh deterministic generation. Changed or new\n` +
    `  actions, missing confirmation/idempotency evidence and unsupported public-pass\n` +
    `  claims fail the release suite.\n\n` +
    `## Release gate\n\n` +
    `A new or changed active \`data-*\` marker makes the registry test fail until the source audit and semantic-action decision are deliberately revised. Every state-changing row requires a separate explicit confirmation and idempotency decision. A row can become \`PUBLIC_E2E_PASS\` only when the existing runtime action, public Owner contract/method and visible Integration evidence agree.\n\n` +
    `## Immediate continuation\n\n` +
    `1. ${owner.OWNER_METHOD_AUDIT_OPEN ? `Audit the ${owner.OWNER_METHOD_AUDIT_OPEN} open Owner methods by coherent domain slice.` : 'Owner-method inventory is locally complete; bind the remaining human actions into typed AI routes and visible confirmations.'}\n` +
    `2. Keep all ${registry.summary.runtimeRegisteredActions} typed runtime actions fail-closed while public AI routes are completed domain by domain.\n` +
    `3. Keep the generated ${registry.summary.semanticActions}-row, 12-dimension failure-eval matrix green while action routes are completed domain by domain.\n` +
    `4. Keep the visible local register, consumer-chat and parity/failure gates green from their canonical files.\n` +
    `5. Preserve the publicly closed B0.10 control-plane release and continue product parity row by row through B1–B5. App \`13.82.135\` proved real Places search, exact plan Preview, confirmation, Owner receipt, separately confirmed receipt Undo and empty Timeline readback; accepted Integration App \`13.82.138\` additionally proves the Chat-native Trip-selection read, but does not convert unrelated remaining \`MISSING\` or \`REGISTERED/PARTIAL\` rows into public passes.\n\n` +
    `## B1 registry delta retained after visible/public release evidence\n\n` +
    `The universal Booking candidate replaces the restaurant-specific runtime\n` +
    `registration with canonical \`booking.place.open\`, preserves the compatibility\n` +
    `alias and adds bounded \`navigation.route.open\` plus \`booking.stay.search\` runtime actions. All 20\n` +
    `human navigation outcomes, including the new Hotels area, now map to that\n` +
    `single allow-listed Owner command; Hotel search reaches the public Booking Owner and fails closed without live provider evidence. The source runtime action set is **23**.\n` +
    `The deterministic registry and input-contract artifact are regenerated and\n` +
    `locally green; the 329-row parity/failure matrix remains a release gate for every following domain slice. The accepted \`13.82.138\` Trip-selection read is documented without inflating unrelated public-pass rows.\n`;
}

function main() {
  if (process.argv.includes('--write-owner-bindings')) materializeOwnerBindingDecisions();
  if (process.argv.includes('--write-navigation-ai')) materializeNavigationAIParity();
  const validated = validateRegistry();
  const reportIndex = process.argv.indexOf('--write-report');
  if (reportIndex >= 0) {
    const requested = process.argv[reportIndex + 1];
    const target = requested ? path.resolve(ROOT, requested) : DEFAULT_REPORT_PATH;
    fs.writeFileSync(target, buildReport(validated), 'utf8');
    console.log(`WROTE ${path.relative(ROOT, target).replace(/\\/g, '/')}`);
  }
  console.log('PASS Human ↔ AI action registry structure, provenance, owner binding and source-marker freshness');
  console.log(`Actions ${validated.registry.actions.length} · Missing AI parity ${validated.registry.summary.aiCoverage.MISSING} · Runtime actions ${validated.runtimeActions.length}`);
}

if (require.main === module) main();

module.exports = {
  OWNER_BINDING_DECISIONS,
  OWNER_BINDING_DECISIONS_BUNDLE_1,
  OWNER_BINDING_DECISIONS_BUNDLE_2,
  OWNER_BINDING_DECISIONS_BUNDLE_3,
  OWNER_BINDING_DECISIONS_BUNDLE_4,
  buildReport,
  countBy,
  currentSourceMarkers,
  loadIdentityOwnerContract,
  loadAuthOwnerContract,
  loadCollaborationOwnerContract,
  loadBookingOwnerContract,
  loadIntelligenceOwnerContract,
  loadJourneyOwnerContract,
  loadMediaOwnerContract,
  loadMemoryOwnerContract,
  loadPlatformActionOwnerContract,
  loadPlacesOwnerContract,
  loadTripOwnerContract,
  materializeOwnerBindingDecisions,
  materializeNavigationAIParity,
  methodAt,
  validateRegistry,
};
