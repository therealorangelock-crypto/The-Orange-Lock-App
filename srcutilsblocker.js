import blockedDomains from './blockedDomains.json';

/**
 * Checks if a URL belongs to a blocked domain.
 */
export function isBlocked(url) {
  if (!url) return false;
  return blockedDomains.some(domain => url.includes(domain));
}

/**
 * Optional: prevents navigation to blocked domains.
 * Use this inside link click handlers or navigation code.
 */
export function preventBlockedNavigation(event) {
  const target = event.target.closest('a');
  if (!target) return;

  const href = target.href;
  if (isBlocked(href)) {
    event.preventDefault();
    alert("🚫 This site is blocked to protect your recovery. Stay strong!");
  }
}