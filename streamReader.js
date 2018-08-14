const iset = require("./instructions.js");

function Reader(buffer, ctx) {
	this.buffer = buffer;
	this.index = 0;
	this.ctx = ctx;
}

Reader.prototype.readBytes = function(peak, length){
	var buf = this.buffer.slice(this.index, this.index + length);
	if (peak)
		return buf;
	this.index += length;
	return buf;
}

Reader.prototype.readCString		= function() {
	var length	= undefined;
	var str 	= undefined;
	length = this.buffer.readUInt32LE(this.index);
	this.index += 4;
	if (!length) return "";
	str = this.buffer.slice(this.index, this.index + length - 1).toString('utf8');
	this.index += length;
	return str;
}

Reader.prototype.readUByte			= function(peak) {
	var i = this.buffer.readUInt8(this.index);
	if (peak)
		return i;
	this.index += 1;
	return i;
}

Reader.prototype.readByte			= function(peak) {
	var i = this.buffer.readInt8(this.index);
	if (peak)
		return i;
	this.index += 1;
	return i;
}

Reader.prototype.readNumber			= function(peak) {
	if (this.ctx.header.numberSize == 4) {
		var i = this.ctx.header.isLE ? this.buffer.readFloatLE(this.index) : this.buffer.readFloatBE(this.index);
		if (peak)
			return i;
		this.index += 4;
		return i;
	} 
	
	if (this.ctx.header.numberSize == 8) {
		var i = this.ctx.header.isLE ? this.buffer.readDoubleLE(this.index) : this.buffer.readDoubleBE(this.index);
		if (peak)
			return i;
		this.index += 8;
		return i;
	}
	
	//TODO:
	console.log("illegal number size");
	return -203;
}

Reader.prototype.readMachine		= function(peak) {
	if (this.ctx.header.machineSize == 4) {
		var i = this.ctx.header.isLE ? this.buffer.readUInt32LE(this.index) : this.buffer.readUInt32BE(this.index);
		if (peak)
			return i;
		this.index += 4;
		return i;
	} 
	
	//TODO:
	console.log("int64 not supported");
	return -203;
}

Reader.prototype.readInstruction	= function(peak) {
	if (this.ctx.header.instructionSize == 4) {
		var i = this.ctx.header.isLE ? this.buffer.readUInt32LE(this.index) : this.buffer.readUInt32BE(this.index);
		if (peak)
			return i;
		this.index += 4;
		return i;
	}
	
	//TODO:
	console.log("int64 not supported");
	return -203;
}

Reader.prototype.readInteger		= function(peak) {
	if (this.ctx.header.intSize == 4) {
		var i = this.ctx.header.isLE ? this.buffer.readInt32LE(this.index) : this.buffer.readInt32BE(this.index);
		if (peak)
			return i;
		this.index += 4;
		return i;
	}
	
	//TODO:
	console.log("int64 not supported");
	return -203;
}

Reader.prototype.readVectorDWORD	= function(peak) {
	var buffer  = [];
	var length	= this.readMachine();
	this.index += ((this.index + 3) & 0xFFFFFFFC) - this.index;
	for (var i = 0; i < length; i ++)
		buffer[i] = this.readInstruction();
	return buffer;
}


module.exports = Reader;