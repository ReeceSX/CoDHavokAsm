function Constants(ctx, method) {
    this.ctx    = ctx;
    this.method = method;
    
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

module.exports = Constants;