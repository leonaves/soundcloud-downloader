const fs = require('fs');

const fetch = require('node-fetch');
const nodeId3 = require('node-id3');

module.exports = async ({ track, clientId, playlistName, trackNumber, artworkUrl }) => {
  console.log('Downloading', track.title, '...');

  const trackStreamUrl = track.media.transcodings[0].url + '?client_id=' + clientId;

  const trackStreamResponse = await fetch(trackStreamUrl);

  const trackPlaylistUrl = (await trackStreamResponse.json()).url;

  const trackPlaylistResponse = await fetch(trackPlaylistUrl);

  const trackPlaylist = await trackPlaylistResponse.text();

  const regex = /https:\/\/[^\s]+/g;

  const chunkUrls = trackPlaylist.match(regex);

  const chunkFetches = chunkUrls.map(async (chunkUrl) => {
    const chunkResponse = await fetch(chunkUrl);

    return chunkResponse.buffer();
  });

  const chunks = await Promise.all(chunkFetches);

  const mp3Data = Buffer.concat(chunks);

  const artworkResponse = await fetch(artworkUrl);

  const artworkData = await artworkResponse.buffer();

  fs.writeFileSync(`./downloads/artwork/${track.id}.jpg`, artworkData);

  //  Define the tags for your file using the ID (e.g. APIC) or the alias (see at bottom)
  const tags = {
    title: track.title,
    artist: track.user.username,
    album: playlistName,
    APIC: `./downloads/artwork/${track.id}.jpg`,
    TRCK: trackNumber,
  };

  const taggedMp3Data = nodeId3.write(tags, mp3Data);

  fs.writeFileSync(`./downloads/tracks/${track.title}.mp3`, taggedMp3Data);
};
