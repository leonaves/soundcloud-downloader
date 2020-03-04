const fetch = require('node-fetch');

module.exports = async (html) => {
  const scriptRegex = /https:\/\/a-v2\.sndcdn\.com\/assets\/[0-9a-f-]+\.js/g;

  const scriptMatches = html.match(scriptRegex);

  return scriptMatches.reduce(async (clientIdMatch, script) => {
    if (await clientIdMatch) return clientIdMatch;

    const scriptResponse = await fetch(script);

    const javascript = await scriptResponse.text();

    const clientIdRegex = /client_id:\s?"(?<clientId>[0-9a-zA-Z]+)"/;

    const clientIdMatches = javascript.match(clientIdRegex);

    if (clientIdMatches) {
      return clientIdMatches.groups.clientId;
    }

    return null;
  }, null);
};
