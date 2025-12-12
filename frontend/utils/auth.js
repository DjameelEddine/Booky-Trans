// Authentication Utility Functions

/**
 * Save authentication token to localStorage
 * @param {string} token - JWT access token
 * @param {string} tokenType - Token type (usually "bearer")
 */
function saveToken(token, tokenType = 'bearer') {
    localStorage.setItem('access_token', token);
    localStorage.setItem('token_type', tokenType);
}

/**
 * Get authentication token from localStorage
 * @returns {string|null} JWT access token or null if not found
 */
function getToken() {
    return localStorage.getItem('access_token');
}

/**
 * Get token type from localStorage
 * @returns {string|null} Token type or null if not found
 */
function getTokenType() {
    return localStorage.getItem('token_type');
}

/**
 * Remove authentication token from localStorage
 */
function removeToken() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user_data');
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists, false otherwise
 */
function isAuthenticated() {
    return getToken() !== null;
}

/**
 * Get authorization header for API requests
 * @returns {Object} Authorization header object
 */
function getAuthHeader() {
    const token = getToken();
    const tokenType = getTokenType() || 'bearer';
    
    if (!token) {
        return {};
    }
    
    return {
        'Authorization': `${tokenType.charAt(0).toUpperCase() + tokenType.slice(1)} ${token}`
    };
}

/**
 * Fetch current user information from the backend
 * @returns {Promise<Object>} User data object
 */
async function getUserInfo() {
    const token = getToken();
    
    if (!token) {
        throw new Error('No authentication token found');
    }
    
    try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_ME), {
            method: 'GET',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                handleTokenExpiration();
                throw new Error('Session expired. Please login again.');
            }
            throw new Error('Failed to fetch user information');
        }
        
        const userData = await response.json();
        // Store user data in localStorage for quick access
        localStorage.setItem('user_data', JSON.stringify(userData));
        return userData;
        
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
}

/**
 * Handle token expiration (401 responses)
 * Clears auth data and redirects to login
 */
function handleTokenExpiration() {
    removeToken();
    
    // Show notification if toast is available
    if (typeof showWarning === 'function') {
        showWarning('Your session has expired. Please login again.');
    }
    
    // Redirect to login after a short delay
    setTimeout(() => {
        window.location.href = '/frontend/Authentication/Login/login.html';
    }, 1500);
}

/**
 * Make an authenticated API request with automatic token expiration handling
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function authenticatedFetch(url, options = {}) {
    // Add auth header
    options.headers = {
        ...options.headers,
        ...getAuthHeader(),
        'Content-Type': 'application/json'
    };
    
    try {
        const response = await fetch(url, options);
        
        // Handle 401 - Token expired
        if (response.status === 401) {
            handleTokenExpiration();
            throw new Error('Session expired');
        }
        
        return response;
    } catch (error) {
        console.error('Authenticated fetch error:', error);
        throw error;
    }
}

/**
 * Get stored user data from localStorage
 * @returns {Object|null} User data object or null
 */
function getStoredUserData() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
}

/**
 * Logout user by clearing all authentication data
 */
function logout() {
    removeToken();
    window.location.href = '/frontend/Authentication/Login/login.html';
}

/**
 * Check authentication and redirect to login if not authenticated
 * Call this function on protected pages
 */
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/frontend/Authentication/Login/login.html';
        return false;
    }
    return true;
}
