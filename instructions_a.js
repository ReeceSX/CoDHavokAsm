const e_iABC		= 0;
const e_iABx		= 1;
const e_iAsBx		= 2;
/*
	R[n]  - register n 
	RK(0) - if n < 0x100
				r[n]
			else
				constant[n +, -, x, or / idfk man]
			
	UI64 = Unsigned Integer 64? -  internally referenced as 'int 60' or at least theres some 60bit range checking
	Structures have named slots
	Max slots per struct =  0xE0 
	Max structures (structures are defined as "prototypes"- not to be confused with literal function prototypes)
	CodeGEnerator

	slots can either be:
	enum hks::StructSlotType
	{
		HKS_SLOT_NORMAL = 0x0,
		HKS_SLOT_META = 0x1,
		HKS_SLOT_BACKING = 0x2,
		HKS_SLOT_PADDING = 0x3,
	};

*/
module.exports =
[
	{name: "HKS_OPCODE_TEST" 							, opcode: 0x1 	, type: e_iABC }, // R1_Type = R[a], do HKS_OPCODE_TEST_R1
	{name: "HKS_OPCODE_TEST_R1" 						, opcode: 0x47 	, type: e_iABC },
	/*
		c 	= int(c)					= c
		r1 	= bool(r1)					= type A  
	
		if (c == r1) fuck off and do something else
		else IP ++;
	*/
	
	{name: "HKS_OPCODE_EQ" 								, opcode: 0x4 	, type: e_iABC },
	{name: "HKS_OPCODE_EQ_BK" 							, opcode: 0x5 	, type: e_iABC },
	
	{name: "HKS_OPCODE_MOVE" 							, opcode: 0x7 	, type: e_iABC },
	/*
		R1					= dest_r1
		a	= R[a]			= dest_a
		b	= R[b]			= src
		
		dest_r1	= src
		dest_a	= src
	*/
	
	
	{name: "HKS_OPCODE_SELF" 							, opcode: 0x8 	, type: e_iABC },  // 
	{name: "HKS_OPCODE_RETURN" 							, opcode: 0x9 	, type: e_iABC },
	
	{name: "HKS_OPCODE_GETTABLE" 						, opcode: 0xC 	, type: e_iABC },
	/*
		HKS_OPCODE_DATA - always null?
		HKS_OPCODE_DATA - always null?
		
		0, exp info, exp aux 
		
		a = R[a]	= dest?
		b = R[b]	= table or struct 
		c = RK[c]	= key?
		
		dest = table or struct[key] ?????????
	*/
	
	{name: "HKS_OPCODE_GETTABLE_S" 						, opcode: 0xa 	, type: e_iABC },
	{name: "HKS_OPCODE_GETTABLE_N" 						, opcode: 0xb 	, type: e_iABC },
	
	{name: "HKS_OPCODE_TFORLOOP" 						, opcode: 0xe 	, type: e_iABC },
	{name: "HKS_OPCODE_FORLOOP" 						, opcode: 0x3f 	, type: e_iAsBx},
	{name: "HKS_OPCODE_FORPREP" 						, opcode: 0x3e 	, type: e_iAsBx},
	
	{name: "HKS_OPCODE_SETTABLE_S" 						, opcode: 0x10 	, type: e_iABC },
	{name: "HKS_OPCODE_SETTABLE_S_BK" 					, opcode: 0x11 	, type: e_iABC },
	/*
		hks::HashTable::insertString, falls back to hks::StructInst::insertString
	*/
	{name: "HKS_OPCODE_SETTABLE_N" 						, opcode: 0x12 	, type: e_iABC },
	{name: "HKS_OPCODE_SETTABLE_N_BK" 					, opcode: 0x13 	, type: e_iABC },
	/*
		hks::HashTable::insertNumber, falls back to hks::StructInst::insertNumber
	*/
	{name: "HKS_OPCODE_SETTABLE" 						, opcode: 0x14 	, type: e_iABC }, // TODO: (R[A])[B] = RK[C]
	{name: "HKS_OPCODE_SETTABLE_BK" 					, opcode: 0x15 	, type: e_iABC },
	
	// TODO: tailcalls are comparable to a jmp at the end of a sysv or cdecl compliant stub. 
	{name: "HKS_OPCODE_TAILCALL_I_R1" 					, opcode: 0x44 	, type: e_iABC },
	{name: "HKS_OPCODE_TAILCALL_I" 						, opcode: 0x16 	, type: e_iABC },
	{name: "HKS_OPCODE_TAILCALL_C" 						, opcode: 0x17 	, type: e_iABC },
	{name: "HKS_OPCODE_TAILCALL_M" 						, opcode: 0x18 	, type: e_iABC },
	{name: "HKS_OPCODE_TAILCALL" 						, opcode: 0x25 	, type: e_iABC },
	
	{name: "HKS_OPCODE_LOADK" 							, opcode: 0x19 	, type: e_iABx },
	/*
		a	= R[a]			   = dest
		b	= K(b) 			   = constant 
		
		dest = constant  
	*/
	
	{name: "HKS_OPCODE_LOADNIL" 						, opcode: 0x1a 	, type: e_iABC },
	/*
		for (cur = R[a]; cur < R[b]; cur++)
			cur->type = NIL
	*/
	{name: "HKS_OPCODE_LOADBOOL" 						, opcode: 0xd 	, type: e_iABC }, 
	/*
		a	= R[a]			   = dest
		b	= bool(int(R[b]))  = src
		c	= int(c)		   = skip
		
		dest  = src
		ip	 += skip
	*/
	
	{name: "HKS_OPCODE_JMP" 							, opcode: 0x1c 	, type: e_iAsBx},
	/*
		b 	= signed int(b)				= offset
		
		IP += offset
	*/
	
	{name: "HKS_OPCODE_CALL" 							, opcode: 0x1e 	, type: e_iABC },
	/*
	
	
	*/
	
	{name: "HKS_OPCODE_CALL_M" 							, opcode: 0x1d 	, type: e_iABC },  //function with memorization?
	/*
	
	
	
	*/
	
	{name: "HKS_OPCODE_CALL_C" 							, opcode: 0x3 	, type: e_iABC },  //**C**Function (native functions)
	/*
	
	
	*/
	
	{name: "HKS_OPCODE_CALL_I_R1" 						, opcode: 0x45 	, type: e_iABC },  // R1_Type = R[a], do HKS_OPCODE_CALL_I
	{name: "HKS_OPCODE_CALL_I" 							, opcode: 0x2 	, type: e_iABC },   //**I**Function (havok functions, i think)
	/*
	
	
	*/
	
	{name: "HKS_OPCODE_INTRINSIC_INDEX" 				, opcode: 0x1f 	, type: e_iABC },
	/*
	
	
	
	*/
	
	{name: "HKS_OPCODE_INTRINSIC_NEWINDEX" 				, opcode: 0x20 	, type: e_iABC },
	/*
	
	
	
	*/
	
	{name: "HKS_OPCODE_INTRINSIC_SELF" 					, opcode: 0x21 	, type: e_iABC },
	/*
	
	
	
	*/
	
	{name: "HKS_OPCODE_INTRINSIC_INDEX_LITERAL" 		, opcode: 0x22 	, type: e_iABC },
	/*
	
	
	
	*/
	
	{name: "HKS_OPCODE_INTRINSIC_NEWINDEX_LITERAL" 		, opcode: 0x23 	, type: e_iABC },
	/*
	
	
	
	*/
	
	{name: "HKS_OPCODE_INTRINSIC_SELF_LITERAL" 			, opcode: 0x24 	, type: e_iABC },
	/*
	
	
	
	*/
	
	{name: "HKS_OPCODE_GETUPVAL" 						, opcode: 0x26 	, type: e_iABC },
	/*
		R1					= object_r1
		a	= R[a]			= object_a
		bx 	= UpVal(int(b))	= upval 
		
		object_r1	= upval
		object_a	= upval
	*/
																				
	{name: "HKS_OPCODE_SETUPVAL" 						, opcode: 0x27 	, type: e_iABC },  // R1_Type = R[a], do HKS_OPCODE_SETUPVAL_R1
	{name: "HKS_OPCODE_SETUPVAL_R1" 					, opcode: 0x46 	, type: e_iABC },  // UpVals[b] = R1
	/*
		R1					= object_r1
		bx 	= UpVal(int(b))	= upval 
		
		upval	= object_r1
	*/
	
	{name: "HKS_OPCODE_ADD"						 		, opcode: 0x28 	, type: e_iABC },
	/*
	
	
	
	*/
	{name: "HKS_OPCODE_ADD_BK" 							, opcode: 0x29 	, type: e_iABC }, // no impl? fallback to HKS_OPCODE_ADD

	{name: "HKS_OPCODE_SUB" 							, opcode: 0x2a 	, type: e_iABC },
	/*
	
	
	
	*/
	{name: "HKS_OPCODE_SUB_BK" 							, opcode: 0x2b 	, type: e_iABC }, // no impl? fallback to HKS_OPCODE_SUB

	{name: "HKS_OPCODE_MUL" 							, opcode: 0x2c 	, type: e_iABC },
	/*
	
	
	
	*/
	{name: "HKS_OPCODE_MUL_BK" 							, opcode: 0x2d 	, type: e_iABC }, // no impl? fallback to HKS_OPCODE_MUL

	{name: "HKS_OPCODE_DIV" 							, opcode: 0x2e 	, type: e_iABC },
	/*
	
	
	
	*/
	{name: "HKS_OPCODE_DIV_BK" 							, opcode: 0x2f 	, type: e_iABC }, // no impl? fallback to HKS_OPCODE_DIV

	{name: "HKS_OPCODE_MOD" 							, opcode: 0x30 	, type: e_iABC },
	/*
	
	
	
	*/
	{name: "HKS_OPCODE_MOD_BK" 							, opcode: 0x31 	, type: e_iABC }, // no impl? fallback to HKS_OPCODE_MOD

	{name: "HKS_OPCODE_POW" 							, opcode: 0x32 	, type: e_iABC },
	/*
	
	
	
	*/
	{name: "HKS_OPCODE_POW_BK" 							, opcode: 0x33 	, type: e_iABC }, // no impl? fallback to HKS_OPCODE_POW

	{name: "HKS_OPCODE_NEWTABLE" 						, opcode: 0x34 	, type: e_iABC },
	/*
	
	
	
	*/

	{name: "HKS_OPCODE_UNM" 							, opcode: 0x35 	, type: e_iABC },
	/*
	
	
	
	*/
	
	{name: "HKS_OPCODE_NOT" 							, opcode: 0x36 	, type: e_iABC }, // R1_Type = R[b], do HKS_OPCODE_GETFIELD_R1
	{name: "HKS_OPCODE_NOT_R1" 							, opcode: 0x48 	, type: e_iABC },
	/*
	
	
	
	*/
	
	{name: "HKS_OPCODE_LE" 								, opcode: 0x37 	, type: e_iABC },
	/*
	
	
	
	*/

	{name: "HKS_OPCODE_LT" 								, opcode: 0x38 	, type: e_iABC },
	/*
	
	
	
	*/
	
	{name: "HKS_OPCODE_LT_BK" 							, opcode: 0x39 	, type: e_iABC }, // no impl? fallback to HKS_OPCODE_LT

	{name: "HKS_OPCODE_LE" 								, opcode: 0x3a 	, type: e_iABC },
	/*
	
	
	
	*/
	
	{name: "HKS_OPCODE_LE_BK" 							, opcode: 0x3b 	, type: e_iABC }, // no impl? fallback to HKS_OPCODE_LE
	
	{name: "HKS_OPCODE_CONCAT" 							, opcode: 0x3c 	, type: e_iABC },
	/*
	
	
	
	*/
	
	{name: "HKS_OPCODE_TESTSET" 						, opcode: 0x3d 	, type: e_iABC },
	/*
	
	
	
	*/
	
	{name: "HKS_OPCODE_SETLIST" 						, opcode: 0x40 	, type: e_iABC },
	/*
	
	
	
	*/

	{name: "HKS_OPCODE_CLOSE" 							, opcode: 0x41 	, type: e_iABC },
	/*
		Nope - im not even going to bother writing pseudocode here
		backed by: hks::closePendingUpvalues
	*/
	
	{name: "HKS_OPCODE_CLOSURE" 						, opcode: 0x42 	, type: e_iABx },
	/*
		a 	= R[a]				= dest  
		b 	= PROTO(R[b])		= closure
		
		dest = closure
		
		if (closure->m_method->num_upvals == 0)
			return
		
		for (i = 0; i < closure ->m_method->num_upvals; i ++)
			a->m_method->m_upvals[i] = 0
		
		for (var i = 0; i < closure ->m_method->num_upvals; i ++) {
			target = null
			
			if (nextInstruction a == 1) {
				target = luaState->pending;
				if (!target) goto notFound;
				while (luaPending->loc != &R[nextInstruction b])
				{
					luaPending = luaPending->m_next;
					if (!luaPending) goto notFound;
				}
					
			} else {
				notFound:
					target = new UpVal()
					target.loc.type = 0;
					target.loc.value = 0;
					target.loc = &R[nextInstruction b];
					target.m_next = luaState->pending;
					luaState->pending = target;
			}
		
			a->m_method->m_upvals[i] = target; // R[nextInstruction b] I think
			ip ++;
		}
	*/

	{name: "HKS_OPCODE_VARARG" 							, opcode: 0x43 	, type: e_iABC },
	/*
	
	
	
	*/


	{name: "HKS_OPCODE_NEWSTRUCT" 						, opcode: 0x4b 	, type: e_iABC },
	/*
		TODO: a - dest, b and/or c - array length iirc
	*/

	{name: "HKS_OPCODE_DATA" 							, opcode: 0x4c 	, type: e_iABx }, 
	/*
		These idiots decided that int32s aren't big enough so they use this instruction to merely provide additional information to the previous executed instruction 
		There may be more than one _OPCODE_DATA appended after the real instruction. the worst offender being SETSLOTMT [whatever that does]
		Implemented, as, uh, idfk? I'm 99.99% certain the VM loop either spins forever or these are just ignored.
		Assuming the compiler didn't fuck up, the handler of the real instruction increments the IP
	*/

	{name: "HKS_OPCODE_SETSLOTN" /* NULL??? */ 			, opcode: 0x4d 	, type: e_iABC },
	/*
		a 	= TSTRUCT(R[a])				= structure  
		b 	= int(b)					= encodedIndex
		c 	= RK(c)						= value 
	
		typeof(structure[encodedIndex]) = 0
	*/
	
	{name: "HKS_OPCODE_SETSLOTI" /* integer? */ 		, opcode: 0x4e 	, type: e_iABC },
	/*
		a 	= TSTRUCT(R[a])				= structure  
		b 	= int(b)					= encodedIndex
		c 	= RK(c)						= value 
	
		structure[encodedIndex] = value 
		backed by: ks::StructInst::setHksObjectPosOffset<1>
	*/
	
	{name: "HKS_OPCODE_SETSLOT"  /* auto? */			, opcode: 0x4f 	, type: e_iABC },
	/*
		a 	= TSTRUCT(R[a])				= structure  
		b 	= int(b)					= encodedIndex
		c 	= RK(c)						= value 
		ab 	= int(nextInstruction b)	= [result/slot?] type 
	
		if (result type != typeof(value)) throwTypeError 
		structure[encodedIndex] =  value 
		backed by: hks::StructInst::setHksObjectPosOffset
	*/
	
	{name: "HKS_OPCODE_SETSLOTMT" 						, opcode: 0x51 	, type: e_iABC },
	/*
	
	
	
	*/
	
	{name: "HKS_OPCODE_SETSLOTS" 						, opcode: 0x50 	, type: e_iABC }, // 
	// (R[a])[b as encodedIndex] = RK[c] - where RK[c] is VRELOCABLE
	// additional OP_DATA - a = ???, b = m_protoIndex

	{name: "HKS_OPCODE_CHECKTYPE" 						, opcode: 0x52 	, type: e_iABx }, 
	/* 
		a 	= R[a]			= object  
		b 	= int(b)		= type 
		if (typeof(object != int(b) as HksObjectType) throwTypeError 
		// do nothing?
	*/
	
	{name: "HKS_OPCODE_CHECKTYPE_D" 					, opcode: 0x59 	, type: e_iABx }, //
	/*
		b = TSTRUCT(R[b])				= target
		ab 	= R(nextInstruction b)		= "a non nil value" 
		ac 	= int(nextInstruction c)	= encodedIndex?
		
		if (typeof(R[b]) != typeof(TSTRUCT))
		{
			ip--;
			*(WORD*)ip =  0x98000000;          // HKS_OPCODE_GETTABL
			*(WORD*)ip =  0x98000000;          // this is just a no-op since we have data at ip + 1... i think
			return;
		}
		
		R1 = ab
		
		ip++;
	
		????????????????????????
		
		 if could be wrong but, i think this just checks the presence of a type id and/or type ptr
		 on failure, the response of gettable_event_outofline_struct is thrown into RA object
         idfk		 
	*/
	{name: "HKS_OPCODE_CHECKTYPES" 						, opcode: 0x53 	, type: e_iABx }, // v16->m_global->m_protoList.m_protoList[B], A = TSTRUCT??? so perhaps  
																						  // if (envrionmentOf(R[a] != indexOfProtoype(B) as HashTable) throwTypeError 

	{name: "HKS_OPCODE_GETSLOT" 						, opcode: 0x54 	, type: e_iABC }, // a = register, b = m_info of struct (likely register), c = slotPosIndex
	{name: "HKS_OPCODE_GETSLOT_D" 						, opcode: 0x5a 	, type: e_iABC },
	/*
	
	
	
	*/
	{name: "HKS_OPCODE_GETSLOTMT" 						, opcode: 0x55 	, type: e_iABC },
	/*
	
	
	
	*/

	{name: "HKS_OPCODE_SELFSLOT" 						, opcode: 0x56 	, type: e_iABC },
	/*
		a = R[a]	= out
		b = R[b]	= object 
		c = int(a)	= encodedIndex
	
		R[a + 1]	= object
		R[a] 		= object[encodedIndex] TODO: i think? idfk
	
	*/
	
	{name: "HKS_OPCODE_SELFSLOTMT" 						, opcode: 0x57 	, type: e_iABC },
	/*
	
	
	
	*/

	{name: "HKS_OPCODE_SETFIELD" 						, opcode: 0xf 	, type: e_iABC }, // R1_Type = R[a], do HKS_OPCODE_SETFIELD_R1
	{name: "HKS_OPCODE_SETFIELD_R1" 					, opcode: 0x4a 	, type: e_iABC },
	/*
	
		b = K[b]	= key?
		c = RK[c]	= value?
	
		backed by hks::HashTable::insertString,  hks::StructInst::insertString
	*/
	
	{name: "HKS_OPCODE_GETFIELD" 						, opcode: 0x0 	, type: e_iABC }, // R1_Type = R[b], do HKS_OPCODE_GETFIELD_R1
	{name: "HKS_OPCODE_GETFIELD_R1" 					, opcode: 0x49 	, type: e_iABC },
	/*
		
		R1_Type	 = target		= target
		c		 = K[c]			= constant (string?)
		
		
		R[a] = R1_Type = target[c]
	
	*/
	{name: "HKS_OPCODE_GETFIELD_MM" 					, opcode: 0x58 	, type: e_iABC },
	/*
		STRUCT INTERNAL IMPL:
	
		b = R[b]	= target
		c = int(c)	= unk
		
		unk * 2
		if (target.type == TTABLE)
		{
			
			return;
		}
		if (target.type == TSTRUCT)
		{
			HksObject ah;
			hks::StructInst::getByString(target, &ah, unk)
			R1 = ah
			
		}
		
		R[???] = R1 
		
		nextIP += 2; // ??? i thought there was just one data? or...? AHHh
	
	*/

	{name: "HKS_OPCODE_SETGLOBAL" 						, opcode: 0x1b 	, type: e_iABx },
	/*
		a	= R[a]			= object
		bx 	= constant(b)	= constant 
		
		Global[bx] = object	
	*/

	{name: "HKS_OPCODE_GETGLOBAL" 						, opcode: 0x6 	, type: e_iABx },
	/*
		a	= R[a]			= object
		bx 	= constant(b)	= constant 
		
		object = Global[bx]
	*/
	
	{name: "HKS_OPCODE_GETGLOBAL_MEM" /*_memorization?*/ , opcode: 0x5b 	, type: e_iABx }  // cached get global. i think we can just treat this like get global for now :tm:
];