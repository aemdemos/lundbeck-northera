// Shared state for the specialist-search block. Both specialist-search.js
// and form.js need to read/write `config` and `resultSection`;

let config = {};
let resultSection;

export function getConfig() {
  return config;
}

export function setConfig(value) {
  config = value;
}

export function getResultSection() {
  return resultSection;
}

export function setResultSection(value) {
  resultSection = value;
}
