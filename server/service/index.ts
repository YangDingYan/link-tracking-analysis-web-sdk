function handleData1() {
  const data = { message: "successV1", code: "200" };
  console.info(global.traceInfo, "handleData1");
  return data;
}

function handleData2() {
  const data = { message: "error", code: "304" };
  console.info(global.traceInfo, "handleData2");
  return data;
}

exports.getLoadSystemMenuList1 = function (req) {
  const data = handleData1();
  console.warn(global.traceInfo, "getLoadSystemMenuList1");
  return data;
}

exports.getLoadSystemMenuList2 = function (req) {
  const data = handleData2();
  console.warn(global.traceInfo, "getLoadSystemMenuList2");
  return data;
}