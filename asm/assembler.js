const consts		= require("./../constants.js");
const insts			= require("./../instructions.js");
const fmt			= require("util").format;

function parseLine(line) {
	var ret = [];
	
	if (line.indexOf(';') != -1)
		line = line.substring(0, line.indexOf(';'));
	
	var objs = line.split("\t").join(" ")  // convert tabs into spaces
				.split(",").join(" ")      // convert ,'s into spaces
				.split(":").join("") // get rid of optional :'s 
				.split("(").join("") // get rid of optional brackets
				.split(")").join("") // get rid of optional brackets
				.split(" ");         // split 
	
	var hack = false;
	
	if (objs.length == 0) return undefined;
		
	objs.forEach((obj) => {
		var parsed = {
			raw: obj,
			number: {
				present: false,
				value: 0
			},
			bool: {
				present: false,
				value: false
			},
			JSON: {
				present: false,
				value: {}
			}
		};
		
		if (obj.length == 0) return;
		
		
		if (parseFloat(obj)) {
			parsed.number.present = true;
			parsed.number.value = parseFloat(obj);
		} 
		
		if (obj == "true" || obj == "false") {
			parsed.bool.present = true;
			parsed.bool.value = obj == "true";
		}
		
		if (obj.charAt(0) == '{' && line.charAt(line.length - 1)) {
			var json = line.substring(line.indexOf("{"));
			parsed.raw = json;
			parsed.JSON.present = true;
			parsed.JSON.value = JSON.parse(json);
			ret.push(parsed);
			hack = true;
		}
		
		if (!hack)
			ret.push(parsed);
	});
	
	if (ret.length == 0) return undefined;
	return ret;
}

function LineBuffer(string) {
	this.data = string.split("\r").join("").split("\n").filter((str) => {return str.length});
	this.index = 0;
} 

LineBuffer.prototype.peak = function() {
	return this.next(true);
}

LineBuffer.prototype.peakKey = function() {
	return this.peak()[0].raw;
}

LineBuffer.prototype.next = function(peak) {
	var out;
	var offset = 0;
	while (!(out = parseLine(this.data[this.index + offset])))
		offset ++;
	if (!peak)
		this.index += offset + 1;
	return out;
}

LineBuffer.prototype.nextKey = function() {
	return this.next()[0].raw;
}

function readBlock(buffer, context, title, callback, data) {
	var start 	= "START_" + title;
	var end 	= "END_"	 + title;
	var temp;

	temp = buffer.nextKey();
	if (temp != start) {
		console.log(fmt("expected: %s, got %s", start, temp));
		return false;
	}
	
	callback(buffer, context, data);
	
	temp = buffer.nextKey();
	if (temp != end) {
		console.log(fmt("expected: %s, got %s", end, temp));
		return false;
	}
	
	return true;
}

function handleHeader(buffer, context) {
	if (buffer.peakKey() == "START_NUMBER_SIZES") {
		readBlock(buffer, context, "NUMBER_SIZES", handleHeaderNumberics);
		return handleHeader(buffer, context);
	}
	
	if (buffer.peakKey() == "VERSION") {
		//TODO assert
		context.header.version = buffer.next()[1].number.value;
		return handleHeader(buffer, context);
	}
	
	if (buffer.peakKey() == "LENDIAN") {
		//TODO assert
		context.header.isLE = buffer.next()[1].bool.value;
		return handleHeader(buffer, context);
	}
	
	if (buffer.peakKey() == "UNK") {
		//TODO assert
		context.header.unkByte = buffer.next()[1].number.value;
		return handleHeader(buffer, context);
	}
	
	if (buffer.peakKey() == "FLAGS") {
		//TODO assert
		context.header.platformFlags = buffer.next()[1].number.value;
		return handleHeader(buffer, context);
	}
	
	if (buffer.peakKey() == "TYPES") {
		//TODO assert
		context.header.numOfTypes = buffer.next()[1].number.value;
		return handleHeader(buffer, context);
	}
	
	if (buffer.peakKey() == "SHARE") {
		//TODO assert
		context.header.share = buffer.next()[1].bool.value;
		return handleHeader(buffer, context);
	}
}

function handleHeaderNumberics(buffer, context) {
	if (buffer.peakKey() == "NUMBER") {
		//TODO assert
		context.header.numberSize = buffer.next()[1].number.value;
		return handleHeaderNumberics(buffer, context);
	}
	if (buffer.peakKey() == "INTEGER") {
		//TODO assert
		context.header.intSize = buffer.next()[1].number.value;
		return handleHeaderNumberics(buffer, context);
	}
	if (buffer.peakKey() == "INSTRUCTION") {
		//TODO assert
		context.header.instructionSize = buffer.next()[1].number.value;
		return handleHeaderNumberics(buffer, context);
	}
	if (buffer.peakKey() == "SIZE_T") {
		//TODO assert
		context.header.machineSize = buffer.next()[1].number.value;
		return handleHeaderNumberics(buffer, context);
	}
}

