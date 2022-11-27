class BaseModel {
  constructor(params) {
    const { data, msg } = params;
    if (typeof data === "string") {
      this.msg = data;
      data = null;
      msg = null;
    }

    if (data) {
      this.data = data;
    }

    if (msg) {
      this.msg = msg;
    }
  }
}

class SuccessModel extends BaseModel {
  constructor(params) {
    const { data, msg, code } = params;
    super(params);
    this.code = code || 200;
  }
}

class ErrorModel extends BaseModel {
  constructor(params) {
    const { data, msg, code, err } = params;
    super(params);
    this.code = code || 404;
    this.err = err || "";
  }
}

module.exports = {
  SuccessModel,
  ErrorModel,
};
