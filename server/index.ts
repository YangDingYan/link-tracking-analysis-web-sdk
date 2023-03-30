const express = require("express")
const controller = require("./controller/index.ts")
const app = express()

app.all("*", function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('X-Powered-By', ' 3.2.1')
  res.header('Content-Type', 'application/json;charset=utf-8')
  // console.log("eeeee", req)
  // global.traceId = req.get("trace-id")
  global.traceInfo = {
    traceAppType: req.get("trace-app-type"),
    traceAppName: req.get("trace-app-name"),
    tracePagePath: req.get("trace-page-path"),
    tracePageName: req.get("trace-page-name"),
    tracePageLoadedTime: req.get("trace-page-loaded-time"),
    traceApiPath: req.get("trace-api-path"),
    traceId: req.get("trace-id"),
  }
  next()
})


controller.controllers.forEach(apiConfig => {
  const {path, method, callback} = apiConfig;
  app[method]("/link-tracking"+path, callback);
});

app.listen(3000, () => {
  console.log("Server listening on: http://localhost:3000")
})