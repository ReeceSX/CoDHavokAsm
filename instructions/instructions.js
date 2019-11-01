const   opcodes            = require("./instructionsT6.js");

var     instructionById    = {};
var     instructionByName  = {};

opcodes.forEach((obj) => {
    instructionById[obj.opcode] = obj;
});

opcodes.forEach((obj) => {
    instructionByName[obj.name] = obj;
});

module.exports = {
    instructions:      opcodes,
    instructionById:   instructionById,
    instructionByName: instructionByName
};