/**
 * YouTube Data API v3 Adapter
 * Handles video discovery, metadata extraction, and comedian channel management
 */

import https from 'https';

const YOUTUBE_API_KEY = 'AIzaSyCLPVTkg05Rr_ScFtg-k4CGvHcFmmbBwYg';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Make a YouTube API request
 * @param {string} endpoint - API endpoint (e.g., 'search', 'videos', 'channels')
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - API response
 */
async function youtubeApiRequest(endpoint, params) {
    const queryParams = new URLSearchParams({
        ...params,
        key: YOUTUBE_API_KEY
    });

    const url = `${YOUTUBE_API_BASE}/${endpoint}?${queryParams}`;

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) {
                        reject(new Error(`YouTube API Error: ${parsed.error.message}`));
                    } else {
                        resolve(parsed);
                    }
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Search for a comedian's channel
 * @param {string} comedianName - Name of the comedian
 * @param {Object} options - Additional search options
 * @returns {Promise<Object>} - Channel information
 */
export async function searchComedianChannel(comedianName, options = {}) {
    console.log(`[YouTube] Searching for channel: ${comedianName}`);

    try {
        const response = await youtubeApiRequest('search', {
            part: 'snippet',
            q: `${comedianName} standup comedy`,
            type: 'channel',
            maxResults: options.maxResults || 5,
            relevanceLanguage: options.language || 'en'
        });

        if (!response.items || response.items.length === 0) {
            return { found: false, channels: [] };
        }

        const channels = response.items.map(item => ({
            channelId: item.id.channelId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.default?.url
        }));

        return { found: true, channels };
    } catch (error) {
        console.error(`[YouTube] Channel search failed:`, error.message);
        return { found: false, error: error.message };
    }
}

/**
 * Get detailed channel information
 * @param {string} channelId - YouTube channel ID
 * @returns {Promise<Object>} - Detailed channel info
 */
export async function getChannelDetails(channelId) {
    console.log(`[YouTube] Fetching channel details: ${channelId}`);

    try {
        const response = await youtubeApiRequest('channels', {
            part: 'snippet,statistics,brandingSettings',
            id: channelId
        });

        if (!response.items || response.items.length === 0) {
            return { found: false };
        }

        const channel = response.items[0];
        return {
            found: true,
            channelId: channel.id,
            title: channel.snippet.title,
            description: channel.snippet.description,
            customUrl: channel.snippet.customUrl,
            thumbnail: channel.snippet.thumbnails?.high?.url,
            subscriberCount: channel.statistics.subscriberCount,
            videoCount: channel.statistics.videoCount,
            viewCount: channel.statistics.viewCount,
            keywords: channel.brandingSettings?.channel?.keywords,
            country: channel.snippet.country
        };
    } catch (error) {
        console.error(`[YouTube] Channel details failed:`, error.message);
        return { found: false, error: error.message };
    }
}

/**
 * Search for videos by a comedian
 * @param {string} comedianName - Name of the comedian
 * @param {Object} options - Search options
 * @returns {Promise<Object>} - Video search results
 */
export async function searchComedianVideos(comedianName, options = {}) {
    console.log(`[YouTube] Searching videos for: ${comedianName}`);

    try {
        const searchQuery = options.channelId
            ? comedianName
            : `${comedianName} standup comedy`;

        const params = {
            part: 'snippet',
            q: searchQuery,
            type: 'video',
            maxResults: options.maxResults || 10,
            order: options.order || 'relevance',
            videoDuration: options.duration || 'any',
            videoDefinition: 'any'
        };

        // If we have a channel ID, search within that channel
        if (options.channelId) {
            params.channelId = options.channelId;
        }

        const response = await youtubeApiRequest('search', params);

        if (!response.items || response.items.length === 0) {
            return { found: false, videos: [] };
        }

        // Get video IDs to fetch detailed info
        const videoIds = response.items.map(item => item.id.videoId).join(',');
        const videoDetails = await getVideoDetails(videoIds);

        return {
            found: true,
            count: response.items.length,
            videos: videoDetails.videos || []
        };
    } catch (error) {
        console.error(`[YouTube] Video search failed:`, error.message);
        return { found: false, error: error.message };
    }
}

/**
 * Get detailed video information
 * @param {string} videoIds - Comma-separated video IDs
 * @returns {Promise<Object>} - Detailed video info
 */
export async function getVideoDetails(videoIds) {
    console.log(`[YouTube] Fetching video details for ${videoIds.split(',').length} videos`);

    try {
        const response = await youtubeApiRequest('videos', {
            part: 'snippet,contentDetails,statistics',
            id: videoIds
        });

        if (!response.items || response.items.length === 0) {
            return { found: false, videos: [] };
        }

        const videos = response.items.map(video => ({
            videoId: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            channelId: video.snippet.channelId,
            channelTitle: video.snippet.channelTitle,
            publishedAt: video.snippet.publishedAt,
            thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
            duration: video.contentDetails.duration,
            viewCount: video.statistics?.viewCount,
            likeCount: video.statistics?.likeCount,
            commentCount: video.statistics?.commentCount,
            embedUrl: `https://www.youtube.com/embed/${video.id}`,
            contentUrl: `https://www.youtube.com/watch?v=${video.id}`
        }));

        return { found: true, videos };
    } catch (error) {
        console.error(`[YouTube] Video details failed:`, error.message);
        return { found: false, error: error.message };
    }
}

