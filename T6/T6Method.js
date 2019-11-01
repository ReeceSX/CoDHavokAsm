const decoder   = require("./../instructions/instructionDecoder.js");
const ops       = require("./../instructions/instructions.js");
const fmt       = require("util").format;

const Constants = require("./T6Constants.js");
const Debug     = require("./T6Debug.js");

function Method(ctx) {
    this.ctx        = ctx;
    this.debug      = new Debug(ctx, this);
    this.constants  = new Constants(ctx, this);
    this.upvals     = 0;
    this.params     = 0;
    this.flags      = 0;
    this.registers  = 0;
    this.code       = [];
    this.decoded    = [];
    this.closures   = [];
}

Method.prototype.read = function() {
    this.upvals     = this.ctx.reader.readInteger();
    this.params     = this.ctx.reader.readInteger();
    this.flags      = this.ctx.reader.readUByte();
    this.registers  = this.ctx.reader.readInteger();
    
    if (this.ctx.header.sharingMode) {
        console.log("illegal sharing mode");
        return;
    }
    
    this.code = this.ctx.reader.readVectorDWORD();
    this.parseInstructions();

    this.constants.read();
    this.debug.read();

    var items = this.ctx.reader.readInteger();

    for (var i = 0; i < items; i++){
        var methods = new Method(this.ctx);
        this.closures.push(methods);
        methods.read();
    }
}

Method.prototype.write = function() {
    this.ctx.writer.writeInteger(this.upvals);
    this.ctx.writer.writeInteger(this.params);
    this.ctx.writer.writeUByte(this.flags);
    this.ctx.writer.writeInteger(this.registers);
    
    if (this.ctx.header.sharingMode) {
        console.log("illegal sharing mode");
        return;
    }
    
    this.ctx.writer.writeVectorDWORD(this.code);
    
    this.constants.write();
    this.debug.write();

    this.ctx.writer.writeInteger(this.closures.length);
    this.closures.forEach((closure) => {
        closure.write();
    });
}

Method.prototype.parseInstructions = function() {
    this.code.forEach((code) => {
        var data = {};
		var instruction;
		
		var I = decoder.getOp(code);
		
        if (!(instruction  = ops.instructionById[I])) {
            console.log(fmt("WTF... ILLEGAL INSTRUCTION [index: %i]", I));
            return;
        }
		
        data.I = I;
        data.instruction = instruction;
		
        if (instruction.type == decoder.instructionTypes.iABC) {
            var temp = decoder.decodeABC(code);
            data.a = temp.a;
            data.b = temp.b;
            data.c = temp.c;
        } else if (instruction.type == decoder.instructionTypes.iABx) {
            var temp = decoder.decodeABx(code);
            data.a = temp.a;
            data.b = temp.b;
        } else if (instruction.type == decoder.instructionTypes.iAsBx) {
            var temp = decoder.decodeAsBx(code);
            data.a = temp.a;
            data.b = temp.b;
        } else {
            console.log("WTF... ILLEGAL INSTRUCTION");
        }
		
        this.decoded.push(data);
    });
}

module.exports = Method;