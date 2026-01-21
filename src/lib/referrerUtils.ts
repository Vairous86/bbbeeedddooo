/**
 * Utility function to detect traffic source from referrer URL
 * Returns: 'facebook', 'tiktok', 'google', 'direct', or 'other'
 */
export const detectReferrerSource = (): string => {
    try {
        // Check URL parameters first (for tracking links)
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get('utm_source');
        const fbclid = urlParams.get('fbclid'); // Facebook Click ID
        const ttclid = urlParams.get('ttclid'); // TikTok Click ID
        const gclid = urlParams.get('gclid'); // Google Click ID

        // Check for URL parameters
        if (fbclid || utmSource?.toLowerCase().includes('facebook') || utmSource?.toLowerCase().includes('fb')) {
            return 'facebook';
        }
        if (ttclid || utmSource?.toLowerCase().includes('tiktok')) {
            return 'tiktok';
        }
        if (gclid || utmSource?.toLowerCase().includes('google')) {
            return 'google';
        }
        if (utmSource?.toLowerCase().includes('instagram') || utmSource?.toLowerCase().includes('ig')) {
            return 'instagram';
        }
        if (utmSource?.toLowerCase().includes('twitter') || utmSource?.toLowerCase().includes('x.com')) {
            return 'twitter';
        }
        if (utmSource?.toLowerCase().includes('snapchat')) {
            return 'snapchat';
        }
        if (utmSource) {
            return utmSource.toLowerCase();
        }

        // Check document.referrer
        const referrer = document.referrer.toLowerCase();

        if (!referrer) {
            return 'direct';
        }

        if (referrer.includes('facebook.com') || referrer.includes('fb.com') || referrer.includes('m.facebook.com')) {
            return 'facebook';
        }
        if (referrer.includes('tiktok.com')) {
            return 'tiktok';
        }
        if (referrer.includes('google.com') || referrer.includes('google.')) {
            return 'google';
        }
        if (referrer.includes('instagram.com')) {
            return 'instagram';
        }
        if (referrer.includes('twitter.com') || referrer.includes('x.com')) {
            return 'twitter';
        }
        if (referrer.includes('snapchat.com')) {
            return 'snapchat';
        }
        if (referrer.includes('youtube.com') || referrer.includes('youtu.be')) {
            return 'youtube';
        }
        if (referrer.includes('linkedin.com')) {
            return 'linkedin';
        }
        if (referrer.includes('whatsapp.com') || referrer.includes('wa.me')) {
            return 'whatsapp';
        }
        if (referrer.includes('t.me') || referrer.includes('telegram')) {
            return 'telegram';
        }

        // If referrer exists but doesn't match known sources
        return 'other';
    } catch {
        return 'direct';
    }
};
