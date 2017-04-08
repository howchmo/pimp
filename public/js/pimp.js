$(document).ready(start());

var icons = {
	"+":"<span class='checkbox'><input type='checkbox' checked></input></span>",
	"-":"<span class='checkbox'><input type='checkbox'></input></span>",
	"%":"&#128338;",
	"!":"&#128161;",
	"?":"&#0;"
};

function makeItem(id)
{
	var $item = $('<div/>', {'class':'item', 'id':id});
	var $itemHeader = $('<div/>', {'class':'item-header'});
	var $itemTitle = $('<span/>', {'class':'item-title', 'contenteditable':'true', 'html':'&nbsp;'});
	var $headerButtonContainer = $('<div/>', {'class':'item-button-container'});
	var $itemBorn = $('<div/>', {'class':'item-born'});
	var $itemContentWrapper = $('<div/>', {'class':'item-content-wrapper'});
	var $itemBlocksTable = $('<table/>', {'class':'item-blocks-table'});
	var $itemBlocksTableBody = $('<tbody/>', {'class':'item-blocks-table-body'});
	var $leftColumn = $('<div/>', {'class':'left-column'});
	
	$itemHeader.append($itemTitle);
	$itemHeader.append($headerButtonContainer);
	$itemHeader.append($itemBorn);
	$item.append($itemHeader);
	$itemBlocksTable.append($itemBlocksTableBody);
	$itemContentWrapper.append($itemBlocksTable);
	$item.append($itemContentWrapper);
	$item.append($leftColumn);
	
	return $item;
}

