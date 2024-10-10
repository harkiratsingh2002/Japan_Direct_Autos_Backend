const express = require("express");
const subscriberController = require("../Controllers/subscriberController.js");

const subscriberRouter = express.Router();

subscriberRouter.post("/subscribe", subscriberController.addSubscriber);
subscriberRouter.get("/send-mails", subscriberController.sendProductAddedEmail);

module.exports = subscriberRouter;
