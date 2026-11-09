// Mock multi-tab simulation test for Watch Party Real-Time Sync
console.log('Testing Watch Party real-time synchronization simulation...');

class MockBroadcastChannel {
  static channels = {};

  constructor(name) {
    this.name = name;
    if (!MockBroadcastChannel.channels[name]) {
      MockBroadcastChannel.channels[name] = [];
    }
    MockBroadcastChannel.channels[name].push(this);
    this.onmessage = null;
  }

  postMessage(data) {
    const listeners = MockBroadcastChannel.channels[this.name] || [];
    listeners.forEach((listener) => {
      if (listener !== this && typeof listener.onmessage === 'function') {
        listener.onmessage({ data: JSON.parse(JSON.stringify(data)) });
      }
    });
  }

  close() {
    if (MockBroadcastChannel.channels[this.name]) {
      MockBroadcastChannel.channels[this.name] = MockBroadcastChannel.channels[this.name].filter(
        (c) => c !== this
      );
    }
  }
}

// Host Instance
const hostState = {
  watched: new Set([1, 2, 3]),
  watchedEpisodes: new Set(['70_1', '70_2']),
  optional: new Set([4]),
  partyProfile: { id: 'host_001', name: 'Doctor Doom', avatar: '🦾' }
};

const hostParty = {
  active: true,
  isHost: true,
  roomId: 'DOOM-8888',
  members: [{ ...hostState.partyProfile, isHost: true }],
  channel: new MockBroadcastChannel('marvel_doomsday_party')
};

// Guest Instance
const guestState = {
  watched: new Set(),
  watchedEpisodes: new Set(),
  optional: new Set(),
  partyProfile: { id: 'guest_002', name: 'Spider-Man', avatar: '🕷️' }
};

const guestParty = {
  active: true,
  isHost: false,
  roomId: 'DOOM-8888',
  members: [{ ...guestState.partyProfile, isHost: false }],
  channel: new MockBroadcastChannel('marvel_doomsday_party')
};

// Wire message handlers
hostParty.channel.onmessage = (e) => {
  const data = e.data;
  if (data.roomId !== hostParty.roomId) return;
  if (data.type === 'GUEST_JOIN') {
    hostParty.members.push(data.user);
    // Send FULL_SYNC
    hostParty.channel.postMessage({
      type: 'FULL_SYNC',
      roomId: hostParty.roomId,
      watched: Array.from(hostState.watched),
      watchedEpisodes: Array.from(hostState.watchedEpisodes),
      optional: Array.from(hostState.optional),
      members: hostParty.members,
      hostUser: hostState.partyProfile
    });
  } else if (data.type === 'EPISODE_TOGGLE') {
    const key = `${data.seriesId}_${data.epNum}`;
    if (data.checked) hostState.watchedEpisodes.add(key);
    else hostState.watchedEpisodes.delete(key);
  }
};

guestParty.channel.onmessage = (e) => {
  const data = e.data;
  if (data.roomId !== guestParty.roomId) return;
  if (data.type === 'FULL_SYNC') {
    guestState.watched = new Set(data.watched);
    guestState.watchedEpisodes = new Set(data.watchedEpisodes);
    guestState.optional = new Set(data.optional);
    guestParty.members = data.members;
  } else if (data.type === 'ITEM_TOGGLE') {
    if (data.checked) guestState.watched.add(data.id);
    else guestState.watched.delete(data.id);
  }
};

// 1. Guest joins
guestParty.channel.postMessage({
  type: 'GUEST_JOIN',
  roomId: guestParty.roomId,
  user: guestState.partyProfile
});

// Verify initial full sync
if (guestState.watched.size !== 3 || !guestState.watched.has(1) || !guestState.watchedEpisodes.has('70_1')) {
  console.error('Failed initial full sync from host to guest:', guestState);
  process.exit(1);
}
console.log('✓ Step 1: Guest joined and successfully received FULL_SYNC from Host (watched size:', guestState.watched.size, ')');

// 2. Guest checks an episode
guestParty.channel.postMessage({
  type: 'EPISODE_TOGGLE',
  roomId: guestParty.roomId,
  seriesId: 70,
  epNum: 3,
  checked: true,
  user: guestState.partyProfile
});

if (!hostState.watchedEpisodes.has('70_3')) {
  console.error('Host failed to reflect guest episode toggle:', hostState.watchedEpisodes);
  process.exit(1);
}
console.log('✓ Step 2: Guest checked episode 70_3 -> Host live updated with 70_3!');

// 3. Host checks a movie
hostParty.channel.postMessage({
  type: 'ITEM_TOGGLE',
  roomId: hostParty.roomId,
  id: 10,
  checked: true,
  user: hostState.partyProfile
});

if (!guestState.watched.has(10)) {
  console.error('Guest failed to reflect host movie toggle:', guestState.watched);
  process.exit(1);
}
console.log('✓ Step 3: Host checked title #10 -> Guest live updated with title #10!');

console.log('ALL REAL-TIME BI-DIRECTIONAL SYNC TESTS PASSED PERFECTLY!');