/**
 * Parse video title to extract comedian name and bit title
 * Common patterns:
 * - "Comedian Name - Bit Title"
 * - "Comedian Name: Special Name"
 * - "Bit Title | Comedian Name"
 * @param {string} title - Video title
 * @param {string} expectedName - Expected comedian name
 * @returns {Object} - Parsed title info
 */
export function parseVideoTitle(title, expectedName) {
    // Common separators
    const separators = [' - ', ': ', ' | ', ' – '];

    for (const sep of separators) {
        if (title.includes(sep)) {
            const parts = title.split(sep);

            // Check if comedian name is in first or second part
            const firstPartMatch = parts[0].toLowerCase().includes(expectedName.toLowerCase());
            const secondPartMatch = parts[1]?.toLowerCase().includes(expectedName.toLowerCase());

            if (firstPartMatch) {
                return {
                    comedianName: parts[0].trim(),
                    bitTitle: parts.slice(1).join(sep).trim()
                };
            } else if (secondPartMatch) {
                return {
                    bitTitle: parts[0].trim(),
                    comedianName: parts[1].trim()
                };
            }
        }
    }

    // If no separator found, return the whole title as bit title
    return {
        comedianName: expectedName,
        bitTitle: title
    };
}

/**
 * Get videos from known comedy aggregator channels
 * @param {string} comedianName - Comedian to search for
 * @returns {Promise<Object>} - Videos from aggregators
 */
export async function searchAggregatorVideos(comedianName) {
    console.log(`[YouTube] Searching aggregators for: ${comedianName}`);

    // Known comedy aggregator channel IDs
    const aggregators = [
        { name: 'Comedy Central India', channelId: 'UC8qFZGJhx0KubLl5VCEd0Kg' },
        { name: 'Netflix Is A Joke', channelId: 'UCux9Bfs9Cwt3vILLMoOUdNw' },
        { name: 'Amazon Prime Video India', channelId: 'UCXRz8fT3t8-giBjQxpVpEyA' },
        { name: 'OML Entertainment', channelId: 'UCN6pPIIhcTMOzNj9nQt0RbA' },
        { name: 'Canvas Laugh Club', channelId: 'UC44lVQZBEGaw3hxuJDW8yEg' }
    ];

    const allVideos = [];

    for (const aggregator of aggregators) {
        try {
            const result = await searchComedianVideos(comedianName, {
                channelId: aggregator.channelId,
                maxResults: 5
            });

            if (result.found && result.videos) {
                result.videos.forEach(video => {
                    video.aggregatorChannel = aggregator.name;
                    allVideos.push(video);
                });
            }

            // Small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error(`Failed to search ${aggregator.name}:`, error.message);
        }
    }

    return {
        found: allVideos.length > 0,
        count: allVideos.length,
        videos: allVideos
    };
}

/**
 * Discover comprehensive video collection for a comedian
 * Combines personal channel + aggregator searches
 * @param {string} comedianName - Comedian name
 * @param {Object} options - Discovery options
 * @returns {Promise<Object>} - Complete video collection
 */
export async function discoverAllVideos(comedianName, options = {}) {
    console.log(`[YouTube] Discovering all videos for: ${comedianName}`);

    const results = {
        personalChannel: null,
        personalVideos: [],
        aggregatorVideos: [],
        allVideos: []
    };

    try {
        // 1. Find personal channel
        const channelSearch = await searchComedianChannel(comedianName, options);

        if (channelSearch.found && channelSearch.channels.length > 0) {
            const primaryChannel = channelSearch.channels[0];
            results.personalChannel = primaryChannel;

            // Get videos from personal channel
            const channelVideos = await searchComedianVideos(comedianName, {
                channelId: primaryChannel.channelId,
                maxResults: options.maxPersonalVideos || 20
            });

            if (channelVideos.found) {
                results.personalVideos = channelVideos.videos;
            }
        }

        // 2. Search aggregator channels
        const aggregatorResults = await searchAggregatorVideos(comedianName);
        if (aggregatorResults.found) {
            results.aggregatorVideos = aggregatorResults.videos;
        }

        // 3. Combine and deduplicate
        const videoMap = new Map();

        [...results.personalVideos, ...results.aggregatorVideos].forEach(video => {
            if (!videoMap.has(video.videoId)) {
                videoMap.set(video.videoId, video);
            }
        });

        results.allVideos = Array.from(videoMap.values());

        return {
            success: true,
            comedianName,
            channelFound: !!results.personalChannel,
            totalVideos: results.allVideos.length,
            ...results
        };

    } catch (error) {
        console.error(`[YouTube] Discovery failed:`, error.message);
        return {
            success: false,
            error: error.message,
            ...results
        };
    }
}

export default {
    searchComedianChannel,
    getChannelDetails,
    searchComedianVideos,
    getVideoDetails,
    parseVideoTitle,
    searchAggregatorVideos,
    discoverAllVideos
};
