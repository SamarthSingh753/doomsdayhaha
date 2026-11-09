// Unit test for Watch Party and Shared Playlist logic
const fs = require('fs');

console.log('Testing Watch Party implementation...');

// Read files
const indexHtml = fs.readFileSync('index.html', 'utf-8');
const styleCss = fs.readFileSync('css/style.css', 'utf-8');
const appJs = fs.readFileSync('js/app.js', 'utf-8');

// 1. Verify HTML elements
const requiredHtmlIds = [
  'openPartyBtn',
  'partyMemberCounter',
  'partyLiveBar',
  'partyRoomChip',
  'partyRoomCodeDisplay',
  'partyMembersStack',
  'partyActivityTicker',
  'tickerText',
  'partyShareLinkBtn',
  'partyManageBtn',
  'partyLeaveBtn',
  'partyModal',
  'partyModalTitle',
  'closePartyBtn',
  'partyAvatarPicker',
  'partyUserNameInput',
  'partyDisconnectedView',
  'partyConnectedView',
  'tabHostBtn',
  'tabJoinBtn',
  'hostTabContent',
  'joinTabContent',
  'btnCreateParty',
  'btnJoinParty',
  'partyRoomCodeInput',
  'partyRoleText',
  'partyModalRoomCode',
  'partyInviteUrlInput',
  'btnCopyInviteLink',
  'partyQrCanvas',
  'partyMembersCount',
  'partyMembersList',
  'partyHistoryLog',
  'btnClosePartyModal',
  'btnModalLeaveParty'
];

let missingHtml = [];
for (const id of requiredHtmlIds) {
  if (!indexHtml.includes(`id="${id}"`)) {
    missingHtml.push(id);
  }
}

if (missingHtml.length > 0) {
  console.error('Missing HTML IDs:', missingHtml);
  process.exit(1);
} else {
  console.log('✓ All 35 Watch Party HTML elements verified in index.html');
}

// 2. Verify CDN scripts
if (!indexHtml.includes('peerjs') || !indexHtml.includes('qrious')) {
  console.error('Missing PeerJS or QRious in index.html');
  process.exit(1);
} else {
  console.log('✓ PeerJS and QRious script tags verified in index.html');
}

// 3. Verify CSS rules
const requiredCssClasses = [
  '.btn-party-trigger',
  '.party-pulse-beacon',
  '.party-live-bar',
  '.party-room-chip',
  '.party-members-stack',
  '.member-avatar-chip',
  '.party-activity-ticker',
  '.btn-party-bar-action',
  '.btn-party-bar-leave',
  '.party-modal-card',
  '.party-avatar-picker',
  '.party-avatar-btn',
  '.party-share-container',
  '.party-qr-canvas',
  '.party-member-card'
];

let missingCss = [];
for (const cls of requiredCssClasses) {
  if (!styleCss.includes(cls)) {
    missingCss.push(cls);
  }
}

if (missingCss.length > 0) {
  console.error('Missing CSS classes:', missingCss);
  process.exit(1);
} else {
  console.log('✓ All 15 Watch Party CSS style rules verified in css/style.css');
}

// 4. Verify JS functions and hooks
const requiredJsSymbols = [
  'partyController',
  'initPartyProfile',
  'createPartyRoom',
  'joinPartyRoom',
  'leavePartyRoom',
  'setupPeerConnection',
  'broadcastPartyEvent',
  'handlePartyMessage',
  'updatePartyLiveUI',
  'renderPartyMembersUI',
  'updatePartyTicker',
  'addPartyLog',
  'renderPartyQr',
  'copyPartyInviteLink',
  'copyPartyRoomCode'
];

let missingJs = [];
for (const sym of requiredJsSymbols) {
  if (!appJs.includes(sym)) {
    missingJs.push(sym);
  }
}

if (missingJs.length > 0) {
  console.error('Missing JS symbols:', missingJs);
  process.exit(1);
} else {
  console.log('✓ All 15 Watch Party controller functions verified in js/app.js');
}

console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
