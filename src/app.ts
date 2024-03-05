import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { limitToUpload } from './constants';
import router from './routes';

const mainRouter = express.Router();

mainRouter.use(cors())
mainRouter.use(express.json({ limit: limitToUpload }));
mainRouter.use(express.urlencoded({ extended: true, limit: limitToUpload }));
mainRouter.use(express.static('public'));
mainRouter.use(morgan("dev"))

mainRouter.get("/", (req, res) => {
    res.send("Hello World")
})

mainRouter.use("/aggregation/v1", router)


export { mainRouter }
