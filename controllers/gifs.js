const moment = require("moment");
const uuidv4 = require("uuid/v4");
const db = require("../db/index");
const helper = require("./helper");

const Gif = {
    async create(req, res) {
        const text = `INSERT INTO "public"."tw_gifs" (id, title, img_url, owner_id, created_on, modified_on)
            VALUES ($1, $2, $3, $4, $5, $6) returning *`;
        const gifId = uuidv4();
        const createdOn = moment(new Date());
        req.body.id = gifId;
        const values = [
            uuidv4(), req.body.title, req.body.img_url,
            req.user.id, createdOn, moment(new Date())
        ];
        try {
            const { rows } = await db.query(text, values);
            return res.status(201).send({
                status: 'success',
                data: {
                    gifId: rows[0].id,
                    message: 'GIF image successfully posted',
                    createdOn,
                    title: req.body.title,
                    imageUrl: req.body.img_url,
                    owner_id: req.user.id
                }
            });
        } catch (error) {
            return res.status(400).send(error);
        }
    }
}

module.exports = Gif;