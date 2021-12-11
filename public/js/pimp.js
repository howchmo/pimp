$(document).ready(start());

var dirty = false;

var items = {};

function pruneBlock(id)
{
	console.log("pruneBock("+id+")");
	var parentId = items[id]["parent"];
	var openlink = $("#"+parentId).find("a[item="+"#"+id+"]")[0];
	var children = items[parentId]["children"];
	pruneBlocks(id);
	// check to see if the parent is empty to the right
	// if so, move everything to the left down and delete
	// the empty row above
	if( children.length > 0 )
	{
		var table = document.getElementsByTagName("table")[0];
		var cell = $("#"+parentId).parent()[0];
		var row = cell.parentNode;
		var x = cell.cellIndex;
		var y = row.rowIndex;
		if( !rowToRightIsNotEmpty(x, y) )
		{
			var newX = x;
			while( newX >= 0 )
			{
				table.rows[y+1].cells[newX].innerHTML = table.rows[y].cells[newX].innerHTML;
				newX--;
			}
			table.deleteRow(y);
		}
	}
	// TASK: re-establish the onclick functions
	$(openlink).html("▶")
}

function pruneBlocks(id)
{
	var parentId = items[id]["parent"];
	var children = items[parentId]["children"];
	// recursively traverse the tree
	// until you get to a leaf then
	// delete all the leaves
	for( var i=items[id]["children"].length; i > 0; i-- )
	{
		var child = (items[id]["children"])[i-1];
		pruneBlocks(child);
	}
	deleteCellById(id);
	// remove this as a child from its parent
	// remove the item itself from the index
	delete items[id];
	var idx = children.indexOf(id);
	children.splice(idx,1);
}

function deleteCellById( id )
{
	var table = document.getElementsByTagName("table")[0];
	var cell = $("#"+id).parent()[0];
	var row = cell.parentNode;
	var x = cell.cellIndex;
	var y = row.rowIndex;
	var leftCell = getTableCell((x-1),y).firstChild;
	if( leftCell == null )
		table.deleteRow(y);
	else
		if( leftCell.id == items[id]["parent"] )
			row.deleteCell(x);
}

function createNewItem( e, data )
{
	var newId = $(e.target).attr("item").substr(1);	
	var $item = $(e.target).parents(".item");
	var id = $item.attr("id");
	if( !items[id]["children"].includes(newId) )
	{
		var $cell = $item.parent();
		var $table = $("#table-items");
		var x = $cell.index();
		var y = $cell.parent().index();
		var newx = x+1;
		var newy = y;
		if(items[id].children.length > 0 )
		{
			var lastChildId = items[id].children[items[id].children.length-1];
			while( $table[0].rows[newy].cells[newx].children[0].getAttribute('id') != lastChildId )
			{
				newy++;
				// Handle the case of blanks
				while( $table[0].rows[newy].cells[newx].children.length == 0 )
					newy++;
			}
			newy++;;

			while( rowToRightIsNotEmpty(newx, newy ) )
			{
				newy++;
			}
		}
		var newCell = null;
		if( y < newy && rowToLeftIsNotEmpty(newx, newy) )
		{
			var newRow = $table[0].insertRow(newy);
			for( var i=0; i<newx; i++ )
			{
				newRow.insertCell(i);
			}
			newCell = newRow.insertCell(newx);
	
			for( var i=newx+1; i<document.getElementsByTagName("table")[0].rows[y].length; i++ )
				newRow.insertCell(i);
		}
		else
		{
			newCell = getTableCell(newx, newy);
		}
	
		var $newItem = makeItem(newId);
		$(newCell).append($newItem);
		populate(data);
		items[id]["children"].push(newId);
		items[newId] = {"children":[],"parent":id};
	}
}

function blockClickedEffect( clickedBlock )
{
	$(clickedBlock).html("&#8987;"); // HOURGLASS
}

function onBlockClick( e )
{
	if( $(e.target).html() === "▶" )
	{
		console.log("CLICK");
		blockClickedEffect($(e.target));
		var newId = $(e.target).attr("item").substr(1);	
		$.get("pimp/"+newId, function(data) {
			createNewItem( e, data );
			$(e.target).html("&#9501;");// LINKED OUT
		});
	}
}

