/**
 * Extrai o domínio base da URL (ex: "youtube.com" de "https://www.youtube.com/watch?v=...")
 * @param {string} url 
 * @returns {string|null}
 */
export function getDomain(url) {
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace(/^www\./, '');
    } catch (error) {
        return null;
    }
}

/**
 * Formata segundos em string legível (HH:MM:SS ou MM:SS)
 * @param {number} seconds 
 * @returns {string}
 */
export function formatTime(seconds) {
    if (!seconds) return "00m 00s";

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
        return `${h}h ${m}m`;
    }
    return `${m}m ${s}s`;
}

/**
 * Retorna o timestamp da próxima meia-noite
 * @returns {number}
 */
export function getNextMidnight() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
}
