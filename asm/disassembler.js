const consts		= require("./../constants.js");
const insts			= require("./../instructions.js");
const fmt			= require("util").format;

function append(_, level, str) {
	var a = "";
	for (var i = 0; i < level; i ++)
		a += "  ";
	_.msg += a + str + "\n";
}

function dmpConstants(_, level, constants) {
	append(_, level, "START_CONSTANTS");
	level++;
	constants.objs.forEach((obj) => {
		append(_, level, fmt("%s \t%s", obj.tname, obj.toString()));
	});
	level--;
	append(_, level, "END_CONSTANTS");
}

function getLargestOPLen() {
	var len = 0;
	insts.instructions.forEach((a) => { 
		len = Math.max(len, a.name.length); 
	});
	return len;
}

function alignInstruction(instruction) {
	var buf = instruction;
	for (var i = 0; i < getLargestOPLen() + 1 - instruction.length; i ++)
		buf += " ";
	return buf;
}

function dmpInstruction(_, level, parsedCode) {
	if (parsedCode.instruction.type == insts.instructionTypes.iABC)
		append(_, level, fmt("iABC\t%s(%i, %i, %i)", 	alignInstruction(parsedCode.instruction.name), parsedCode.a, parsedCode.b, parsedCode.c));
	else if (parsedCode.instruction.type == insts.instructionTypes.iABx)
		append(_, level, fmt("iABx\t%s(%i, %i)", 		alignInstruction(parsedCode.instruction.name), parsedCode.a, parsedCode.b));
	else if (parsedCode.instruction.type == insts.instructionTypes.iAsBx)
		append(_, level, fmt("iAsBx\t%s(%i, %i)", 		alignInstruction(parsedCode.instruction.name), parsedCode.a, parsedCode.b));
}

function dmpCode(_, level, decoded) {
	append(_, level, "START_CODE");
	level++;
	decoded.forEach((code) => {
		dmpInstruction(_, level, code);
	});
	level--;
	append(_, level, "END_CODE");
}

function dmpClosures(_, level, closures) {
	for (var i in closures) {
		var ahh = closures[i];
		append(_, level, "");
		append(_, level, fmt("START_CLOSURE %i", i));
		level++;
		dmpMethod(_, level, ahh);
		level--;
		append(_, level, fmt("END_CLOSURE %i", i));
	}
}

function dmpDbg(_, level, dbg) {
	append(_, level, "START_DBG");
	level++;
	append(_, level, fmt("TYPE\t%i", dbg.type));
	append(_, level, fmt("DATA\t%s", JSON.stringify(dbg.data)));
	level--;
	append(_, level, "END_DBG");
}

function dmpMethod(_, level, method) {
	append(_, level, "START_METHOD");
	level++;
	append(_, level, fmt("FLAGS\t%i", method.flags));
	append(_, level, fmt("PARAMS\t%i", method.params));
	append(_, level, fmt("UPVALS\t%i", method.upvals));
	append(_, level, fmt("REGCNT\t%i", method.registers));
	
	append(_, level, "");
	dmpCode(_, level, method.decoded);
	
	append(_, level, "");
	dmpConstants(_, level, method.constants);
	
	append(_, level, "");
	dmpDbg(_, level, method.debug);
	
	dmpClosures(_, level, method.closures);
	level--;
	append(_, level, "END_METHOD");
}


function dmpHeader(_, level, header) {
	append(_, level, "START_HEADER");
	level++;
	append(_, level, fmt("VERSION\t%i", header.version));
	append(_, level, fmt("LENDIAN\t%s", header.isLE ? "true" : "false"));
	append(_, level, "START_NUMBER_SIZES");
	level++;
	append(_, level, fmt("NUMBER       %i", header.numberSize));	
	append(_, level, fmt("INTEGER      %i", header.intSize));
	append(_, level, fmt("INSTRUCTION  %i", header.instructionSize));	
	append(_, level, fmt("SIZE_T       %i", header.machineSize));	
	level--;
	append(_, level, "END_NUMBER_SIZES");
	append(_, level, fmt("FLAGS\t%i", header.platformFlags));
	append(_, level, fmt("TYPES\t%i", header.numOfTypes));
	append(_, level, fmt("SHARE\t%s", header.share ? "true" : "false"));
	level--;
	append(_, level, "END_HEADER");
}

function dmpContext(_, context) {
	append(_, 0, "START_SCRIPT");
	dmpHeader(_, 1, context.header);
	append(_, 0, "");
	dmpMethod(_, 1, context.mainMethod);
	append(_, 0, "END_SCRIPT");
}

module.exports = {
	dsmContext: dmpContext
}