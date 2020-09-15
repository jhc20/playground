/**
*	@filename	MuleLogger.js
*	@author		kolton
*	@modified 	jhc20
*	@desc		Log items and perm configurable accounts/characters
*/

var MuleLogger = {
	LogAccounts: {
		/* Format:
			"profileName": {
				"account1/password1/realm": ["charname1", "charname2 etc"],
				"account2/password2/realm": ["charnameX", "charnameY etc"],
				"account3/password3/realm": ["all"]
			}

			To log a full account, put "account/password/realm": ["all"]

			realm = useast, uswest, europe or asia

			Individual entries are separated with a comma.
		*/
		
		"logging": {
			"account/password/realm": ["all"]
		},
		
		"west-log": {
			"account/password/uswest": ["all"]
		},
		
		"euro-log": {
			"account/password/europe": ["all"]
		}
	},
	
	LogToiDB:		false,			// Log to iDB
	LogToShop:		false,			// ShopDrop logging
	SendToSite: 	false,			// Site logging
	LogToD2Bot:		true,			// Log to d2bot item viewer
	LogGame:		["", ""],		// ["gamename", "password"] empty for random
	LogNames:		true,			// Put account/character name on the picture
	LogItemLevel:	true,			// Add item level to the picture
	LogEquipped:	true,			// include equipped items
	LogMerc:		true,			// include items merc has equipped (if alive)
	SaveScreenShot:	false,			// Save pictures in jpg format (saved in 'Images' folder)
	IngameTime:		rand(180, 210),	// (180, 210) to avoid RD, increase it to (7230, 7290) for mule perming

	// don't edit
	getItemDesc: function (unit, logIlvl) {
		var i, desc, index,
			stringColor = "";

		logIlvl = true;

		desc = unit.description.split("\n");

		// Lines are normally in reverse. Add color tags if needed and reverse order.
		for (i = 0; i < desc.length; i += 1) {
			if (desc[i].indexOf(getLocaleString(3331)) > -1) { // Remove sell value
				desc.splice(i, 1);

				i -= 1;
			} else {
				// Add color info
				if (!desc[i].match(/^(y|ÿ)c/)) {
					desc[i] = stringColor + desc[i];
				}

				// Find and store new color info
				index = desc[i].lastIndexOf("ÿc");

				if (index > -1) {
					stringColor = desc[i].substring(index, index + "ÿ".length + 2);
				}
			}

			desc[i] = desc[i].replace(/(y|ÿ)c([0-9!"+<:;.*])/g, "\\xffc$2").replace("ÿ", "\\xff", "g");
		}

		if (logIlvl && desc[desc.length - 1]) {
			desc[desc.length - 1] = desc[desc.length - 1].trim() + " (" + unit.ilvl + ")";
		}

		desc = desc.reverse().join("\\n");

		return desc;
	},

	inGameCheck: function () {
		var tick;
		
		if (getScript("D2BotMuleLog.dbj") && me.gamepassword !== "") {
			print("ÿc4MuleLoggerÿc0: Logging items on " + me.account + " - " + me.name + ".");
			D2Bot.printToConsole("MuleLogger: Logging items on " + me.account + " - " + me.name + ".", 7);
			this.logChar();
			tick = getTickCount() + rand(1500, 1750) * 1000; // trigger anti-idle every ~30 minutes

			while ((getTickCount() - me.gamestarttime) < this.IngameTime * 1000) {
				me.overhead("ÿc2Log items done. ÿc4Stay in " + "ÿc4game more:ÿc0 " + Math.floor(this.IngameTime - (getTickCount() - me.gamestarttime) / 1000) + " sec");

				delay(1000);

				if ((getTickCount() - tick) > 0) {
					sendPacket(1, 0x40); // quest status refresh, working as anti-idle
					tick += rand(1500, 1750) * 1000;
				}
			}

			quit();

			return true;
		}

		return false;
	},

	load: function (hash) {
		var filename = "data/secure/" + hash + ".txt";

		if (!FileTools.exists(filename)) {
            throw new Error("File " + filename + " does not exist!");
		}

        return FileTools.readText(filename);
	},

	save: function (hash, data) {
		var filename = "data/secure/" + hash + ".txt";
		FileTools.writeText(filename, data);
	},

	// Log kept item stats in the manager.
	logItem: function (unit, logIlvl, isMercItem) {
		if (!isIncluded("common/misc.js")) {
			include("common/misc.js");
		}

		if (logIlvl === undefined) {
			logIlvl = this.LogItemLevel;
		}

		var i, code, desc, sock,
			header = "",
			color = -1,
			name = unit.itemType + "_" + unit.fname.split("\n").reverse().join(" ").replace(/(y|ÿ)c[0-9!"+<:;.*]|\/|\\/g, "").trim();

		var unitId = typeof isMercItem !== 'undefined' ? "" : unit.gid + ":" + unit.classid + ":" + unit.location + ":" + unit.x + ":" + unit.y;		
		desc = this.getItemDesc(unit, logIlvl) + "$" + unitId + (unit.getFlag(0x400000) ? ":eth" : "");
		color = unit.getColor();

		switch (unit.quality) {
		case 5: // Set
			switch (unit.classid) {
			case 27: // Angelic sabre
				code = "inv9sbu";

				break;
			case 74: // Arctic short war bow
				code = "invswbu";

				break;
			case 308: // Berserker's helm
				code = "invhlmu";

				break;
			case 330: // Civerb's large shield
				code = "invlrgu";

				break;
			case 31: // Cleglaw's long sword
			case 227: // Szabi's cryptic sword
				code = "invlsdu";

				break;
			case 329: // Cleglaw's small shield
				code = "invsmlu";

				break;
			case 328: // Hsaru's buckler
				code = "invbucu";

				break;
			case 306: // Infernal cap / Sander's cap
				code = "invcapu";

				break;
			case 30: // Isenhart's broad sword
				code = "invbsdu";

				break;
			case 309: // Isenhart's full helm
				code = "invfhlu";

				break;
			case 333: // Isenhart's gothic shield
				code = "invgtsu";

				break;
			case 326: // Milabrega's ancient armor
			case 442: // Immortal King's sacred armor
				code = "invaaru";

				break;
			case 331: // Milabrega's kite shield
				code = "invkitu";

				break;
			case 332: // Sigon's tower shield
				code = "invtowu";

				break;
			case 325: // Tancred's full plate mail
				code = "invfulu";

				break;
			case 3: // Tancred's military pick
				code = "invmpiu";

				break;
			case 113: // Aldur's jagged star
				code = "invmstu";

				break;
			case 234: // Bul-Kathos' colossus blade
				code = "invgsdu";

				break;
			case 372: // Grizwold's ornate plate
				code = "invxaru";

				break;
			case 366: // Heaven's cuirass
			case 215: // Heaven's reinforced mace
			case 449: // Heaven's ward
			case 426: // Heaven's spired helm
				code = "inv" + unit.code + "s";

				break;
			case 357: // Hwanin's grand crown
				code = "invxrnu";

				break;
			case 195: // Nalya's scissors suwayyah
				code = "invskru";

				break;
			case 395: // Nalya's grim helm
			case 465: // Trang-Oul's bone visage
				code = "invbhmu";

				break;
			case 261: // Naj's elder staff
				code = "invcstu";

				break;
			case 375: // Orphan's round shield
				code = "invxmlu";

				break;
			case 12: // Sander's bone wand
				code = "invbwnu";

				break;
			}

			break;
		case 7: // Unique
			for (i = 0; i < 401; i += 1) {
				if (unit.code === getBaseStat(17, i, 4).trim() && unit.fname.split("\n").reverse()[0].indexOf(getLocaleString(getBaseStat(17, i, 2))) > -1) {
					code = getBaseStat(17, i, "invfile");

					break;
				}
			}

			break;
		}

		if (!code) {
			if (["ci2", "ci3"].indexOf(unit.code) > -1) { // Tiara/Diadem
				code = unit.code;
			} else {
				code = getBaseStat(0, unit.classid, 'normcode') || unit.code;
			}

			code = code.replace(" ", "");

			if ([10, 12, 58, 82, 83, 84].indexOf(unit.itemType) > -1) {
				code += (unit.gfx + 1);
			}
		}

		sock = unit.getItems();

		if (sock) {
			for (i = 0; i < sock.length; i += 1) {
				if (sock[i].itemType === 58) {
					desc += "\n\n";
					desc += this.getItemDesc(sock[i]);
				}
			}
		}

		return {
			itemColor: color,
			image: code,
			title: name,
			description: desc,
			header: header,
			sockets: Misc.getItemSockets(unit)
		};
	},

	logChar: function (logIlvl, logName, saveImg) {
		while (!me.gameReady) {
			delay(100);
		}
		
		if (getUnit(100)) {
			if (!isIncluded("common/Prototypes.js"))	include("common/Prototypes.js");
			if (!isIncluded("common/Storage.js"))		include("common/Storage.js");
			
			Storage.Init();
			
			if (!Storage.Inventory.CanFit(getUnit(100)) || !Storage.Inventory.MoveTo(getUnit(100))) {
				getUnit(100).drop();
			}
		}
		
		if (isIncluded("ItemDB.js")) {
			while(!ItemDB.init(false)) {
				delay(1000);
			}
		}

		logIlvl = true;

		if (logName === undefined) {
			logName = this.LogNames;
		}

		if (saveImg === undefined) {
			saveImg = this.SaveScreenShot;
		}

		var i, folder, string, parsedItem, merc,
			items = me.getItems(),
			realm = me.realm || "Single Player",
			finalString = "",
			trash = [
				80,  //Rancid Gas Potion
				81,  //Oil Potion
				82,  //Choking Gas Potion
				83,  //Exploding Potion
				84,  //Strangling Gas Potion
				85,  //Fulminating Potion
				513, //Stamina Potion
				514, //Antidote Potion
				515, //Rejuvination Potion
				516, //Full Rejuvination Potion
				517, //Thawing Potion
				518, //Tome Of Town Portal
				519, //Tome Of Identify
				521, //Horadric Amulet
				524, //Scroll Of Inifuss
				525, //Scroll Of Inifuss Identified
				529, //Scroll Of Town Portal
				530, //Scroll Of Identify
				545, //Potion Of Life (Alkor)
				546, //Jade Figurine
				547, //Golden Bird
				548, //Lamesen's Tome
				550, //Horadric Scroll
				551, //Mephisto's Soulstone
				553, //Khalim's Eye
				554, //Khalim's Heart
				555, //Khalim's Brain
				587, //Minor Healing Potion
				588, //Light Healing Potion
				589, //Healing Potion
				590, //Greater Healing Potion
				591, //Super Healing Potion
				592, //Minor Mana Potion
				593, //Light Mana Potion
				594, //Mana Potion
				595, //Greater Mana Potion
				596, //Super Healing Potion
				644, //Malah's Potion
				645, //Scroll Of Knowledge
				646  //Scroll Of Resistance				
			];

		if (!FileTools.exists("mules/" + realm)) {
			folder = dopen("mules");

			folder.create(realm);
		}

		if (!FileTools.exists("mules/" + realm + "/" + me.account)) {
			folder = dopen("mules/" + realm);

			folder.create(me.account);
		}
		
		for (i = 0; i < items.length; i++) {
			if (items[i].location == 2 || (trash.indexOf(items[i].classid) > -1 && items[i].quality == 2)) {
				items.splice(i, 1);
				i -= 1;
			}
		}
		
		function itemSort(a, b) {
			return b.itemType - a.itemType;
		}
		
		if (this.SendToSite && FileTools.exists("libs/D2SQL.js")) {
			if (!isIncluded("D2SQL.js")) include("D2SQL.js");
			D2SQL.logItems(items);
		}		

		if (items.length) items.sort(itemSort);

		for (i = 0; i < items.length; i += 1) {
			if ((this.LogEquipped || items[i].mode === 0) && (items[i].quality !== 2 || !Misc.skipItem(items[i].classid))) {
				parsedItem = this.logItem(items[i], logIlvl);

				// Log names to saved image
				if (logName) {
					parsedItem.header = (me.account || "Single Player") + " / " + me.name;
				}

				if (saveImg) {
					D2Bot.saveItem(parsedItem);
				}

				// Always put name on Char Viewer items
				if (!parsedItem.header) {
					parsedItem.header = (me.account || "Single Player") + " / " + me.name;
				}

				// Remove itemtype_ prefix from the name
				parsedItem.title = parsedItem.title.substr(parsedItem.title.indexOf("_") + 1);

				if (items[i].mode === 1) {
					parsedItem.title += " (equipped)";
				}

				string = JSON.stringify(parsedItem);
				finalString += (string + "\n");
			}
		}

		if (this.LogMerc) {
			for (i = 0; i < 3; i += 1) {
				merc = me.getMerc();

				if (merc) {
					break;
				}

				delay(50);
			}

			if (merc) {
				items = merc.getItems();

				for (i = 0; i < items.length; i += 1) {
					parsedItem = this.logItem(items[i], null, true);					
					parsedItem.title += " (merc)";
					
					if (!parsedItem.header) {
						parsedItem.header = (me.account || "Single Player") + " / " + me.name;
					}
				
					string = JSON.stringify(parsedItem);
					finalString += (string + "\n");

					if (this.SaveScreenShot) {
						D2Bot.saveItem(parsedItem);
					}
				}
			}
		}
		
		if (this.LogToShop && FileTools.exists("libs/ShopDrop.js")) {
			if (!isIncluded("ShopDrop.js")) include("ShopDrop.js");
			ShopDrop.logStocks();
		}
		
		if (this.LogToiDB) {
			var iDBDoneLogging,
				tick = getTickCount();
			
			addEventListener("scriptmsg", function (msg) {
				if (msg && typeof msg === "string" && msg === "iDBDoneLogging") {
					iDBDoneLogging = true;
				}
			});
			
			scriptBroadcast("iDBLog");
			
			while (!iDBDoneLogging && getTickCount() - tick < 10000) {
				delay(100);
			}
		}

		// hcl = hardcore class ladder
		// sen = softcore expan nonladder
		if (this.LogToD2Bot) {
			FileTools.writeText("mules/" + realm + "/" + me.account + "/" + me.name + "." + ( me.playertype ? "h" : "s" ) + (me.gametype ? "e" : "c" ) + ( me.ladder > 0 ? "l" : "n" ) + ".txt", finalString);
		}
		
		print("Item logging done.");
	}
};

if (FileTools.exists("libs/ItemDB.js") && !isIncluded("ItemDB.js")) {
	include("ItemDB.js");
}