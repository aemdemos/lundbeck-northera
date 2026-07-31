import { loadScript } from './aem.js';

/**
 * Loads the Brightcove player script for the given account and player.
 * The script is only injected once per account/player combination.
 * @param {string} accountId The Brightcove account id
 * @param {string} playerId The Brightcove player id
 * @returns {Promise} Resolves when the player script has loaded
 */
export default function getBrightcoveScriptTag(accountId, playerId) {
  const src = `https://players.brightcove.net/${accountId}/${playerId}_default/index.min.js`;
  return loadScript(src, { async: '' });
}
