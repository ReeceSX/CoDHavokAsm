function Debug(ctx, method) {
    this.ctx    = ctx;
    this.method = method;
    
    this.type = 0;
    this.data = {};
}

Debug.prototype.read = function() {
    this.type = this.ctx.reader.readInteger();
    
    if (this.type == 1)  {
        this.data["unknown"] = this.ctx.reader.readInteger();
    } else if (this.type == 0) {
        
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

module.exports = Debug;