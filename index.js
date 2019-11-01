const StreamReader     = require("./bin/streamReader.js");
const StreamWriter     = require("./bin/streamWriter.js");
const fio              = require("fs");
const consts           = require("./constants.js");
const process          = require("process");
const dasm             = require("./asm/disassembler.js");
const asm              = require("./asm/assembler.js");

const instructions     = require("./instructions/instructions.js");

const T6Header         = require("./T6Header.js");
const T6Method         = require("./T6Method.js");


function Context() {
    this.types = consts;
    this.header = new T6Header(this);
    this.mainMethod = new T6Method(this);
	this.HeaderType = T6Header;
	this.MethodType = T6Method;
    this.reader = undefined;
    this.writer = undefined;
}

Context.prototype.fromBuffer = function(buf) {
    this.reader = new StreamReader(buf, this);
    this.header.read();
    this.mainMethod.read();
}

Context.prototype.fromFile = function(file) {
    this.fromBuffer(fio.readFileSync(file));
}

Context.prototype.save = function(file) {
    this.writer = new StreamWriter(this);
    this.header.write();
    this.mainMethod.write();
    this.writer.shrink();
    if (file)
        fio.writeFileSync(file, this.writer.buffer);
}

Context.prototype.disassembleStdout = function() {
    var buffer = {msg: ""};
    dasm.dsmContext(buffer, this);
    process.stdout.write(buffer.msg);
}

Context.prototype.disassembleFile = function(file) {
    var buffer = {msg: ""};
    dasm.dsmContext(buffer, this);
    fio.writeFileSync(file, buffer.msg);
}

Context.prototype.assemble = function(str) {
    asm.asmContext(str, this);
}

Context.prototype.assembleFile = function(file) {
    this.assemble(fio.readFileSync(file, "utf8"));
}

module.exports = {
    T6Context: Context,
    types: consts,
    instructions: instructions
}