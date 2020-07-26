class OrderError extends Error {
  code;
  constructor(message, code) {
    super(message);
    this.name = "ORDER_ERROR";
    this.code = code;
  }
}

export default OrderError;
