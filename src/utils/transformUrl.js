// src/utils/transformUrl.js
const transformURL = (url) => {
    const match = url.match(/\/d\/(.*?)\//) || url.match(/id=([^&]+)/);
    if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}?authuser=1=w1000-h1000`;
    }
    return url;
};

export default transformURL;