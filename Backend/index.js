import express from 'express';
import env from 'dotenv';
import cors from 'cors';

env.config();

import { verifToken } from './Middleware/auth.js';

import DB_init from './entities/DB_init.js';
import createDBRouter from './routes/createDBRouter.js';
import usersRouter from './routes/usersRouter.js';
import tasksRouter from './routes/tasksRouter.js';
import nomStatusRouter from './routes/Nom_StatusRouter.js';
import nomPriorityRouter from './routes/Nom_PriorityRouter.js';
import nomTagsRouter from './routes/Nom_TagsRouter.js';
import nomTT from './routes/Task_TagsRouter.js';
import userStats from './routes/Usr_StatsRouter.js';
import auditRouter from './routes/auditRouter.js';
import projectsRouter from './routes/projectsRouter.js';
import badgesRouter from './routes/badgesRouter.js';

// Backend\entities\User_Stats.js
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('../Frontend/licenta/public'));

DB_init();

app.use('/api', createDBRouter); //request Postman GET http://localhost:9000/api/create
app.use('/api', usersRouter);

app.use('/api', verifToken);

app.use('/api', tasksRouter);
app.use('/api', nomStatusRouter);
app.use('/api', nomPriorityRouter);
app.use('/api', nomTagsRouter);
app.use('/api', nomTT);
app.use('/api', userStats);
app.use('/api', auditRouter);
app.use('/api', projectsRouter);
app.use('/api', badgesRouter);

let port = process.env.PORT || 9000;
app.listen(port);
console.log(`Serverul ruleaza pe portul ${port}`);

app.listen(port, () => {
    console.log(`Verifica baza de date la: http://localhost:${port}/api/create`);
})