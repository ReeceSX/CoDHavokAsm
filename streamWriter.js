const PAGE_SIZE = 1024;

function Writer(ctx) {
	this.buffer =  Buffer.alloc(1);
	this.index = 0;
	this.ctx = ctx;
}

Writer.prototype.expand		= function(length) {
	var old = this.buffer;
	if (!(this.index + length > old.length)) return;
	old.copy(this.buffer = Buffer.alloc(this.buffer.length + PAGE_SIZE));
}

Writer.prototype.shrink		= function() {
	var old = this.buffer;
	old.copy(this.buffer = Buffer.alloc(this.index));
}

Writer.prototype.writeCString		= function(str) {
	this.expand(str.length + 5);
	
	this.buffer.writeUInt32LE(str.length + 1, this.index);
	this.index += 4;
	
	Buffer.from(str).copy(this.buffer, this.index);
	this.index += str.length;
	
	this.writeUByte(0);
	return str;
}

Writer.prototype.writeUByte			= function(data) {
	this.expand(1);
	
	this.buffer.writeUInt8(data, this.index);
	this.index += 1;
}

Writer.prototype.writeByte			= function(data) {
	this.expand(1);
	
	this.buffer.writeInt8(data, this.index);
	this.index += 1;
}

Writer.prototype.writeNumber			= function(data) {
	this.expand(this.ctx.header.numberSize);
	
	if (this.ctx.header.numberSize == 4) {
		if (this.ctx.header.isLE)
			this.buffer.writeFloatLE(data, this.index);
		else
			this.buffer.writeFloatBE(data, this.index);
		this.index += 4;
		return;
	} 

	if (this.ctx.header.numberSize == 8) {
		if (this.ctx.header.isLE)
			this.buffer.writeDoubleLE(data, this.index);
		else
			this.buffer.writeDoubleBE(data, this.index);
		this.index += 8;
		return;
	} 
	
	//TODO:
	console.log("illegal number size");
}

Writer.prototype.writeMachine		= function(data) {
	this.expand(this.ctx.header.machineSize);
	
	if (this.ctx.header.machineSize == 4) {
		if (this.ctx.header.isLE)
			this.buffer.writeUInt32LE(data, this.index);
		else
			this.buffer.writeUInt32BE(data, this.index);
		this.index += 4;
		return;
	}
	
	//TODO:
	console.log("int64 not supported");
	return -203;
}

Writer.prototype.writeInstruction	= function(int) {
	this.expand(this.ctx.header.instructionSize);
	
	if (this.ctx.header.instructionSize == 4) {
		if (this.ctx.header.isLE)
			this.buffer.writeUInt32LE(int, this.index);
		else
			this.buffer.writeUInt32BE(int, this.index);
		this.index += 4;
		return;
	}
	
	//TODO:
	console.log("int64 not supported");
	return -203;
}

Writer.prototype.writeInteger		= function(int) {
	this.expand(this.ctx.header.intSize);
	
	if (this.ctx.header.intSize == 4) {
		if (this.ctx.header.isLE)
			this.buffer.writeInt32LE(int, this.index);
		else
			this.buffer.writeInt32BE(int, this.index);
		this.index += 4;
		return;
	}
	
	//TODO:
	console.log("int64 not supported");
	return -203;
}

Writer.prototype.writeVectorDWORD	= function(array) {
	var junk 	= ((this.index + 3) & 0xFFFFFFFC) - this.index;
	this.writeMachine(array.length);
	for (var i = 0; i < junk; i ++)
		this.writeUByte(0x5F);
	for (var i = 0; i < array.length; i ++)
		this.writeInstruction(array[i]);
}

module.exports = Writer;