function handleMethodDebug(buffer, context, dbg ) {
	if (buffer.peakKey() == "TYPE") {
		//TODO assert
		dbg.type = buffer.next()[1].number.value;
		return handleMethodDebug(buffer, context, dbg);
	}
	if (buffer.peakKey() == "DATA") {
		//TODO assert
		dbg.data = buffer.next()[1].JSON.value;
		return handleMethodDebug(buffer, context, dbg);
	}
	return true;
}

function handleMethodConstants(buffer, context, constants) {
	if (buffer.peakKey() == "END_CONSTANTS")  return true;
	for (let Type of consts.list) {
		if (Type.tname == buffer.peakKey()) {
			var type = new Type();
			var ahh = buffer.next();
			if (ahh[1])
				type.fromString(ahh[1].raw);
			else if (Type.tname == "TSTRING")
				type.value = "";
			constants.objs.push(type);
			return handleMethodConstants(buffer, context, constants);
		}
	}
	return false;
}

function handleMethodCode(buffer, context, opcodes) {
	while (buffer.peakKey() != "END_CODE") {
		var nxt = buffer.next();
		
		if (Object.keys(insts.instructionTypes).indexOf(nxt[0].raw) != -1)
			nxt.shift(); 
		
	//	console.log(nxt[0].raw)
		var instruction = insts.instructionByName[nxt[0].raw];
		nxt.shift(); 
		//console.log(instruction)
		
		if (instruction.type == insts.instructionTypes.iABC) {
			opcodes.push(insts.encodeABC(instruction.opcode, nxt[0].number.value, nxt[1].number.value, nxt[2].number.value));
		} else if (instruction.type == insts.instructionTypes.iABx) {
			opcodes.push(insts.encodeABx(instruction.opcode, nxt[0].number.value, nxt[1].number.value));
		} else if (instruction.type == insts.instructionTypes.iAsBx) {
			opcodes.push(insts.encodeAsBx(instruction.opcode, nxt[0].number.value, nxt[1].number.value));
		}
	}
}

function handleClosure(buffer, context, data) {
	var id = data.id;
	var newMethod = new (require("./../index.js").Method)(context);
	readBlock(buffer, context, "METHOD", handleMethod, newMethod);
	data.parent.closures.push(newMethod);
}

function handleMethod(buffer, context, method) {
	if (buffer.peakKey() == "START_DBG") {
		if (!readBlock(buffer, context, "DBG", handleMethodDebug, method.debug))
			return false;
		return handleMethod(buffer, context, method);
	}
	if (buffer.peakKey() == "START_CONSTANTS") {
		if (!readBlock(buffer, context, "CONSTANTS", handleMethodConstants, method.constants))
			return false;
		return handleMethod(buffer, context, method);
	}
	if (buffer.peakKey() == "START_CODE") {
		if (!readBlock(buffer, context, "CODE", handleMethodCode, method.code))
			return false;
		method.parseInstructions();
		return handleMethod(buffer, context, method);
	}
	
	if (buffer.peakKey() == "START_CLOSURE") {
		if (!readBlock(buffer, context, "CLOSURE", handleClosure, {parent: method, id: buffer.peak()[1].number.value}))
			return false;
		return handleMethod(buffer, context, method);
	}
	
	
	if (buffer.peakKey() == "FLAGS") {
		//TODO assert
		method.flags = buffer.next()[1].number.value;
		return handleMethod(buffer, context, method);
	}
	
	if (buffer.peakKey() == "PARAMS") {
		//TODO assert
		method.params = buffer.next()[1].number.value;
		return handleMethod(buffer, context, method);
	}
	
	if (buffer.peakKey() == "UPVALS") {
		//TODO assert
		method.upvals = buffer.next()[1].number.value;
		return handleMethod(buffer, context, method);
	}
	
	if (buffer.peakKey() == "REGCNT") {
		//TODO assert
		method.registers = buffer.next()[1].number.value;
		return handleMethod(buffer, context, method);
	}
	

	return true;
}

function handleScript(buffer, context) {
	if (buffer.peakKey() == "START_HEADER") {
		readBlock(buffer, context, "HEADER", handleHeader);
		return handleScript(buffer, context);
	}
	if (buffer.peakKey() == "START_METHOD") {
		readBlock(buffer, context, "METHOD", handleMethod, context.mainMethod);
		return handleScript(buffer, context);
	}
}

function asmContext(string, context) {
	readBlock(new LineBuffer(string), context, "SCRIPT", handleScript);
}

module.exports = {
	asmContext: asmContext
}