function getLink( block )
{
	var str = block.text = block.source;
	if( str.startsWith("[") )
	{
		var n = str.lastIndexOf("](");
		var link = str.substring(n+2, str.length-1);
		block.link = "<a href=\""+link+"\">&#9654;</a>";
		block.text = str.substring(1, n);
	}
	else if( str.startsWith("http://") || str.startsWith("https://") )
	{
		block.icon = '<a href="'+str+'">&#9654;</a>';
	}
	else if( str.length > 0 )
		block.link="&#9608;";
	else
	{
		block.link="&nbsp;&nbsp;&nbsp;";
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
		if( block.source != "" && block.datetime == undefined )
			block.datetime = Date.now();
		renderBlock($(this).parent(), deriveBlockData(block));
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

function linkClick()
{
	alert("this");
	window.open($(this).attr("href"));
}

function extractHrefFromLink( str )
{
	return(str.split("\"")[1]);
}

function extractTextFromLink( str )
{
	return((str.split(">")[1]).split("<")[0]);
}
/*
function checkBox( blockIdx )
{
	var textBlock = $(".right-text-block[block="+blockIdx+"]");
	var src = textBlock.attr("source");
	var index = 0;
	if( src.startsWith("[") )
		index = 1;
	if( src[index] == "-" )
		src = src.substr(0,index)+"+"+src.substr(index+1);
	else
		src = src.substr(0,index)+"-"+src.substr(index+1);
	textBlock.attr("source", src);
	textBlock.html(renderHtml(src, blockIdx));
}
*/

function createFirstItem(id)
{
	var $item = makeItem(id);
	$("table tr td").append($item);
	$.get("pimp/"+id, function(data) {
		populate(data);
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
	for( var i = 0; i < item.doc.length; i++ )
	{
		for( var key in item.doc[i] )
		{
			var born = null;
			var val = item.doc[i][key];
			var blockData = {
				"tags":key,
				"source":val.text,
				"datetime":val.born
			};
			var $block = makeBlock();
			blockData = deriveBlockData(blockData);
			renderBlock( $block, blockData);
			var itemBody = $(itemId+" .item-blocks-table-body");
			itemBody.append($block);
		}
	}
	//if( item.doc.length == 0 )
	//	addNewRow(0, "", "", "");
	// Put the cursor at the end of the note
	//$(".right-text-block[block="+i+"]").focus();
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
	aNode.focus();
	var sel = window.getSelection(),
	range = sel.getRangeAt(0);
	range.collapse(true);
	if( aNode.childNodes.length > 0 )

	{
		range.setStart(aNode.childNodes[0], aOffset);
//		range.setEnd(aNode.childNodes[0], aOffset);
	}
	sel.removeAllRanges();
	sel.addRange(range);
}

function jsonifyItem()
{
	var first_time_thru = false;
	var jitem = {}
	var title_text = $(".item-title").html();
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
	$(".item-blocks-table-body").children("tr").each(function() {
		var key = $(this).find(".left-text-block").text();
		var $rightTextBlock = $(this).find(".right-text-block");
		value = $rightTextBlock.attr("source");
		if( first_time_thru )
		{
			first_time_thru = false;
			jitem["title"] = value;
		}
		var $rightIconBlock = $(this).find(".date-time-block");
		var itemBorn = $rightIconBlock.attr("born");
		//if( $rightTextBlock.attr("link") != null )
		//{
			value = {"text": value, "born": itemBorn};
		//}
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

function start()
{
	$(function() { //DOM Ready

		document.title = "P.I.M.P. Your Data";
		itemId = window.location.hash.substr(1);
		$(".clone-button").click(function() {
			/*
			console.log("clone");
			ajaxLoad("pimp/"+itemId, ajaxOnResult);
			*/
			saveItem();
		});

		$(".unhide-button").click(function() {
			saveItem();
		});

		$(".close-button").click(function() {
			saveItem();
		});
		if( itemId == "" )
		{
			itemId = "000000000000000000000000";
		}
		//ajaxLoad("pimp/"+itemId, ajaxOnResult);
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
		}
		else if( e.which == 40 ) // DOWN
		{
			e.preventDefault();
			p.next("tr").children("."+blockClass).focus();
		}
		else if( e.which == 37 ) // LEFT
		{
			if( f.hasClass("block-note")
			    && getCaretCharacterOffsetWithin(f[0]) == 0 )
			{
				e.preventDefault();
				p.children(".block-tags").focus();
			}
		}
		else if( e.which == 39 ) // RIGHT
		{
			if( f.hasClass("block-tags")
			    && getCaretCharacterOffsetWithin(f[0]) == f.text().length )
			{
				e.preventDefault();
				p.find(".block-note").focus();
			}
		}
	});

	// ENTER and BACKSPACE
	$(document).keypress( function(e)
	{
		var f = $(":focus");
		var blockClass = f.attr("class");
		var p = f.parent();
		var c = p.children(".block-tags");
		if( blockClass == "block-tags" )
			c = p.children(".block-note");
		var pos = getCaretCharacterOffsetWithin(f[0]);
		var text = f.text();
		var end = text.length;
		var oldStr = text.substring(0,pos);
		var newStr = text.substring(pos,end);
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
				p.after(renderBlock(makeBlock(), deriveBlockData({"source":source, "tags":tags})));
				p.next("tr").children("."+blockClass).focus();
			}
		}
		else if( e.which == 8  && pos == 0 ) // BACKSPACE
		{
			var prev = p.prev("tr");
			var prevBlockData = JSON.parse(prev.attr("block-data"));
			var prevText = prevBlockData.source+text;
			var prevBlock = prev.children("."+blockClass);
			prevBlock.text(prevText);
			if( c.text() == "" )
				p.remove();
			else
				f.text("");
			prevBlock.blur();
			prevBlock.focus();
		}
	});
}

function ajaxLoad(uri, callback) {
	console.log("ajaxLoad('"+uri+"')");
	var request = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	request.onreadystatechange = callback;
	request.open("GET", uri);
	request.send(null);
}

function ajaxOnResult(evt) {
	if ((evt.currentTarget.readyState == 4) && (evt.currentTarget.status == 200 || evt.currentTarget.status == 0))
	{
		var item = JSON.parse(evt.currentTarget.responseText);
		console.log(JSON.stringify(item));
		populate(item);
	}
	else
	{
		console.log("HTTP status: "+evt.currentTarget.status);
	}
}

function saveItem() {
	var str = JSON.stringify(jsonifyItem(), function(key, value) { return value === "" ? "" : value });
	console.log("saveItem("+itemId+")")
	// console.log("	"+str);
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
			success: function(data) {
				//window.location.href = '#'+data._id;
				//window.location.reload();
			}
		})
	}
}
/*
function createLinkedItem( rightIcon ) {
	var $rightTextBlock = rightIcon.parent().parent().find(".right-text-block");
	var text = $rightTextBlock.text();
	if( text == "" )
	{
		$rightTextBlock.text(" ");
		text = " ";
	}
		var li = {};
		li["title"] = text;
		li["born"] = new Date();
		li["doc"] = [{"":""}];
		var si = JSON.stringify(li, function(key, value) { return value === "" ? "" : value });
		$.post("pimp/", {"string":si}, function(data)
		{
			var link = "#"+data;
			var source = "["+text+"]("+link+")";
			$rightTextBlock.attr("link", link);
			$rightTextBlock.attr("source", source);
			$rightTextBlock.html(toHtml(source));
			rightIcon.prop("onclick", null);
			rightIcon.html("<a target='_blank' href='"+link+"'>&#9654;</a>");
			window.open(link);
		});
}
*/