function getTableCell( x, y )
{
	var table = document.getElementsByTagName("table")[0];
	if( table.rows[y] == undefined ) 
	{
		table.insertRow(y);
		for( var i=0; i<x; i++ )
			table.rows[y].insertCell(i);
	}
	if( table.rows[y].cells[x] == undefined )
	{
		if( table.rows[y].cells.length < x )
		{
			for( var i=table.rows[y].cells.length; i<x; i++ )
			{
				table.rows[y].insertCell(i);
			}
		}
		table.rows[y].insertCell(x);
	}
	return table.rows[y].cells[x];
}

function rowToRightIsNotEmpty( x, y )
{
	var table = document.getElementsByTagName("table")[0];
	if( table.rows[y] != undefined )
	{
		for( var i=x+1; i < table.rows[y].cells.length; i++ )
		{
			if( document.getElementsByTagName("table")[0].rows[y].cells[i].innerHTML != "" )
			{
				return true;
			}
		}
	}
	return false;
}

function rowToLeftIsNotEmpty( x, y )
{
	var table = document.getElementsByTagName("table")[0];
	if( table.rows[y] != undefined )
	{
		for( var i=table.rows[y].cells.length; i>1; i-- )
		{
			if( document.getElementsByTagName("table")[0].rows[y].cells[i-1].innerHTML != "" )
			{
				return true;
			}
		}
	}
	return false;
}

var icons = {
	"+":"<div class='checkbox checked'><input type='checkbox' checked onclick='checkBox(this); return false;'></input></div>",
	"-":"<div class='checkbox unchecked'><input type='checkbox' onclick='checkBox(this); return false;'></input></div>",
	"%":"<span class='clock-icon bullet'>&#128338;</span>",
	"!":"<span class='idea-icon bullet'>&#128161;</span>",
	"?":"<span class='question-icon bullet'>&#10068;</span>"
};

function makeItem(id)
{
	var $item = $('<div/>', {'class':'item', 'id':id});
	var $itemHeader = $('<div/>', {'class':'item-header'});
	var $itemTitle = $('<span/>', {'class':'item-title', 'contenteditable':'true', 'html':'&nbsp;'});
	var $headerButtonContainer = $('<div/>', {'class':'title-button-container'});
	var $printButton = $('<span/>', {'class':'title-button','text':'>'});
	var $expandButton = $('<span/>', {'class':'title-button','text':'^'});
	var $closeButton = $('<span/>', {'class':'title-button problem-button','text':'X'});
	var $itemBorn = $('<div/>', {'class':'item-born'});
	var $itemContentWrapper = $('<div/>', {'class':'item-content-wrapper'});
	var $itemBlocksTable = $('<table/>', {'class':'item-blocks-table'});
	var $itemBlocksTableBody = $('<tbody/>', {'class':'item-blocks-table-body'});
	var $leftColumn = $('<div/>', {'class':'left-column'});
	
	$itemHeader.append($itemTitle);
	$closeButton.click(function() {
		pruneBlock(id);
	});
	$printButton.click(function() {
		window.open("print.html#"+id);
	});
	$expandButton.click(function() {
		window.open("index.html#"+id);
	});
	$headerButtonContainer.append($closeButton);
	$headerButtonContainer.append($expandButton);
	$headerButtonContainer.append($printButton);
	$itemHeader.append($headerButtonContainer);
	$itemHeader.append($itemBorn);
	$item.append($itemHeader);
	$itemBlocksTable.append($itemBlocksTableBody);
	$itemContentWrapper.append($itemBlocksTable);
	$item.append($itemContentWrapper);
	// $item.append($leftColumn);
	
	return $item;
}

