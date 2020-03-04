const fetch = require('node-fetch');

const getClientId = require('./get-client-id');
const getPlaylistInfo = require('./get-playlist-info');
const downloadTrack = require('./download-track');

const run = async () => {
  const initialResponse = await fetch(process.argv[2]);

  const html = await initialResponse.text();

  const clientId = await getClientId(html);

  const playlistInfo = await getPlaylistInfo({ html, clientId });

  const trackIds = playlistInfo.tracks.map(({ id }) => id);

  const tracksParam = trackIds.join('%2C');

  const idToNumberMap = playlistInfo.tracks.reduce((acc, track, index) => {
    acc[track.id] = index + 1;
    return acc;
  }, {});

  const url = `https://api-v2.soundcloud.com/tracks?ids=${tracksParam}&client_id=${clientId}`;

  const trackInfoResponse = await fetch(url);

  const trackInfo = await trackInfoResponse.json();

  trackInfo.forEach((track) => {
    downloadTrack({
      clientId,
      track,
      playlistName: playlistInfo.title,
      artworkUrl: playlistInfo.artworkUrl,
      trackNumber: idToNumberMap[track.id],
    });
  })
};

run();
