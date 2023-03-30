const { getLoadSystemMenuList1, getLoadSystemMenuList2 }  = require("../service/index.ts")

const controllers = [
  {
    path: "/demo/v1/:code",
    method: "get",
    callback: function(req, res){
      res.send(getLoadSystemMenuList1(req));
    }
  },
  {
    path: "/demo/v2/:id",
    method: "get",
    callback: function(req, res){
      res.send(getLoadSystemMenuList2(req));
    }
  }
];



exports.controllers = controllers;
// module.exports = {
//   controllers
// }