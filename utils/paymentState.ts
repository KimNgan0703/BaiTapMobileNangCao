/**
 * Shared flag to coordinate navigation between the deep-link handler (_layout)
 * and the WebBrowser callback (checkout).
 *
 * When MoMo/VNPAY redirects back to the app via deep link, _layout sets this
 * flag so checkout knows NOT to navigate again after WebBrowser resolves.
 */
let _deepLinkFired = false;

export const paymentState = {
  get deepLinkFired() {
    return _deepLinkFired;
  },
  setDeepLinkFired(val: boolean) {
    _deepLinkFired = val;
  },
};
