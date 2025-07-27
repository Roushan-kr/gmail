import express from 'express';
import { saveSentEmail, getEmails, moveToBin, starredEmail, deleteEmail } from '../controller/email-controller.js';

const routes = express.Router();

routes.post('/save', saveSentEmail);
routes.get('/emails/:type', getEmails);
routes.post('/save-draft', saveSentEmail);
routes.post('/bin', moveToBin);
routes.post('/starred', starredEmail);
routes.delete('/delete', deleteEmail);

routes.post('/save-draft', saveSentEmail);
routes.post('/bin', moveToBin);
routes.post('/starred', starredEmail);
routes.delete('/delete', deleteEmail);


export default routes;
