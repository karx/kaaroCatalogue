/**
 * FavoritesManager
 * Handles persistence of user favorites using localStorage.
 */
export class FavoritesManager {
    constructor() {
        this.STORAGE_KEY = 'kaaro_favorites';
        this.favorites = this._load();
    }

    _load() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load favorites:', e);
            return [];
        }
    }

    _save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.favorites));
        } catch (e) {
            console.error('Failed to save favorites:', e);
        }
    }

    /**
     * Add an item to favorites
     * @param {Object} item - The item to add (must have workId/videoId, name, type)
     */
    add(item) {
        if (!this.isFavorite(item.id)) {
            this.favorites.push({
                id: item.id,
                name: item.name,
                type: item.type, // 'poem' or 'video'
                author: item.author, // Author/Actor name
                timestamp: Date.now()
            });
            this._save();
            return true;
        }
        return false;
    }

    /**
     * Remove an item from favorites
     * @param {string} id - The ID of the item to remove
     */
    remove(id) {
        const initialLength = this.favorites.length;
        this.favorites = this.favorites.filter(item => item.id !== id);
        if (this.favorites.length !== initialLength) {
            this._save();
            return true;
        }
        return false;
    }

    /**
     * Check if an item is favorited
     * @param {string} id 
     */
    isFavorite(id) {
        return this.favorites.some(item => item.id === id);
    }

    /**
     * Toggle favorite status
     * @param {Object} item 
     */
    toggle(item) {
        if (this.isFavorite(item.id)) {
            this.remove(item.id);
            return false; // Removed
        } else {
            this.add(item);
            return true; // Added
        }
    }

    /**
     * Get all favorites
     */
    getAll() {
        return this.favorites.sort((a, b) => b.timestamp - a.timestamp);
    }
}

export const favoritesManager = new FavoritesManager();
