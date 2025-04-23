const Url = (endpoint) => {
    const domain = 'http://localhost:8086/admin';
    return domain + '/' + endpoint;
};

export default Url;