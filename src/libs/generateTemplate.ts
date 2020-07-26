const Fs = require("fs");
const Path = require("path");
const Util = require("util");
const Handlebars = require("handlebars");
const ReadFile = Util.promisify(Fs.readFile);
import * as moment from "moment";

Handlebars.registerHelper("add", function(add1, add2, options) {
  const addition = parseFloat(add1) + parseFloat(add2);
  return addition.toFixed(2);
});

Handlebars.registerHelper("lookup", function(obj, field) {
  return obj[field] || false;
});

Handlebars.registerHelper("and", function(a, b) {
  console.log("A", a, b);
  return a && b;
});

Handlebars.registerHelper("formatDate", function(
  date,
  format = "MMMM Do YYYY"
) {
  return moment(date).format(format);
});

Handlebars.registerHelper("concat", function(str1, str2, str3 = "") {
  return str1 + str2 + str3;
});

Handlebars.registerHelper("link", function(url, text) {
  var url = Handlebars.escapeExpression(url),
    text = Handlebars.escapeExpression(text);
  console.log("URL", url, text);
  return new Handlebars.SafeString("<a href='" + url + "'>" + text + "</a>");
});

Handlebars.registerHelper("inArray", function(array, key, value) {
  if (typeof array === "object" && array instanceof Array) {
    for (let i = 0; i < array.length; i++) {
      if (array[i] && array[i][key] && array[i][key] === value) {
        return true;
      }
    }
  }
  return false;
});

// FIND IN ARRAY BY OBJECT PROPERTY
Handlebars.registerHelper("lookupArray", function(
  array,
  key,
  value,
  filter = "all"
) {
  // console.log("RETURNING", obj[field] || false);
  if (typeof array === "object" && array instanceof Array) {
    for (let i = 0; i < array.length; i++) {
      if (array[i] && array[i][key] && array[i][key] === value) {
        if (filter === "all") {
          return array[i];
        } else {
          return array[i][filter];
        }
      }
    }
  }
  return false;
});

export default async (templateName, data = {}) => {
  {
    try {
      const templatePath = Path.resolve(
        __dirname,
        "../templates",
        templateName + ".html"
      );
      const content = await ReadFile(templatePath, "utf8");

      // compile and render the template with handlebars
      const template = Handlebars.compile(content);

      return template(data);
    } catch (error) {
      throw new Error("Cannot create invoice HTML template." + error.message);
    }
  }
};
