var fs = require("fs");

fs.readdir(__dirname, function (err, files) {
  /** Import all files for defining models */
  files.forEach(function (fileName) {
    if (fileName.indexOf(".js.map") === -1) require(`./${fileName}`);
  });
});
