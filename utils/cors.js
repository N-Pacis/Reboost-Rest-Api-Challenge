export function corsFunction(req, res, next){
    const allowedOrigins = [''];//add the frontend server URL
    const origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin) >= 0) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
}