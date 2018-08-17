const StreamReader 	= require("./streamReader.js");
const StreamWriter 	= require("./streamWriter.js");
const fio			= require("fs");
const consts		= require("./constants.js");
const insts			= require("./instructions.js");
const fmt			= require("util").format;
const process		= require("process");
const dasm			= require("./asm/disassembler.js");
const asm			= require("./asm/assembler.js");

function Header(ctx) {
	this.magic				= undefined;
	this.version			= 0;
	//this.nonCompliant = true;
	this.isLE				= true;
	this.intSize			= 4;
	this.instructionSize	= 4;
	this.machineSize		= 4;
	this.numberSize			= 4;
	this.platformFlags		= 0;	
	this.numOfTypes 		= 13;
	this.sharingMode		= 0; // sharing mode (0 - none, 1 - shared, 2 - secure) ? 1 : 0
	this.ctx = ctx;
}

Header.prototype.read = function() {
	var buffer = this.ctx.reader.readBytes(false, 14);
	this.magic = buffer.readUInt32LE();
	this.version = buffer.readUInt8(4);
	this.platformFlags = buffer.readUInt8(12);  // extensions etc
	
	this.intSize = buffer.readUInt8(7);         // sizeOfInt
	this.machineSize = buffer.readUInt8(8);     // sizeOfSize
	this.instructionSize = buffer.readUInt8(9); // sizeOfLuaN
	this.numberSize = buffer.readUInt8(10);     // sizeOfNumber
	
	var idk = buffer.readUInt8(5); //??
	this.isLE = buffer.readUInt8(6) ? true : false;
	this.sharingMode = buffer.readUInt8(13) ? true : false;
	
	this.numOfTypes = this.ctx.reader.readInteger();
	if (this.numOfTypes != 13) {
		console.log("There should only be 13 types");
		return false;
	}
	
	for (var i in consts.list) {
		var type = consts.list[i];
		var id = this.ctx.reader.readInteger();
		if (id != type.id)
		{
			console.log(fmt("illegal type index %i expected: %s (%i)", id, type.id, type.name));
			return false;
		}
		var str = this.ctx.reader.readCString();
		if (str != type.tname)
		{
			console.log(fmt("illegal type name %s expected: %s", str, type.tname));
			return false;
		}
	}
	
	return true;
}

Header.prototype.write = function(ctx) {
	this.ctx.writer.writeUByte(0x1B);
	this.ctx.writer.writeUByte(0x4C); //L
	this.ctx.writer.writeUByte(0x75); //U
	this.ctx.writer.writeUByte(0x61); //A

	this.ctx.writer.writeUByte(this.version);
	this.ctx.writer.writeUByte(13); // ???
	this.ctx.writer.writeUByte(this.isLE ? 1 : 0);

	this.ctx.writer.writeUByte(this.intSize);
	this.ctx.writer.writeUByte(this.machineSize);
	this.ctx.writer.writeUByte(this.instructionSize);
	this.ctx.writer.writeUByte(this.numberSize);

	this.ctx.writer.writeUByte(0); //TODO
	this.ctx.writer.writeUByte(this.platformFlags);
	this.ctx.writer.writeUByte(this.sharingMode ? 1 : 0);
	
	this.ctx.writer.writeInteger(this.numOfTypes);
	
	consts.list.forEach((type) => {
		this.ctx.writer.writeInteger(type.id);
		this.ctx.writer.writeCString(type.tname);
	});
}

function Debug(ctx, method) {
	this.ctx	= ctx;
	this.method	= method;
	
	this.type = 0;
	this.data = {};
}

