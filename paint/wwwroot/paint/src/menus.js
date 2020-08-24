(()=> {

	const looksLikeChrome = !!(window.chrome && (chrome.loadTimes || chrome.csi));
	// NOTE: Microsoft Edge includes window.chrome.app
	// (also this browser detection logic could likely use some more nuance)
	
	window.menus = {
		"&File": [
			{
				item: "&New",
				shortcut: "Ctrl+Alt+N", // Ctrl+N opens a new browser window
				speech_recognition: [
					"new", "new file", "new document", "create new document", "create a new document", "start new document", "start a new document",
				],
				action: ()=> { file_new(); },
				description: "Creates a new document.",
			},
			{
				item: "&Open",
				shortcut: "Ctrl+O",
				speech_recognition: [
					"open", "open document", "open file", "open an image file", "open a document", "open a file",
					"load document", "load a document", "load an image file", "load an image",
					"show file picker", "show file chooser", "show file browser", "show finder",
					"browser for file", "browse for a file", "browse for an image", "browse for an image file",
				],
				action: ()=> { paint_file_open(); },
				description: "Opens an existing document.",
			},
			{
				item: "&Save",
				shortcut: "Ctrl+S",
				speech_recognition: [
					"save", "save document", "save file", "save image", "save picture", "save image file",
					// "save a document", "save a file", "save an image", "save an image file", // too "save as"-like
					"save the document", "save the file", "save the image", "save the image file",
				],
				action: ()=> { file_save_as(); },
				description: "Download a copy of your raw sketch",
			},
			MENU_DIVIDER,
			{
				item: "Proceed!",
				speech_recognition: [
					"save", "save document", "save file", "save image", "save picture", "save image file",
					// "save a document", "save a file", "save an image", "save an image file", // too "save as"-like
					"save the document", "save the file", "save the image", "save the image file",
				],
				action: ()=> { file_upload_as(); },
				description: "Sends your sketch to AI processing",
			},
		],
		"&Edit": [
			{
				item: "&Undo",
				shortcut: "Ctrl+Z",
				speech_recognition: [
					"undo", "undo that",
				],
				enabled: () => undos.length >= 1,
				action: ()=> { undo(); },
				description: "Undoes the last action.",
			},
			{
				item: "&Repeat",
				shortcut: "F4",
				speech_recognition: [
					"repeat", "redo",
				],
				enabled: () => redos.length >= 1,
				action: ()=> { redo(); },
				description: "Redoes the previously undone action.",
			},
			{
				item: "&History",
				shortcut: "Ctrl+Shift+Y",
				speech_recognition: [
					"show history", "history",
				],
				action: ()=> { show_document_history(); },
				description: "Shows the document history and lets you navigate to states not accessible with Undo or Repeat.",
			},
			MENU_DIVIDER,
			{
				item: "Cu&t",
				shortcut: "Ctrl+X",
				speech_recognition: [
					"cut", "cut selection", "cut selection to clipboard", "cut the selection", "cut the selection to clipboard", "cut the selection to the clipboard",
				],
				enabled: () =>
					// @TODO: support cutting text with this menu item as well (e.g. for the text tool)
					!!selection,
				action: ()=> {
					edit_cut(true);
				},
				description: "Cuts the selection and puts it on the Clipboard.",
			},
			{
				item: "&Copy",
				shortcut: "Ctrl+C",
				speech_recognition: [
					"copy", "copy selection", "copy selection to clipboard", "copy the selection", "copy the selection to clipboard", "copy the selection to the clipboard",
				],
				enabled: () =>
					// @TODO: support copying text with this menu item as well (e.g. for the text tool)
					!!selection,
				action: ()=> {
					edit_copy(true);
				},
				description: "Copies the selection and puts it on the Clipboard.",
			},
			{
				item: "&Paste",
				shortcut: "Ctrl+V",
				speech_recognition: [
					"paste", "paste from clipboard", "paste from the clipboard", "insert clipboard", "insert clipboard contents", "insert the contents of the clipboard", "paste what's on the clipboard",
				],
				enabled: () =>
					// @TODO: disable if nothing in clipboard or wrong type (if we can access that)
					true,
				action: ()=> {
					edit_paste(true);
				},
				description: "Inserts the contents of the Clipboard.",
			},
			{
				item: "C&lear Selection",
				shortcut: "Del",
				speech_recognition: [
					"delete", "clear selection", "delete selection", "delete selected", "delete selected area", "clear selected area", "erase selected", "erase selected area",
				],
				enabled: () => !!selection,
				action: ()=> { delete_selection(); },
				description: "Deletes the selection.",
			},
			{
				item: "Select &All",
				shortcut: "Ctrl+A",
				speech_recognition: [
					"select all", "select everything",
					"select the whole image", "select the whole picture", "select the whole drawing", "select the whole canvas", "select the whole document",
					"select the entire image", "select the entire picture", "select the entire drawing", "select the entire canvas", "select the entire document",
				],
				action: ()=> { select_all(); },
				description: "Selects everything.",
			},
			MENU_DIVIDER,
			{
				item: "C&opy To...",
				speech_recognition: [
					"copy to file", "copy selection to file", "copy selection to a file", "save selection", 
					"save selection as file", "save selection as image", "save selection as picture", "save selection as image file", "save selection as document",
					"save selection as a file", "save selection as a image", "save selection as a picture", "save selection as a image file", "save selection as a document",
					"save selection to file", "save selection to image", "save selection to picture", "save selection to image file", "save selection to document",
					"save selection to a file", "save selection to a image", "save selection to a picture", "save selection to a image file", "save selection to a document",
				],
				enabled: () => !!selection,
				action: ()=> { save_selection_to_file(); },
				description: "Copies the selection to a file.",
			},
			{
				item: "Paste &From...",
				speech_recognition: [
					"paste a file", "paste from a file", "insert a file", "insert an image file", 
				],
				action: ()=> { paste_from_file_select_dialog(); },
				description: "Pastes a file into the selection.",
			}
		],
		"&View": [
			{
				item: "&Tool Box",
				// shortcut: "Ctrl+T", // opens a new browser tab
				speech_recognition: [
					"toggle tool box", "toggle tools box", "toggle toolbox", "toggle tool palette", "toggle tools palette",
					// @TODO: hide/show
				],
				checkbox: {
					toggle: ()=> {
						$toolbox.toggle();
					},
					check: () => $toolbox.is(":visible"),
				},
				description: "Shows or hides the tool box.",
			},
			{
				item: "&Color Box",
				// shortcut: "Ctrl+L", // focuses browser address bar
				speech_recognition: [
					"toggle color box", "toggle colors box", "toggle palette", "toggle color palette", "toggle colors palette",
					// @TODO: hide/show
				],
				checkbox: {
					toggle: ()=> {
						$colorbox.toggle();
					},
					check: () => $colorbox.is(":visible"),
				},
				description: "Shows or hides the color box.",
			},
			{
				item: "&Status Bar",
				speech_recognition: [
					"toggle status bar", "toggle status text", "toggle status area", "toggle status indicator",
					// @TODO: hide/show
				],
				checkbox: {
					toggle: ()=> {
						$status_area.toggle();
					},
					check: () => $status_area.is(":visible"),
				},
				description: "Shows or hides the status bar.",
			},
			{
				item: "T&ext Toolbar",
				speech_recognition: [
					"toggle text toolbar", "toggle font toolbar", "toggle text tool bar", "toggle font tool bar",
					"toggle font box", "toggle fonts box", "toggle text options box", "toggle text tool options box", "toggle font options box",
					"toggle font window", "toggle fonts window", "toggle text options window", "toggle text tool options window", "toggle font options window",
					// @TODO: hide/show
				],
				enabled: false, // @TODO: toggle fonts box
				checkbox: {},
				description: "Shows or hides the text toolbar.",
			},
			MENU_DIVIDER,
			{
				item: "&Zoom",
				submenu: [
					{
						item: "&Normal Size",
						// shortcut: "Ctrl+PgUp", // cycles thru browser tabs
						speech_recognition: [
							"reset zoom", "zoom to normal size",
							"zoom to 100%", "set zoom to 100%", "set zoom 100%",
							"zoom to 1x", "set zoom to 1x", "set zoom 1x",
							"zoom level to 100%", "set zoom level to 100%", "set zoom level 100%",
							"zoom level to 1x", "set zoom level to 1x", "set zoom level 1x",
						],
						description: "Zooms the picture to 100%.",
						enabled: () => magnification !== 1,
						action: ()=> {
							set_magnification(1);
						},
					},
					{
						item: "&Large Size",
						// shortcut: "Ctrl+PgDn", // cycles thru browser tabs
						speech_recognition: [
							"zoom to large size",
							"zoom to 400%", "set zoom to 400%", "set zoom 400%",
							"zoom to 4x", "set zoom to 4x", "set zoom 4x",
							"zoom level to 400%", "set zoom level to 400%", "set zoom level 400%",
							"zoom level to 4x", "set zoom level to 4x", "set zoom level 4x",
						],
						description: "Zooms the picture to 400%.",
						enabled: () => magnification !== 4,
						action: ()=> {
							set_magnification(4);
						},
					},
					{
						item: "Zoom To &Window",
						speech_recognition: [
							"zoom to window", "zoom to view",
							"zoom to fit",
							"zoom to fit within window", "zoom to fit within view",
							"zoom to fit within the window", "zoom to fit within the view",
							"zoom to fit in window", "zoom to fit in view",
							"zoom to fit in the window", "zoom to fit in the view",
							"auto zoom", "fit zoom",
							"zoom to max", "zoom to maximum", "zoom to max size", "zoom to maximum size",
							"zoom so canvas fits", "zoom so picture fits", "zoom so image fits", "zoom so document fits",
							"zoom so whole canvas is visible", "zoom so whole picture is visible", "zoom so whole image is visible", "zoom so whole document is visible",
							"zoom so the whole canvas is visible", "zoom so the whole picture is visible", "zoom so the whole image is visible", "zoom so the whole document is visible",
							
							"fit to window", "fit to view", "fit in window", "fit in view", "fit within window", "fit within view",
							"fit picture to window", "fit picture to view", "fit picture in window", "fit picture in view", "fit picture within window", "fit picture within view",
							"fit image to window", "fit image to view", "fit image in window", "fit image in view", "fit image within window", "fit image within view",
							"fit canvas to window", "fit canvas to view", "fit canvas in window", "fit canvas in view", "fit canvas within window", "fit canvas within view",
							"fit document to window", "fit document to view", "fit document in window", "fit document in view", "fit document within window", "fit document within view",
						],
						description: "Zooms the picture to fit within the view.",
						action: ()=> {
							const rect = $canvas_area[0].getBoundingClientRect();
							const margin = 30; // leave a margin so scrollbars won't appear
							let mag = Math.min(
								(rect.width - margin) / canvas.width,
								(rect.height - margin) / canvas.height,
							);
							// round to an integer percent for the View > Zoom > Custom... dialog, which shows non-integers as invalid
							mag = Math.floor(100 * mag) / 100;
							set_magnification(mag);
						},
					},
					{
						item: "C&ustom...",
						description: "Zooms the picture.",
						speech_recognition: [
							"zoom custom", "custom zoom", "set custom zoom", "set custom zoom level", "zoom to custom level", "zoom to custom", "zoom level", "set zoom level",
						],
						action: ()=> { show_custom_zoom_window(); },
					},
					MENU_DIVIDER,
					{
						item: "Show &Grid",
						shortcut: "Ctrl+G",
						speech_recognition: [
							"toggle show grid",
							"toggle grid", "toggle gridlines", "toggle grid lines", "toggle grid cells",
							// @TODO: hide/show
						],
						enabled: () => magnification >= 4,
						checkbox: {
							toggle: toggle_grid,
							check: () => show_grid,
						},
						description: "Shows or hides the grid.",
					},
					{
						item: "Show T&humbnail",
						speech_recognition: [
							"toggle show thumbnail",
							"toggle thumbnail", "toggle thumbnail view", "toggle thumbnail box", "toggle thumbnail window",
							"toggle preview", "toggle image preview", "toggle picture preview",
							"toggle picture in picture", "toggle picture in picture view", "toggle picture in picture box", "toggle picture in picture window",
							// @TODO: hide/show
						],
						enabled: false, // @TODO: implement Show Thumbnail
						checkbox: {},
						description: "Shows or hides the thumbnail view of the picture.",
					}
				]
			},
			{
				item: "&View Bitmap",
				shortcut: "Ctrl+F",
				speech_recognition: [
					"view bitmap", "show bitmap",
					"fullscreen", "full-screen", "full screen",
					"show picture fullscreen", "show picture full-screen", "show picture full screen",
					"show image fullscreen", "show image full-screen", "show image full screen",
					// @TODO: exit fullscreen
				],
				action: ()=> { view_bitmap(); },
				description: "Displays the entire picture.",
			}
		],
		"&Image": [
			// @TODO: speech recognition: terms that apply to selection
			{
				item: "&Flip/Rotate",
				// shortcut: "Ctrl+R", // reloads browser tab
				speech_recognition: [
					"flip",
					"rotate",
					"flip/rotate", "flip slash rotate", "flip and rotate", "flip or rotate", "flip rotate",
					// @TODO: parameters to command
				],
				action: ()=> { image_flip_and_rotate(); },
				description: "Flips or rotates the picture or a selection.",
			},
			{
				item: "&Stretch/Skew",
				// shortcut: "Ctrl+W", // closes browser tab
				speech_recognition: [
					"stretch", "scale", "resize image",
					"skew",
					"stretch/skew", "stretch slash skew", "stretch and skew", "stretch or skew", "stretch skew",
					// @TODO: parameters to command
				],
				action: ()=> { image_stretch_and_skew(); },
				description: "Stretches or skews the picture or a selection.",
			},
			{
				item: "&Clear Image",
				shortcut: looksLikeChrome ? undefined : "Ctrl+Shift+N", // opens incognito window in chrome
				speech_recognition: [
					"clear image", "clear canvas", "clear picture", "clear page", "clear drawing",
					// @TODO: erase?
				],
				// (mspaint says "Ctrl+Shft+N")
				action: ()=> { !selection && clear(); },
				enabled: ()=> !selection,
				description: "Clears the picture.",
				// action: ()=> {
				// 	if (selection) {
				// 		delete_selection();
				// 	} else {
				// 		clear();
				// 	}
				// },
				// mspaint says "Clears the picture or selection.", but grays out the option when there's a selection
			}
		],
		"E&xtras": [
			{
				item: "&Render History As GIF",
				shortcut: "Ctrl+Shift+G",
				speech_recognition: [
					// @TODO: animated gif, blah
					"render history as gif", "render history as a gif", "render history animation", "make history animation", "make animation of history", "make animation of document history", "make animation from document history",
					"render a gif from the history", "render a gif animation from the history", "render an animation from the history",
					"make a gif from the history", "make a gif animation from the history", "make an animation from the history",
					"create a gif from the history", "create a gif animation from the history", "create an animation from the history",
					// aaaaaaaaaaaaaaaaaaaaaaaaaa *exponentially explodes*
					"make a gif", "make a gif of the history", "make a gif of the document history", "make a gif from the document history",
					"create a gif", "create a gif of the history", "create a gif of the document history", "create a gif from the document history",
					"make gif", "make gif of the history", "make gif of the document history", "make gif from the document history",
					"create gif", "create gif of the history", "create gif of the document history", "create gif from the document history",
					"make an animation", "make an animation of the history", "make an animation of the document history", "make an animation from the document history",
					"create an animation", "create an animation of the history", "create an animation of the document history", "create an animation from the document history",
					"make animation", "make animation of the history", "make animation of the document history", "make animation from the document history",
					"create animation", "create animation of the history", "create animation of the document history", "create animation from the document history",
				],
				action: ()=> { render_history_as_gif(); },
				description: "Creates an animation from the document history.",
			}
			// {
			// 	item: "Render History as &APNG",
			// 	// shortcut: "Ctrl+Shift+A",
			// 	action: ()=> { render_history_as_apng(); },
			// 	description: "Creates an animation from the document history.",
			// },
			// MENU_DIVIDER,
			// {
			// 	item: "Extra T&ool Box",
			// 	checkbox: {
			// 		toggle: ()=> {
			// 			// this doesn't really work well at all to have two toolboxes
			// 			// (this was not the original plan either)
			// 			$toolbox2.toggle();
			// 		},
			// 		check: ()=> {
			// 			return $toolbox2.is(":visible");
			// 		},
			// 	},
			// 	description: "Shows or hides an extra tool box.",
			// },
			// {
			// 	item: "&Preferences",
			// 	action: ()=> {
			// 		// :)
			// 	},
			// 	description: "Configures JS Paint.",
			// }
			/*{
				item: "&Draw Randomly",
				speech_recognition: [
					"draw randomly", "draw pseudorandomly", "draw wildly", "make random art",
				],
				checkbox: {
					toggle: ()=> {
						if (window.simulatingGestures) {
							stopSimulatingGestures();
						} else {
							simulateRandomGesturesPeriodically();
						}
					},
					check: ()=> {
						return window.simulatingGestures;
					},
				},
				description: "Draws randomly with different tools.",
			},*/
		],
	};
	
	for (const [top_level_menu_key, menu] of Object.entries(menus)) {
		const top_level_menu_name = top_level_menu_key.replace(/&/, "");
		const add_literal_navigation_speech_recognition = (menu, ancestor_names)=> {
			for (const menu_item of menu) {
				if (menu_item !== MENU_DIVIDER) {
					const menu_item_name = menu_item.item.replace(/&|\.\.\.|\(|\)/g, "");
					// console.log(menu_item_name);
					let menu_item_matchers = [menu_item_name];
					if (menu_item_name.match(/\//)) {
						menu_item_matchers = [
							menu_item_name,
							menu_item_name.replace(/\//, " "),
							menu_item_name.replace(/\//, " and "),
							menu_item_name.replace(/\//, " or "),
							menu_item_name.replace(/\//, " slash "),
						];
					}
					menu_item_matchers = menu_item_matchers.map((menu_item_matcher)=> {
						return `${ancestor_names} ${menu_item_matcher}`;
					});
					menu_item.speech_recognition = (menu_item.speech_recognition || []).concat(menu_item_matchers);
					// console.log(menu_item_matchers, menu_item.speech_recognition);
	
					if (menu_item.submenu) {
						add_literal_navigation_speech_recognition(menu_item.submenu, `${ancestor_names} ${menu_item_name}`);
					}
				}
			}
		};
		add_literal_navigation_speech_recognition(menu, top_level_menu_name);
	}
	
	})();
	