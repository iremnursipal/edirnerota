// src/utils/index.js

export const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
};

export const handleError = (error) => {
    console.error(error);
    return {
        status: 'error',
        message: error.message || 'An unexpected error occurred',
    };
};

// Add more utility functions as needed.