Debug.prototype.read = function() {
	this.type = this.ctx.reader.readInteger();
	
	if (this.type == 1)  {
		this.data["unknown"] = this.ctx.reader.readInteger();
	} else if (this.type == 0) {
		return;
	} else if (this.type == 40) { //implemented in t6
		//TODO:
	} else if (this.type == 0x48) {
		/*
		    hks::BytecodeWriter::dumpInt(this, 0x48);
			hks::BytecodeWriter::dumpInt(v6, v5->m_debug->line_defined);
			hks::BytecodeWriter::dumpInt(v6, v5->m_debug->last_line_defined);
			if ( v4 )
			v8 = 0i64;
			else
			v8 = v5->m_debug->source;
			hks::BytecodeWriter::dumpString(v6, v8);
			hks::BytecodeWriter::dumpString(v6, v5->m_debug->name);
			hks::BytecodeWriter::dumpVector<hksInstruction>(v6, 0i64, 0i64, 0);
			hks::BytecodeWriter::dumpInt(v6, 0);
			hks::BytecodeWriter::dumpInt(v6, 0);
		*/
	}
}

Debug.prototype.write = function() {
	this.ctx.writer.writeInteger(this.type);
	
	if (this.type == 1)  {
		this.ctx.writer.writeInteger(this.data["unknown"]);
	} else if (this.type == 0) {
		return;
	} else if (this.type == 40) { //implemented in t6 - but seemingly unused
		//TODO:
	} else if (this.type == 0x48) {
		//TODO:
	}
}

function Constants(ctx, method) {
	this.ctx	= ctx;
	this.method	= method;
	
	this.objs = [];
}

Constants.prototype.read = function() {
	var size = this.ctx.reader.readMachine();
	
	for (var i = 0; i < size; i++) {
		//console.log("reading constant at " + this.ctx.reader.index);
		var id = this.ctx.reader.readUByte();
		var type = consts.byId[id];
		
		if (!type) {
			console.log("illegal constant type " + id);
			return false;
		}
		
		var inst = new type();
		inst.undump(this.ctx.reader, this.ctx);
		this.objs.push(inst);
	}
	
	return true;
}

Constants.prototype.write = function() {
	this.ctx.writer.writeMachine(this.objs.length);
	this.objs.forEach((obj) => {
		this.ctx.writer.writeUByte(obj.id);
		obj.dump(this.ctx.writer, this.ctx);
	});
}

function Method(ctx) {
	this.ctx		= ctx;
	this.debug		= new Debug(ctx, this);
	this.constants	= new Constants(ctx, this);
	this.upvals 	= 0;
	this.params 	= 0;
	this.flags 		= 0;
	this.registers	= 0;
	this.code		= [];
	this.decoded	= [];
	this.closures   = [];
}

Method.prototype.read = function() {
	this.upvals 	= this.ctx.reader.readInteger();
	this.params 	= this.ctx.reader.readInteger();
	this.flags 		= this.ctx.reader.readUByte();
	this.registers	= this.ctx.reader.readInteger();
	
	if (this.ctx.header.sharingMode) {
		console.log("illegal sharing mode");
		return;
	}
	
	this.code		= this.ctx.reader.readVectorDWORD();
	this.parseInstructions();

	this.constants.read();
	this.debug.read();

	var items		= this.ctx.reader.readInteger();

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
		var I = insts.getOp(code);
		var instruction  = insts.instructionById[I];
		if (!instruction) {
			console.log(fmt("WTF... ILLEGAL INSTRUCTION [index: %i]", I));
			return;
		}
		data.I = I;
		data.instruction = instruction;
		if (instruction.type == insts.instructionTypes.iABC) {
			var temp = insts.decodeABC(code);
			data.a = temp.a;
			data.b = temp.b;
			data.c = temp.c;
		} else if (instruction.type == insts.instructionTypes.iABx) {
			var temp = insts.decodeABx(code);
			data.a = temp.a;
			data.b = temp.b;
		} else if (instruction.type == insts.instructionTypes.iAsBx) {
			var temp = insts.decodeAsBx(code);
			data.a = temp.a;
			data.b = temp.b;
		} else {
			console.log("WTF... ILLEGAL INSTRUCTION");
		}
		this.decoded.push(data);
	});
}


function Context() {
	this.types = consts;
	this.header = new Header(this);
	this.mainMethod = new Method(this);
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
	Context: Context,
	Method: Method,
	Constants: Constants,
	Debug: Debug,
	Header: Header,
	constants: consts,
	instructions: insts
}