const 	opcodes				= require("./instructions_a.js");
var 	instructionById 	= {};
var 	instructionByName	= {};

const e_iABC			= 0;
const e_iABx			= 1;
const e_iAsBx			= 2;

const itypes			= {	"iABC": 	e_iABC, 
							"iABx": 	e_iABx,
							"iAsBx":	e_iAsBx	};

opcodes.forEach((obj) => {
	instructionById[obj.opcode] = obj;
});

opcodes.forEach((obj) => {
	instructionByName[obj.name] = obj;
});

function getOp(code) {
	return (code >>> 25) & 0x7f;
}

function encodeABC(I, a, b, c) {
	var code = 0;
	code |= ((a & 0xFF ) << 0 ) & 0x000000FF;
	code |= ((b & 0xFF ) << 17) & 0x03FE0000; // havok script: b = 8 bits? uh okay
	code |= ((c & 0x1FF) << 8 ) & 0x0001FF00;
	code |= ((I & 0x7f ) << 25) & 0xFE000000;
	return code;
}

function decodeABC(code) {
	var I = (code >>> 25) & 0x3F;
	var a = (code       ) & 0xFF;
	var b = (code >>> 17) & 0xFF;
	var c = (code >>> 8 ) & 0x1FF;
	return {I: I, a: a, b: b, c: c};
}

function encodeABx(I, a, b) {
	var code = 0;
	code |= ((I & 0x7f   ) << 25) & 0xFE000000;
	code |= ((b & 0x1FFFF) << 8)  & 0x01FFFF00; // havok script: b = 17 bits? uh okay
	code |= ((a & 0xFF   ) << 0)  & 0x000000FF;
	return code;
}

function decodeABx(code) {
	var I = (code >>> 25) & 0x7f;
	var a = (code       ) & 0xFF;
	var b = (code >>> 8 ) & 0x1FFFF;
	return {I: I, a: a, b: b};
}

function encodeAsBx(I, a, b) {
	return encodeABx(I, a, b + 65535);
}

function decodeAsBx(code) {
	var ah = decodeABx(code);
	ah.b = ah.b  - 65535;
	return ah;
}

module.exports = {
	getOp:				getOp,
	encodeABC:			encodeABC,
	decodeABC:			decodeABC,
	encodeABx:			encodeABx,
	decodeABx:			decodeABx,
	encodeAsBx:			encodeAsBx,
	decodeAsBx:			decodeAsBx,
	instructions:		opcodes,
	instructionById:	instructionById,
	instructionByName:	instructionByName,
	instructionTypes:	itypes
};