function getLink( block )
{
	var str = block.text = block.source;
	// is the source for the note a Markdown link?
	if( str.startsWith("[") )
	{
		var n = str.lastIndexOf("](");
		var link = str.substring(n+2, str.length-1);
		if( link.startsWith("#") )
		{
			block.link = "<div class=\"icon-link\"><a href=\"#\" item=\""+link+"\" onclick=\"onBlockClick(event);\">&#9654;</a></div>";
			block.text = str.substring(1, n);
		}
		// if( link.startsWith("http://") || link.startsWith("https://") )
		else
		{
			block.icon = '<div class="icon-link"><a href="#" onclick="window.open(\''+link+'\')">&#9654;</a></div>';
		}
	}
	// is it just a link (copy and pasted during research for example)
	else if( str.startsWith("http://") || str.startsWith("https://") )
	{
		block.icon = '<div class="icon-link"><a href="#" onclick="window.open(\''+str+'\')">&#9654;</a></div>';
	}
	// if it isn't link but it is not empty make it a button
	// that will generate a new item linked to that block
	else if( str.length > 0 )
		block.link = "<div class=\"icon-link\"><a onclick=\"createLinkedItem( $(this) );\">&#9608;</a></div>";
	// else pad it with blanks so the column at least shows up
	else
	{
		block.link="<div class='icon-link'>&nbsp;</div>";
		block.datetime=undefined;
	}
	return block;
}

function getIcon( block )
{
	if( block.text[1] == " " )
	{
		var icon = icons[block.text[0]];
		if( icon != null )
		{
			block.icon = icon;
			block.text = block.text.substring(2, block.text.length);
		}
	}
	return block;
}

function getHtml( block )
{
	block.html = mmd( block.text );
	return block;
}

function deriveBlockData( block )
{
	return getHtml(getIcon(getLink(block)));
}

function renderBlock( t, block )
{
	t.children(".block-tags").html(block.tags);
	t.children(".block-icon").html(block.icon);
	t.children(".block-note").html(block.html);

	var datetimeHtml = "";
	if( block.datetime != undefined )
		datetimeHtml = generateDatetimeHtml(new Date(block.datetime));
	t.children(".block-datetime").html(datetimeHtml);

	t.children(".block-link").html(block.link);
	t.attr("block-data", JSON.stringify(block));
	return t;
}

function makeBlock()
{
	var $newBlock = $('<tr/>', {'class':'block'});
	var $newTags = $('<td/>', {'class':'block-tags', 'contenteditable':true});
	var $newIcon = $('<td/>', {'class':'block-icon'});
	var $newNote = $('<td/>', {'class':'block-note', 'contenteditable':true});
	var $newDateTime = $('<td/>', {'class':'block-datetime'});
	var $newLinkBlock = $('<td/>', {'class':'block-link'});

	$newNote.focus(function()
	{
		var block = JSON.parse($(this).parent().attr("block-data"));
		$(this).text(block.source);
	});

	$newNote.blur(function()
	{
		var block = JSON.parse($(this).parent().attr("block-data"));
		block.source = $(this).text();
		block.icon = deriveIcon(block.source);
		if( block.source != "" && block.datetime == undefined )
			block.datetime = Date.now();
		renderBlock($(this).parent(), deriveBlockData(block));
	});

	$newNote.pastableTextarea().on("pasteImage", function(event, image)
	{
		upload(image.dataURL.split(',')[1], ".png");
	})
	.on('pasteText', function(event, text) {
		var f = $(":focus");
		var pos = getCaretCharacterOffsetWithin(f[0]);
		var previousText = f[0].innerText; //.text();
		var end = previousText.length;
		var beforeStr = previousText.substring(0,pos);
		var afterStr = previousText.substring(pos,end);
		$(document.activeElement).text(beforeStr+text+afterStr);	
		setSelectionRange($(document.activeElement), pos+text.length);
	});

	$newTags.blur(function()
	{
		var block = JSON.parse($(this).parent().attr("block-data"));
		block.tags = $(this).text();
		renderBlock($(this).parent(), deriveBlockData(block));
	});

	$newNote.on("input", function()
	{
		var p = $(this).parent();
		if( $(this).text().length == 1 )
		{
			$(this).blur();
			$(this).focus();
			setEndOfContenteditable($(this)[0]);
		}
		if( $(this).text().length == 0 )
		{
			$(this).blur();
			$(this).focus();
			setEndOfContenteditable($(this)[0]);
		}
	});

	$newBlock.append($newTags);
	$newBlock.append($newIcon);
	$newBlock.append($newNote);
	$newBlock.append($newDateTime);
	$newBlock.append($newLinkBlock);

	return $newBlock;
}

function linkClick( url )
{
	window.open(url);
}

function extractHrefFromLink( str )
{
	return(str.split("\"")[1]);
}

function extractTextFromLink( str )
{
	return((str.split(">")[1]).split("<")[0]);
}

