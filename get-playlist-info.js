const fetch = require('node-fetch');

module.exports = async ({ html, clientId }) => {
  const artworkRegex = /https:\/\/i1\.sndcdn\.com\/artworks[^\.]+\.jpg/g;
  const artworkMatches = html.match(artworkRegex);
  const artworkUrl = artworkMatches[0];

  const playlistRegex = /https:\/\/api\.soundcloud\.com\/playlists\/\d+/g;
  const playlistMatches = html.match(playlistRegex);
  const playlistUrl = playlistMatches[0];

  const playlistResponse = await fetch(`${playlistUrl}?client_id=${clientId}`);
  const playlist = await playlistResponse.json();

  const tracks = playlist.tracks.map(({ id, title, user }, index) => ({
    id,
    title,
    artworkUrl,
    artist: user.username,
    trackNumber: index,
  }));

  const { title, user } = playlist;

  return {
    title,
    artworkUrl,
    artist: user.username,
    tracks,
  }
};
