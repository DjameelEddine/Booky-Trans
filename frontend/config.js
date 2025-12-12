// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:8000',
    ENDPOINTS: {
        // Auth endpoints
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        GET_ME: '/auth/me',
        FORGOT_PASSWORD: '/auth/forgot-password',
        VERIFY_CODE: '/auth/verify-reset-code',
        RESET_PASSWORD: '/auth/reset-password',
        
        // Book endpoints
        BOOKS: '/books',
        
        // Profile endpoints
        PROFILE: '/profile'
    }
};

// Helper function to get full API URL
function getApiUrl(endpoint) {
    return API_CONFIG.BASE_URL + endpoint;
}
