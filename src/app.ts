import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { limitToUpload } from './constants';
import router from './routes';

const app = express();

app.use(cors())
app.use(express.json({ limit: limitToUpload }));
app.use(express.urlencoded({ extended: true, limit: limitToUpload }));
app.use(express.static('public'));
app.use(morgan("dev"))

app.get("/", (req, res) => {
    res.send("Hello World")
})

app.use("/aggregation/v1", router)


export { app }