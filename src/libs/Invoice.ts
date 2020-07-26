var pdf = require("html-pdf");
import * as moment from "moment";

import GenerateHtml from "./generateTemplate";

class Invoice {
  order = {};
  constructor(order) {
    this.order = order;
  }

  async pdf() {
    return new Promise(async resolve => {
      const html = await GenerateHtml("invoice", {
        ...this.order,
        createdAt: moment(this.order["createdAt"]).format("MMMM Do YYYY")
      });
      const options = { format: "Letter", timeout: 100000 };
      const path = `public`;
      let orderId = this.order["orderId"];

      if (orderId.charAt(0) == "#") {
        orderId = orderId.substr(1, orderId.length);
      }
      const filename = `/invoice/INV-${orderId}.pdf`;
      pdf.create(html, options).toFile(path + filename, function(err, res) {
        if (err) {
          console.log("ERROT AT PDF", err.message);
          return resolve(filename);
        }
        resolve(filename);
      });
    });
  }
}

export default Invoice;