function deriveIcon( noteText  )
{
	var index = 0;
	if( noteText.startsWith("[") )
		index = 1;
	var icon = icons[noteText[index]];
	if( icon == undefined )
		return "";
	return icon;
}

function checkBox( input ) // blockIdx )
{
	var textBlock = $(input).parents("tr[class='block']");
	var blockdata = JSON.parse(textBlock.attr("block-data"));
	var src = blockdata.source;	
	var index = 0;
	if( src.startsWith("[") )
		index = 1;
	if( src[index] == "-" )
	{
		src = src.substr(0,index)+"+"+src.substr(index+1);
		blockdata.icon = icons["+"];
	}
	else
	{
		src = src.substr(0,index)+"-"+src.substr(index+1);
		blockdata.icon = icons["-"];
	}
	blockdata.source = src;
	//textBlock.attr("block-data", JSON.stringify(blockdata)); 
	renderBlock(textBlock, blockdata);
}


function createFirstItem(id)
{
	var $item = makeItem(id);
	$("table tr td").append($item);
	$.get("pimp/"+id, function(data) {
		populate(data);
		document.title = data.title;
	});
}

function populate(item)
{
	var itemId = "#"+item._id;
	// set the webpage's title
	if( item.title == " " )
		$(itemId+" .item-title").html("...");
	else
		$(itemId+" .item-title").html(item.title);
	$(itemId+" .item-born").html(item.born);
	var $block;
	for( var i = 0; i < item.doc.length; i++ )
	{
		for( var key in item.doc[i] )
		{
			var born = null;
			var val = item.doc[i][key];
			var blockData = {
				"tags":key,
				"source":val.text,
				"datetime":val.born,
				"id":itemId
			};
			$block = makeBlock();
			blockData = deriveBlockData(blockData);
			renderBlock( $block, blockData);
			var itemBody = $(itemId+" .item-blocks-table-body");
			itemBody.append($block);
		}
	}
	if( item.doc.length == 0 )
		$(itemId+" .item-blocks-table-body").append(makeBlock());
	// Put the cursor at the end of the note
	$block.find(".block-note").focus();
}

function getCaretCharacterOffsetWithin(element)
{
	var caretOffset = 0;
	var textRange;
	var doc = element.ownerDocument || element.document;
	var win = doc.defaultView || doc.parentWindow;
	var sel;
	if (typeof win.getSelection != "undefined")
	{
		var range = win.getSelection().getRangeAt(0);
		var preCaretRange = range.cloneRange();
		preCaretRange.selectNodeContents(element);
		preCaretRange.setEnd(range.endContainer, range.endOffset);
		caretOffset = preCaretRange.toString().length;
	}
	else if ( (sel = doc.selection) && sel.type != "Control")
	{
		textRange = sel.createRange();
		var preCaretTextRange = doc.body.createTextRange();
		preCaretTextRange.moveToElementText(element);
		preCaretTextRange.setEndPoint("EndToEnd", textRange);
		caretOffset = preCaretTextRange.text.length;
	}
	return caretOffset;
}

function setEndOfContenteditable(contentEditableElement)
{
	var range,selection;
	if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+

	{
		range = document.createRange();//Create a range (a range is a like the selection but invisible)
		range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
		range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
		selection = window.getSelection();//get the selection object (allows you to change selection)
		selection.removeAllRanges();//remove any selections already made
		selection.addRange(range);//make the range you have just created the visible selection
	}
	else if(document.selection)//IE 8 and lower
	{ 
		range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
		range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
		range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
		range.select();//Select the range (make it the visible selection
	}
}

function setSelectionRange(aNode, aOffset)
{
	aNode[0].focus();
	var sel = window.getSelection(),
	range = sel.getRangeAt(0);
	range.collapse(true);
	if( aNode[0].childNodes.length > 0 )
	{
		range.setStart(aNode[0].childNodes[0], aOffset);
		// range.setEnd(aNode[0].childNodes[0], aOffset);
	}
	sel.removeAllRanges();
	sel.addRange(range);
}


