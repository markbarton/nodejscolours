const dotenv = require("dotenv").config({ path: "variables.env" });
const express = require("express");
const logger = require("./logger");
const setup = require("./setup");
const os = require("os");
const pjson = require("./package.json");
const colors = require("colors");
const port = ("port", process.env.PORT || 8534);
const app = express();

// run setup
try {
  setup.init();
} catch (err) {
  logger.error(`Critical Error - Server Stoppping ${err}`);
  process.exit();
}

//Warn if we are running in test mode
if (process.env.MODE === "test") {
  logger.info(
    colors.yellow.inverse(
      " **** CAUTION Running in Test Mode - Check variables file ****"
    )
  );
}

app.get("/job", function(req, res, next) {
  logger.info(colors.white.bgBlue(" ------BEGIN JOB ---------"));
  logger.info(colors.white.bgBlue("Running Job XYZ"));
  logger.info(colors.white.bgBlue(" ------END JOB ---------"));
  res.send({});
});

app.get("/pay", function(req, res, next) {
  logger.info(colors.white.bgMagenta(" ------BEGIN PAY ---------"));
  logger.info(colors.white.bgMagenta("Running Job XYZ"));
  logger.info(colors.white.bgMagenta(" ------END PAY ---------"));
  logger.error(colors.white.bgMagenta(" ------END PAY ---------"));
  res.send({});
});


const server = app.listen(port);
logger.info(colors.rainbow(`${pjson.name} running → http://localhost:${server.address().port}`));
