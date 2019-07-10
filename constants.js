function notImpl(reader) { 
    console.log("not yet impl: " + this.tname + " offset " + reader.index)
}

function TypeTNIL() {
    this.value = undefined;
    this.tname = TypeTNIL.tname;
    this.id    = TypeTNIL.id;
}

TypeTNIL.id = 0;
TypeTNIL.tname = "TNIL";
TypeTNIL.prototype.dump       = function () {};
TypeTNIL.prototype.fromString = function () {};
TypeTNIL.prototype.toString   = function () { return ""};
TypeTNIL.prototype.undump     = function () {};

function TypeTBOOLEAN() {
    this.value = undefined;
    this.tname = TypeTBOOLEAN.tname;
    this.id    = TypeTBOOLEAN.id;
}

TypeTBOOLEAN.id = 1;
TypeTBOOLEAN.tname = "TBOOLEAN";
TypeTBOOLEAN.prototype.toString = function() {
    return this.value.toString();
}
TypeTBOOLEAN.prototype.fromString = function(str) {
    this.value = str == "true"; 
}
TypeTBOOLEAN.prototype.dump = function (writer, ctx) { 
    writer.writeUByte(this.value ? 1 : 0);
}
TypeTBOOLEAN.prototype.undump = function (reader, ctx) { 
    this.value = reader.readUByte() ? true : false; 
};

function TypeTLIGHTUSERDATA() {
    this.value = undefined;
    this.tname = TypeTLIGHTUSERDATA.tname;
    this.id    = TypeTLIGHTUSERDATA.id;
}

TypeTLIGHTUSERDATA.id = 2;
TypeTLIGHTUSERDATA.tname = "TLIGHTUSERDATA";
TypeTLIGHTUSERDATA.prototype.dump = notImpl;
TypeTLIGHTUSERDATA.prototype.undump = notImpl;

function TypeTNUMBER() {
    this.value = undefined;
    this.tname = TypeTNUMBER.tname;
    this.id    = TypeTNUMBER.id;
}

TypeTNUMBER.id = 3;
TypeTNUMBER.tname = "TNUMBER";
TypeTNUMBER.prototype.toString = function() {
    return this.value.toString();
}
TypeTNUMBER.prototype.fromString = function(str) {
    this.value = parseFloat(str); 
}
TypeTNUMBER.prototype.dump = function (writer, ctx) { 
    writer.writeNumber(this.value);
}
TypeTNUMBER.prototype.undump = function (reader, ctx) {
    this.value    = reader.readNumber(); 
}

function TypeTSTRING() {
    this.value = undefined;
    this.tname = TypeTSTRING.tname;
    this.id    = TypeTSTRING.id;
}

TypeTSTRING.id = 4;
TypeTSTRING.tname = "TSTRING";
TypeTSTRING.prototype.toString = function() {
    return this.value; 
}
TypeTSTRING.prototype.fromString = function(str) {
    this.value = str; 
}
TypeTSTRING.prototype.dump = function (writer, ctx) { 
    writer.writeCString(this.value);
}
TypeTSTRING.prototype.undump = function (reader, ctx) { 
    this.value = reader.readCString(); 
}

function TypeTTABLE() {
    this.value = undefined;
    this.tname = TypeTTABLE.tname;
    this.id    = TypeTTABLE.id;
}

TypeTTABLE.id = 5;
TypeTTABLE.tname = "TTABLE";
TypeTTABLE.prototype.dump = notImpl;
TypeTTABLE.prototype.undump = notImpl;

function TypeTFUNCTION() {
    this.value = undefined;
    this.tname = TypeTFUNCTION.tname;
    this.id    = TypeTFUNCTION.id;
}

TypeTFUNCTION.id = 6;
TypeTFUNCTION.tname = "TFUNCTION";
TypeTFUNCTION.prototype.dump = notImpl;
TypeTFUNCTION.prototype.undump = notImpl;

function TypeTUSERDATA() {
    this.value = undefined;
    this.tname = TypeTUSERDATA.tname;
    this.id    = TypeTUSERDATA.id;
}

TypeTUSERDATA.id = 7;
TypeTUSERDATA.tname = "TUSERDATA";               // userdata = unstructured native buffer
TypeTUSERDATA.prototype.dump = notImpl;          // userdata = unstructured native buffer
TypeTUSERDATA.prototype.undump = notImpl;        // userdata = unstructured native buffer

function TypeTTHREAD() {
    this.value = undefined;
}

TypeTTHREAD.id = 8;
TypeTTHREAD.tname = "TTHREAD";
TypeTTHREAD.prototype.dump = notImpl;
TypeTTHREAD.prototype.undump = notImpl;

function TypeTIFUNCTION() {
    this.value = undefined;
}

TypeTIFUNCTION.id = 9;
TypeTIFUNCTION.tname = "TIFUNCTION";
TypeTIFUNCTION.prototype.dump = notImpl;
TypeTIFUNCTION.prototype.undump = notImpl;

function TypeTCFUNCTION() {
    this.value = undefined;
    this.tname = TypeTCFUNCTION.tname;
    this.id    = TypeTCFUNCTION.id;
}

TypeTCFUNCTION.id = 10;
TypeTCFUNCTION.tname = "TCFUNCTION";
TypeTCFUNCTION.prototype.dump = notImpl;
TypeTCFUNCTION.prototype.undump = notImpl;

function TypeTUI64() {
    this.value = undefined;
    this.tname = TypeTUI64.tname;
    this.id    = TypeTUI64.id;
}

TypeTUI64.id = 11;
TypeTUI64.tname = "TUI64";
TypeTUI64.prototype.dump = notImpl;
TypeTUI64.prototype.undump = notImpl;
 
function TypeTSTRUCT() {
    this.value = undefined;
    this.tname = TypeTSTRUCT.tname;
    this.id    = TypeTSTRUCT.id;
}

TypeTSTRUCT.id = 12;
TypeTSTRUCT.tname = "TSTRUCT";
TypeTSTRUCT.prototype.dump = notImpl;
TypeTSTRUCT.prototype.undump = notImpl;
            
module.exports = {
    byId:  {    0: TypeTNIL,      1: TypeTBOOLEAN,  2: TypeTLIGHTUSERDATA,  3: TypeTNUMBER,     4: TypeTSTRING,     5: TypeTTABLE, 
                6: TypeTFUNCTION, 7: TypeTUSERDATA, 8: TypeTTHREAD,         9: TypeTIFUNCTION, 10: TypeTCFUNCTION, 11: TypeTUI64, 
                12: TypeTSTRUCT    },
    list: [    TypeTNIL,
            TypeTBOOLEAN, 
            TypeTLIGHTUSERDATA,
            TypeTNUMBER,
            TypeTSTRING,
            TypeTTABLE,
            TypeTFUNCTION,
            TypeTUSERDATA,
            TypeTTHREAD,
            TypeTIFUNCTION,
            TypeTCFUNCTION,
            TypeTUI64,
            TypeTSTRUCT    ]
};