function jsonifyItem( item )
{
	var itemid = "#"+item.attr("id");
	var first_time_thru = false;
	var jitem = {}
	var title_text = $(itemid+" .item-title").html();
	if( title_text != "" )
	{
		jitem["title"] = title_text;
	}	
	else
	{
		first_time_thru = true;
	}
	jitem["born"] = new Date();
	jitem["doc"] = [];
	$(itemid+" .item-blocks-table-body").children("tr").each(function() {
	  var blockdata = JSON.parse($(this).attr("block-data"));
		var key = blockdata.tags;
		var value = blockdata.source;	
		if( first_time_thru )
		{
			first_time_thru = false;
			jitem["title"] = value;
		}
		var itemBorn = blockdata.datetime;
		value = {"text": value, "born": itemBorn};
		var obj = {};
		obj[key] = value;
		jitem["doc"].push(obj);
	});
	return jitem;
}

function padZero( number )
{
	if( number < 10 )
		return "0"+number.toString();
	return number;
}

function generateDatetimeHtml( datetime )
{
	var datestr = padZero(datetime.getFullYear())+"/"+padZero(datetime.getMonth())+"/"+padZero(datetime.getDate());
	var timestr = padZero(datetime.getHours())+":"+padZero(datetime.getMinutes())+":"+padZero(datetime.getSeconds());
	str = "<span class='date-string'>"+datestr+"</span><br><span class='time-string'>"+timestr+"</span>";
	return(str);
}

function saveItemIfDirty( p )
{
	if( dirty )
	{
		var item = p.parents("div[class='item']");
		saveItem(item);
		dirty = false;
	}
}

function start()
{
	$(function() { //DOM Ready

		document.title = "P.I.M.P. Your Data";
		var itemId = window.location.hash.substr(1);
		if( itemId == "" )
		{
			itemId = "000000000000000000000000";
		}
		items[itemId] = {"children":[]};
		createFirstItem(itemId);
	});

// Arrow Keys
	$(document).keydown( function(e)
	{
		var f = $(":focus");
		var p = f.parent();
		var blockClass = f.attr("class");
		if( e.which == 38 ) // UP
		{
			e.preventDefault();
			p.prev("tr").children("."+blockClass).focus();
			saveItemIfDirty(p);
		}
		else if( e.which == 40 ) // DOWN
		{
			e.preventDefault();
			p.next("tr").children("."+blockClass).focus();
			saveItemIfDirty(p);
		}
		else if( e.which == 37 ) // LEFT
		{
			if( f.hasClass("block-note")
			    && getCaretCharacterOffsetWithin(f[0]) == 0 )
			{
				e.preventDefault();
				p.children(".block-tags").focus();
			}
			saveItemIfDirty(p);
		}
		else if( e.which == 39 ) // RIGHT
		{
			if( f.hasClass("block-tags")
			    && getCaretCharacterOffsetWithin(f[0]) == f.text().length )
			{
				e.preventDefault();
				p.find(".block-note").focus();
			}
			saveItemIfDirty(p);
		}
		else if( e.which == 9 ) // TAB
		{
			saveItemIfDirty(p);
		}
		else
		{
			dirty = true;
		}
	});

	// ENTER and BACKSPACE
	$(document).keydown( function(e)
	{
		var f = $(":focus");
		var blockClass = f.attr("class");
		var p = f.parent();
		var c = p.children(".block-tags");
		if( blockClass == "block-tags" )
			c = p.children(".block-note");
		var pos = getCaretCharacterOffsetWithin(f[0]);
		var text = f[0].innerText;
		var end = text.length;
		var oldStr = text.substring(0,pos);
		var newStr = text.substring(pos,end);
		if( text.includes("\n") )
		{
			oldStr = text;
			newStr = "";
		}
		if( e.which == 13 ) // ENTER
		{
			if( !e.shiftKey )
			{
				e.preventDefault();
				f.text(oldStr);
				var source = "";
				var tags = "";
				if( blockClass == "block-tags" )
					tags = newStr;
				else
					source = newStr;
				if( oldStr.includes("\n") )
				{
					for( src of oldStr.split("\n").reverse() )
					{
						block_data = JSON.parse(p.attr("block-data"));
						block_data.icon = "";
						p.attr("block-data", JSON.stringify(block_data));
						p.after(renderBlock(makeBlock(), deriveBlockData({"source":src, "tags":tags})));
					}
					p.next("tr").children("."+blockClass).focus();
					p.remove();
				}
				else
				{
					block_data = JSON.parse(p.attr("block-data"));
					block_data.icon = "";
					p.attr("block-data", JSON.stringify(block_data));
					p.after(renderBlock(makeBlock(), deriveBlockData({"source":source, "tags":tags})));
					p.next("tr").children("."+blockClass).focus();
				}
			}
			var item = p.parents("div[class='item']");
			saveItem(item);
		}
		else if( e.which == 8  && pos == 0 ) // BACKSPACE
		{
			var prev = p.prev("tr");
			var prevBlockData = JSON.parse(prev.attr("block-data"));
			var sacrificeCharacter = "";
			if( prevBlockData.source.length > 0 )
				sacrificeCharacter = prevBlockData.source.substring(prevBlockData.source.length-1); 
			var prevText = prevBlockData.source+sacrificeCharacter+text;
			if( blockClass == "block-tags" )
			{
				if( prevBlockData.source.length > 0 )
					sacrificeCharacter = prevBlockData.source.substring(prevBlockData.source.length-1); 
				prevText = prevBlockData.tags+sacrificeCharacter+text;
			}
			var prevBlock = prev.children("."+blockClass);
			prevBlock.text(prevText);
			if( c.text() == "" )
				p.remove();
			else
				f.text("");
			prevBlock.blur();
			prevBlock.focus();
			var pos = prevText.length-text.length;
			setSelectionRange(prevBlock, pos);
			var item = prev.parents("div[class='item']");
			saveItem(item);
		}
	});
}

