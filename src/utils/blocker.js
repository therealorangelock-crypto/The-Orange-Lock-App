import blockedDomains from './blockedDomains.json';

// blocking is active as soon as the app starts
export const isBlockingActive = true;

export function isBlocked(url) {
  if (!url) return false;
  return blockedDomains.some(domain => url.includes(domain));
}

export function preventBlockedNavigation(event) {
  const target = event.target.closest('a');
  if (!target) return;

  const href = target.href;
  if (isBlocked(href)) {
    event.preventDefault();
    alert("🚫 This site is blocked to protect your recovery. Stay strong!");
  }
}