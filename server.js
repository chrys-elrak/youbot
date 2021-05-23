require('dotenv').config();

const express = require('express')
const cors = require('cors');
const router = require('./router');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);

app.all('*', (req, res) => {
  return res.sendStatus(404);
});


app.listen(port, () => {
  console.log(`Server is Listening on ${port}`);
});