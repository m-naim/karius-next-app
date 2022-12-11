import http from './http';
import config from './config.js';

const host = config.API_URL;
const qwantHost= config.QWANTAPI_URL;

function update(id){
    return http.get(`${qwantHost}/api/v1/update/stocks/${id}/`);
}

function getAll(id){
    return http.get(`${host}/api/v1/stocks/`);
}

const stockService={
    update,
    getAll
}


export default stockService;