$(document).ready(start());

function toHtml( str )
{
	return(mmd(str));
}

var blockIdx = 0;
var first_time_thru = true;
var itemId;
var localItem;
var DASH = "&nbsp;" // "&#183"; // "&#8212;"; // "&#9670;"; // BLACK DASH
var DOT = "&nbsp;"; // EM DOT
var LINK = "&#9654;"; // BLACK RIGHT-POINTING TRIANGLE // "&#128279;" // CHAIN LINK ICON
var CLOCK = "&#128338;";
var BLOCK = "&#9608;"; // FULL BLOCK

function addNewRow( i, leftText, rightText, datetime )
{
	if( leftText != undefined && rightText != undefined )
	{
		var link = null;
		blockIdx++;
		var $newRow = $('<tr/>', {'class':'block-row', 'block':blockIdx});
		var $newLeft = $('<td/>', {'class':'left-text-block', 'contenteditable':true, 'block':blockIdx, 'html':leftText});
		var $newLeftIcon = $('<td/>', {'class':'left-icon-block', 'block':blockIdx});
		var $newDateTime = $('<td/>', {'class':'date-time-block', 'block':blockIdx});
		var $newLinkBlock;
		rightText = rightText.replace("<br>", "");
		if( rightText.startsWith("http://") || rightText.startsWith("https://") || rightText.startsWith("file:////") )
		{
			link = rightText;
		}
		else if( rightText.startsWith("[") )
		{
			link = rightText.split('(')[1];
			link = link.substring(0,link.length-1);
		}
		if( link == null )
		{
			$newLinkBlock = $('<td/>', {'class':'link-block', 'block':blockIdx});
			if( rightText == "" )
				$newLinkBlock.html("");
			else
				$newLinkBlock.html("<span class='link-icon' onclick='createLinkedItem( $(this) );'>"+BLOCK+"</span>");
		}
		else
		{
			$newLinkBlock = $('<td/>', {'class':'link-block', 'block':blockIdx, 'link':link});
			$newLinkBlock.html("<span class='link-icon'><a target='_blank' href='"+link+"'>"+LINK+"</a></span>");
		}
		$newRight = $('<td/>', {'class':'right-text-block', 'contenteditable':true, 'block':blockIdx, 'source':rightText, 'html':toHtml(rightText)});
		if( datetime == null )
			$newDateTime.html("&nbsp;");
		else
		{
			$newDateTime.attr("born",datetime);
			$newDateTime.html(generateDateTimeBlock(new Date(datetime)));
		}
		$newRow.append($newLeft);
		$newRow.append($newLeftIcon);
		$newRow.append($newRight);
		$newRow.append($newDateTime);
		$newRow.append($newLinkBlock);
		$("#item-blocks-table-body").append($newRow);
		$newRight.focus(edit);
		$newRight.blur(render);
		$newRight.html(renderHtml(rightText, blockIdx));
	}
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

function renderHtml( source, blockIdx )
{
	var html = toHtml(source);
	if( html.startsWith("<span href=\"") )
	{
		var link = extractHrefFromLink(html);
		$linkBlock = $(".link-block[block="+blockIdx+"]");
		$linkBlock.html("<span class='link-icon'><a target='_blank' href='"+link+"'>"+LINK+"</a></span>");
		$linkBlock.attr("link",link);
		//html = toHtml(extractTextFromLink(html));
	}
	else
	{
		var $linkBlock = $(".link-block[block="+blockIdx+"]");
		if( $linkBlock.html() != "" )
		{
			$linkBlock.html("<span class='link-icon' onclick='createLinkedItem( $(this) );'>"+BLOCK+"</span>");
			$linkBlock.removeAttr("link");
		}
	}
	if( html.startsWith("http://") || html.startsWith("https://") || html.startsWith("file:////") )
	{
		var link = html;
		$(".left-icon-block[block="+blockIdx+"]").html("<span class='left-icon'><a target='_blank' href='"+link+"'>"+LINK+"</a></span>");
		$(".left-icon-block[block="+blockIdx+"]").attr("link",link);
		var $linkBlock = $(".link-block[block="+blockIdx+"]");
		$linkBlock.html("<span class='left-icon'><a target='_blank' hrref='"+link+"'>"+LINK+"</a></span>");
		$linkBlock.attr("link", link);
	}
	else if( html.startsWith("&#0;&nbsp;") )
	{
		$(".left-icon-block[block="+blockIdx+"]").html("<span class='left-icon'>&#0;</span>");
		html = html.substring(10);
	}
	else if( html.startsWith("&#9744;&nbsp;") )
	{
		$(".left-icon-block[block="+blockIdx+"]").html("<span class='left-icon checkbox'><input type='checkbox' onclick='checkBox("+blockIdx+"); return false;'></span>");
		html = html.substring(13);
	}
	else if( html.startsWith("&#x2611;&nbsp;") )
	{
		$(".left-icon-block[block="+blockIdx+"]").html("<span class='left-icon checkbox'><input type='checkbox'  onclick='checkBox("+blockIdx+"); return false;' checked></span>");
		html = html.substring(14);
	}
	else if( html.startsWith("&#128161;&nbsp;") )
	{
		$(".left-icon-block[block="+blockIdx+"]").html("<span class='left-icon'>&#128161;&nbsp;</span>");
		html = html.substring(15);
	}
	else if( html.startsWith("&#128338;&nbsp;") )
	{
		$(".left-icon-block[block="+blockIdx+"]").html("<span class='left-icon'>&#128338;&nbsp;</span>");
		html = html.substring(15);
	}
	else if( html.startsWith("---") )
	{
		html = "<hr>";
	}
	else
	{
		if( html == "" )
		{
			$(".left-icon-block[block="+blockIdx+"]").html("<span class='left-icon'>"+DOT+"</span>");
		}
		else
		{
			$(".left-icon-block[block="+blockIdx+"]").html("<span class='left-icon'>"+DASH+"</span>");
		}
	}
	return html;
}

function render( evt )
{
	var t = $(this);
	clearTimeout(render.timeout);
	render.timeout = setTimeout(function()
	{
		var blockIdx = t.attr("block");
		var source = t.text();
		t.html(renderHtml(source, blockIdx));
		t.attr("source", source);
	}, 1);
}

function edit( evt )
{
	var t = $(this);
	clearTimeout(edit.timeout);
	edit.timeout = setTimeout(function()
	{
		var itemIdx = t.attr("block");
		var source = t.attr("source");
		t.text(source);
	}, 1);
}

function populate(item)
{
	// set the webpage's title
	document.title = "PIMP: "+item.title;

	localItem = item;
	if( item.title == " " )
		$(".item-title").html("...");
	else
		$(".item-title").html(item.title);
	$("#item-born").html(item.born);
	for( var i = 0; i < item.doc.length; i++ )
	{
		for( var key in item.doc[i] )
		{
			var born = null;
			var val = item.doc[i][key];
			if( $.isPlainObject(val) )
			{
				var text = val.text;
				if( val.url != undefined )
				{
					var url = val.url;
					val = "["+title+"]("+val.url+")";
				}
				else
					born = val.born
				val = text;
			}
			addNewRow( i, key, val, born);
		}
	}
	if( item.doc.length == 0 )
		addNewRow(0, "", "", "");
	// Put the cursor at the end of the note
	$(".right-text-block[block="+i+"]").focus();
}

function getCaretCharacterOffsetWithin(element) {
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
		selection = window.getparentSelection();//get the selection object (allows you to change selection)
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

function pprint()
{
	var firsttimethru = true;
	var str = "{\n";
	$("#item-blocks-table-body").children("tr").each(function() {
		var key = $(this).find(".left-text-block").text();
		key += " ";
		var value = $(this).find(".right-text-block").html();
		if( firsttimethru )
		{
			firsttimethru = false;
			str += "\t\"title\":\""+value+"\",\n";
			str += "\t\"born\":\""+(new Date())+"\",\n";
			str += "\t\"doc\":[\n";
			str += "\t\t{\""+key+"\":\""+value+"\"}";
		}
		else
		{
			str += ",\n\t\t{\""+key+"\":\""+value+"\"}";
		}
	});
	str += "\n\t]\n";
	str += "}";
	return str;
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
	$("#item-blocks-table-body").children("tr").each(function() {
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



function htmlifyItem()
{
	var listmode = false;
	var first_time_thru = false;
	var jitem = "<html>\n<body>\n"
	var title_text = $(".item-title").html();
	if( title_text != "" )
	{
		jitem += title_text+"<br/>\n";
	}	
	jitem += "<i>"+(new Date())+"</i>\n<br/>\n";
	$("#item-blocks-table-body").children("tr").each(function() {
		var key = $(this).find(".left-text-block").text();
		if( key != "" )
		{
			jitem += "<h1>"+key+"</h1>\n";
		}
		var $rightTextBlock = $(this).find(".right-text-block");
		value = $rightTextBlock.html();
		if( value.startsWith("http://") || value.startsWith("https://") || value.startsWith("file:////") )
		{
			value = '<a href="'+value+'">'+value+'</a>';
		}
		else if( value.startsWith("<li>") && !listmode )
		{
			listmode = true;
			jitem += "<ul>\n";
		}
		else if( !value.startsWith("<li>") && listmode )
		{
			listmode = false;
			jitem += "</ul>\n";
		}
		var icon = $(this).find(".left-icon-block > .left-icon").html();
		console.log("ICON = "+icon);
		if( !icon.startsWith("<a") && icon != "&nbsp;" )
		{
			jitem += icon;
		}
		jitem += value;
		if( !listmode )
					jitem += "<br/>\n";
		else
					jitem += "\n";
	});
	jitem += "</body>\n</html>\n";
	return jitem;
}

function markdownifyItem()
{
}

function padZero( number )
{
	if( number < 10 )
		return "0"+number.toString();
	return number;
}

function generateDateTimeBlock( datetime )
{
	var datestr = padZero(datetime.getFullYear())+"/"+padZero(datetime.getMonth())+"/"+padZero(datetime.getDate());
	var timestr = padZero(datetime.getHours())+":"+padZero(datetime.getMinutes())+":"+padZero(datetime.getSeconds());
	str = "<span class='date-string'>"+datestr+"</span><br><span class='time-string'>"+timestr+"</span>";
	return(str);
}

function copyItemToClipboard()
{
	var htmlItem = htmlifyItem();
	console.log(htmlItem);
	window.open("").document.write(htmlItem);	

}

function start()
{
	$(function() { //DOM Ready

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

		$(".htmlprint-button").click(function() {
			copyItemToClipboard();
		});

		$(".close-button").click(function() {
			saveItem();
		});
		if( itemId == "" )
		{
			itemId = "000000000000000000000000";
		}
		ajaxLoad("pimp/"+itemId, ajaxOnResult);
	});


	$(document).keydown( function(e)
	{
		if( e.which == 38 ) // UP
		{
			if( $(document.activeElement).hasClass("right-text-block") )
			{
				e.preventDefault();
				$(document.activeElement).parent("tr").prev("tr").find(".right-text-block").focus();
			}
			else if( $(document.activeElement).hasClass("left-text-block") )
			{
				e.preventDefault();
				$(document.activeElement).parent("tr").prev("tr").find(".left-text-block").focus();
			}
		}
		else if( e.which == 40 ) // DOWN
		{
			e.preventDefault();
			if( $(document.activeElement).hasClass("right-text-block") )
			{
				e.preventDefault();
				$(document.activeElement).parent("tr").next("tr").find(".right-text-block").focus();
			}
			else if( $(document.activeElement).hasClass("left-text-block") )
			{
				e.preventDefault();
				$(document.activeElement).parent("tr").next("tr").find(".left-text-block").focus();
			}
		}
		else if( e.which == 37 ) // LEFT
		{
			if( $(document.activeElement).hasClass("right-text-block")
			    && getCaretCharacterOffsetWithin(document.activeElement) == 0 )
			{
				e.preventDefault();
				$(document.activeElement).parent("tr").find(".left-text-block").focus();
			}
		}
		else if( e.which == 39 ) // RIGHT
		{
			if( $(document.activeElement).hasClass("left-text-block")
			    && getCaretCharacterOffsetWithin(document.activeElement) == $(document.activeElement).text().length )
			{
				e.preventDefault();
				$(document.activeElement).parent("tr").find(".right-text-block").focus();
			}
		}
	});
	$(document).keydown( function(e)
	{
		var pos = getCaretCharacterOffsetWithin(document.activeElement);
		var text = $(document.activeElement).text();
		var end = text.length;
		if( e.which == 13 ) // ENTER
		{
			if( !e.shiftKey )
			{
				var oldStr = text.substring(0,pos);
				var newStr = text.substring(pos,end);
				if( pos < end )
					e.preventDefault();
				var activeBlockIdx = $(document.activeElement).attr("block");
				blockIdx++;
				var $newRow = $('<tr/>', {'class':'block-row', 'block':blockIdx});
				var $newLeft = $('<td/>', {'class':'left-text-block', 'contenteditable':true, 'block':blockIdx});
				var $newLeftIcon = $('<td/>', {'class':'left-icon-block', 'block':blockIdx});
				var $newRight = $('<td/>', {'class':'right-text-block', 'contenteditable':true, 'block':blockIdx});
				var $newDateTimeBlock = $('<td/>', {'class':'date-time-block', 'block':blockIdx});
				var $newLinkBlock = $('<td/>', {'class':'link-block', 'block':blockIdx});
				$newDateTimeBlock.html("");
				$newLeftIcon.html("<span class='left-icon'>"+DOT+"</span>");
				$newRow.append($newLeft);
				$newRow.append($newLeftIcon);
				$newRow.append($newRight);
				$newRow.append($newDateTimeBlock);
				$newRow.append($newLinkBlock);
				$("tr[block="+activeBlockIdx+"]").after($newRow);
				if( document.activeElement.className == 'left-text-block' )
				{
					$(".left-text-block[block='"+activeBlockIdx+"']").text(oldStr);
					$newLeft.text(newStr);
					$newLeft.focus();
					//$newLeft.find("br").remove();
				}
				else if( document.activeElement.className == 'right-text-block' )
				{
					if( oldStr == "" )
					{
						var blockId = $(document.activeElement).attr("block");
						var $dateTimeBlock = $(".date-time-block[block='"+blockId+"']");
						$dateTimeBlock.html("");
						$dateTimeBlock.removeAttr("born");
						$(".link-block[block='"+blockId+"']").html("");
					}
					$(".right-text-block[block='"+activeBlockIdx+"']").attr("source", oldStr);
					$newRight.attr("source", newStr);
					$(".right-text-block[block='"+activeBlockIdx+"']").text(oldStr);
					$newRight.text(newStr);
					if( newStr != "" )
					{
						var now = new Date();
						$newDateTimeBlock.attr("born",now.toISOString());
						$newDateTimeBlock.html(generateDateTimeBlock(now));
					}
					$newRight.focus(edit);
					$newRight.blur(render);
				}
				$newRight.focus();
			}
			saveItem();
		}
		else if( $(document.activeElement).hasClass("right-text-block") && (e.which == 8 || e.which == 0) && $(document.activeElement).text().length == 1 )
		{
			var blockId = $(document.activeElement).attr("block");
			$(".left-icon-block[block='"+blockId+"']").html("<span class='left-icon'>"+DOT+"</span>");
			$(".date-time-block[block='"+blockId+"']").html("");
			$(".link-block[block='"+blockId+"']").html("");
		}
		else if( e.which == 8  && pos == 0 ) // BACKSPACE
 		{
			if( $(document.activeElement).hasClass("right-text-block") )
			{
				if( $(document.activeElement).parent("tr").find(".left-text-block").text() == "" )
				{
			  	if( typeof $(document.activeElement).parent("tr").prev("tr").find(".right-text-block")[0] == "object" )
					{
						e.preventDefault();
						var rowToRemove = $(document.activeElement).parent("tr");
						var prevTextBlock = $(document.activeElement).parent("tr").prev("tr").find(".right-text-block");
						var l = prevTextBlock.attr("source").length;
						prevTextBlock.attr("source", prevTextBlock.attr("source")+$(document.activeElement).text());
						prevTextBlock.text(prevTextBlock.attr("source"));
						var prevDateTimeBlock = $(document.activeElement).parent("tr").prev("tr").find(".date-time-block");
						var dateTimeBlock = $(document.activeElement).parent("tr").find(".date-time-block");
						if( $(document.activeElement).text() != "" )
						{
							prevDateTimeBlock.html(dateTimeBlock.html());
							prevDateTimeBlock.attr("born", dateTimeBlock.attr("born"));
						}
						setSelectionRange(prevTextBlock[0], l);
						rowToRemove.remove();
						e.returnValue = false;
					}
				}
				else
				{
					e.preventDefault();
					var leftBlock = $(document.activeElement).parent("tr").find(".left-text-block");
					setEndOfContenteditable(leftBlock[0]);
					leftBlock.focus();
				}
			}
			else if( $(document.activeElement).hasClass("left-text-block") )
			{
				if( $(document.activeElement).parent("tr").find(".right-text-block").text() == "" )
				{
			  	if( typeof $(document.activeElement).parent("tr").prev("tr").find(".left-text-block")[0] == "object" )
					{
						e.preventDefault();
						var rowToRemove = $(document.activeElement).parent("tr");
						var prevTextBlock = $(document.activeElement).parent("tr").prev("tr").find(".left-text-block");
						var l = prevTextBlock.text().length;
						prevTextBlock.text(prevTextBlock.text()+$(document.activeElement).text());
						setSelectionRange(prevTextBlock[0], l);
						prevTextBlock.focus();
						rowToRemove.remove();
						e.returnValue = false;
					}
				}
				else
				{
					e.preventDefault();
					var rightBlock = $(document.activeElement).parent("tr").prev("tr").find(".right-text-block");
					setEndOfContenteditable(rightBlock[0]);
					rightBlock.focus();
				}
			}
			saveItem();
		}
		else
		{
			if( document.activeElement.className == "right-text-block" )
			{
				if( end == 0 )
				{
					var now = new Date();
					$(".date-time-block[block='"+$(document.activeElement).attr("block")+"']").attr("born",now.toISOString());
					$(".date-time-block[block='"+$(document.activeElement).attr("block")+"']").html(generateDateTimeBlock(now));
					$(".link-block[block='"+$(document.activeElement).attr("block")+"']").html("<span class='link-icon' onclick='createLinkedItem( $(this) );'>"+BLOCK+"</span>");
				}
			}
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
