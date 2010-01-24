process.mixin(require("./common"));

// The purpose of this test is not to check HTTP compliance but to test the
// binding. Tests for pathological http messages should be submitted
// upstream to http://github.com/ry/http-parser for inclusion into
// deps/http-parser/test.c


var parser = new process.HTTPParser("request");

var buffer = new process.Buffer(1024);

var request = "GET /hello HTTP/1.1\r\n\r\n";

buffer.asciiWrite(request, 0, request.length);

var callbacks = 0;

parser.onMessageBegin = function () {
  puts("message begin");
  callbacks++;
};

parser.onHeadersComplete = function (info) {
  puts("headers complete: " + JSON.stringify(info));
  assert.equal('GET', info.method);
  assert.equal(1, info.versionMajor);
  assert.equal(1, info.versionMinor);
  callbacks++;
};

parser.onURL = function (off, len) {
  //throw new Error("hello world");
  callbacks++;
};

parser.onPath = function (off, length) {
  puts("path [" + off + ", " + length + "]");
  var path = buffer.asciiSlice(off, off+length);
  puts("path = '" + path + "'");
  assert.equal('/hello', path);
  callbacks++;
};

parser.execute(buffer, 0, request.length);
assert.equal(4, callbacks);

//
// Check that if we throw an error in the callbacks that error will be
// thrown from parser.execute()
//

parser.onURL = function (off, len) {
  throw new Error("hello world");
};

assert.throws(function () {
  parser.execute(buffer, 0, request.length);
}, Error, "hello world");
