function Header(ctx) {
    this.magic              = undefined;
    this.version            = 0;
    //this.nonCompliant = true;
    this.isLE               = true;
    this.intSize            = 4;
    this.instructionSize    = 4;
    this.machineSize        = 4;
    this.numberSize         = 4;
    this.platformFlags      = 0;    
    this.numOfTypes         = 13;
    this.sharingMode        = 0; // sharing mode (0 - none, 1 - shared, 2 - secure) ? 1 : 0
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
    
    for (var i in this.ctx.types.list) {
        var type = this.ctx.types.list[i];
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
    
    this.ctx.types.list.forEach((type) => {
        this.ctx.writer.writeInteger(type.id);
        this.ctx.writer.writeCString(type.tname);
    });
}

module.exports = Header;