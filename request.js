.pragma library

var GET = 'GET';
var POST = 'POST';

function Request() {
    this.req = new XMLHttpRequest();

    this._response = {};
    this._response.headers = {};
    this._response.body = null;
    this._response.text = null;
    this._response.status = 0;
    this._response.contentType = null;

    this._request = {};
    this._request.method = null;
    this._request.url = '';
    this._request.data = undefined;
    this._request.query = {};

    return this;
}

Request.prototype.request = function (method, url) {
    this._request.method = method;
    this._request.url = url;

    return this;
}

Request.prototype.get = function (url) {
    this._request.method = GET;
    this._request.url = url;

    return this;
}

Request.prototype.post = function (url) {
    this._request.method = POST;
    this._request.url = url;

    return this;
}

Request.prototype.query = function () {
    if (arguments.length === 2) {
        this._request.query[arguments[0]] = arguments[1];
    } else if (arguments.length === 1 && typeof arguments[0] === 'object') {
        this._request.query = arguments[0];
    } else {
        throw 'invalid arguments. Either key+value strings or an object';
    }

    return this;
}

Request.prototype.send = function (data) {
    if (typeof data === 'object') {
        this._request.data = JSON.stringify(data);
        this._request.contentType = 'application/json';
    } else {
        this._request.data = data;
        this._request.contentType = 'application/text';
    }

    return this;
}

Request.prototype.end = function (callback) {
    var that = this;

    that.req.onreadystatechange = function() {
        if (that.req.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
            that.req.getAllResponseHeaders().split('\r\n').forEach(function (value) {
                that._response.headers[value.split(':')[0].trim()] = value.split(':')[1].trim();
            });
        } else if (that.req.readyState === XMLHttpRequest.DONE) {
            that._response.text = that.req.responseText;
            that._response.status = that.req.status;
            that._response.statusText = that.req.statusText;
            that._response.contentType = that._response.headers['content-type'] || '';

            if (that._response.contentType.indexOf('application/json') !== -1) {
                try {
                    that._response.body = JSON.parse(that._response.text);
                } catch (e) {
                    that._response.body = null;
                }
            }

            callback(null, that._response);
        }
    }

    var url = that._request.url;

    if (Object.keys(this._request.query).length) {
        url += '?'

        var queries = Object.keys(this._request.query).map(function (key) {
            return key + '=' + that._request.query[key];
        });

        url += queries.join('&');
    }

    that.req.open(that._request.method, url);
    that.req.setRequestHeader('content-type', that._request.contentType);
    that.req.send(that._request.data);
}
