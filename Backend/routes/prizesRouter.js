import express from 'express';
import {
    getPrizes,
    getUserPurchases,
    buyPrize
} from '../dataAccess/PrizesDA.js';

let prizesRouter = express.Router();

prizesRouter.route('/prizes')
    .get(async (req, res) => {
        try {
            const prizes = await getPrizes();
            return res.json(prizes);
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    });

prizesRouter.route('/prizes/my')
    .get(async (req, res) => {
        try {
            const myPrizes = await getUserPurchases(req.user.userId);
            return res.json(myPrizes);
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    });

prizesRouter.route('/prizes/buy/:id')
    .post(async (req, res) => {
        try {
            const purchase = await buyPrize(req.user.userId, req.params.id);
            return res.status(201).json(purchase);
        } catch (e) {
            return res.status(400).json({ error: e.message });
        }
    });

export default prizesRouter;