function saveItem( item ) {
	var str = JSON.stringify(jsonifyItem( item ), function(key, value) { return value === "" ? "" : value });
	var itemId = item.attr("id");
	console.log("saveItem(\""+itemId+"\")")
	if( itemId == "" )
	{
		$.post("pimp/", {"string":str}, function(data) {
			window.location.href = '#'+data._id;
			window.location.reload();
		});
	}
	else
	{
		$.ajax({
			url:"pimp/"+itemId,
			type:"PUT",
			contentType: "application/json",
			data:JSON.stringify({"string":str}),
    	dataType: "json",
			success: function(data) { }
		});
	}
}

function createLinkedItem( rightIcon )
{
	if( $(rightIcon).html() === "█" )
	{
		$(rightIcon).html("&#8987;");
		var block = rightIcon.parent().parent().parent();
		var tags = block.find(".block-tags").text();
		var blocknote = block.find(".block-note");
		var text = JSON.parse(block.attr('block-data')).source;
	  // text = blocknote.text();
		if( text == "" )
		{
			blocknote.text(" ");
			text = " ";
		}

		// Create a new item in the database that is blank
		var li = {};
		li["title"] = text;
		li["born"] = new Date();
		li["doc"] = [{"":{ "text":"" }}];
		var si = JSON.stringify(li, function(key, value) { return value === "" ? "" : value });
		$.post("pimp/", {"string":si}, function(data)
		{
		  if( data == "undefined" )
			{
				alert("Item is undefined!");
			}
			else
			{
							// With the new link returned from the database change the block to a linked block
							var link = "#"+data;
							var source = "["+text+"]("+link+")";
							var blockData = {
								"tags":tags,
								"source":source,
								"datetime":li["born"],
								"id":data
							};
							blockData = deriveBlockData(blockData);
							renderBlock( block, blockData);
							var e = {};
							e.target = block.find(".icon-link a:first-child");
							onBlockClick(e);
							var item = block.parents("div[class='item']");
							saveItem(item);
			}
		});
	}
}

function upload( blob, extension )
{
	uploadData = {};
	uploadData.blob = blob;
	uploadData.extension = extension;
	$.ajax({
	  type: 'POST',
	  url: '/upload',
		data: JSON.stringify(uploadData),
	  contentType: 'application/json', // set accordingly
	  processData: false,
		success: function(data)
		{
			console.log("The uploaded file is here: "+data.path);
			var imageMd = '[![]('+data.path+')]('+data.path+')';
			var f = $(":focus");
			var pos = getCaretCharacterOffsetWithin(f[0]);
			var previousText = f[0].innerText; //.text();
			var end = previousText.length;
			var beforeStr = previousText.substring(0,pos);
			var afterStr = previousText.substring(pos,end);
			$(document.activeElement).text(beforeStr+imageMd+afterStr);
			setSelectionRange($(document.activeElement), pos+imageMd.length);
		}
	});
		
}
