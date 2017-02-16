$(document).ready(start());

function toHtml( str )
{
	return(mmd(str));
}

var blockIdx = 0;
var first_time_thru = true;
var itemId;
var localItem;
var DIAMOND = "&#9670;"; // BLACK DIAMOND
var DASH = "&#8212;"; // EM DASH
var RIGHTPOINTER = "&#9654;"; // BLACK RIGHT-POINTING TRIANGLE

function addNewRow( i, leftText, rightText )
{
	if( leftText != undefined && rightText != undefined )
	{
		var link = null;
		blockIdx++;
		var $newRow = $('<tr/>', {'class':'block-row', 'block':blockIdx});
		var $newLeft = $('<td/>', {'class':'left-text-block', 'contenteditable':true, 'block':blockIdx, 'html':leftText});
		var $newRightIcon = $('<td/>', {'class':'right-icon-block', 'block':blockIdx});
		var $newLeft;
		var $newRightIcon;
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
			$newLeftIcon = $('<td/>', {'class':'left-icon-block', 'block':blockIdx});
			if( rightText == "" )
				$newLeftIcon.html("<span class='left-icon' onclick='createLinkedItem( $(this) );'>"+DASH+"</span>");
			else
			{
				$newLeftIcon.html("<span class='left-icon' onclick='createLinkedItem( $(this) );'>"+DIAMOND+"</span>");
			}
		}
		else
		{
			$newLeftIcon = $('<td/>', {'class':'left-icon-block', 'block':blockIdx, 'link':link});
			$newLeftIcon.html("<span class='left-icon'><a target='_blank' href='"+link+"'>"+RIGHTPOINTER+"</a></span>");
		}
		$newRight = $('<td/>', {'class':'right-text-block', 'contenteditable':true, 'block':blockIdx, 'source':rightText, 'html':toHtml(rightText)});
		$newRightIcon.html("&nbsp;");
		$newRow.append($newLeft);
		$newRow.append($newLeftIcon);
		$newRow.append($newRight);
		$newRow.append($newRightIcon);
		//$("tr[block="+abi+"]").after($newRow);
		$("table.item tbody").append($newRow);
		// $(".left-text-block").focus(edit);
		// $(".left-text-block").blur(render);
		$(".right-text-block").focus(edit);
		$(".right-text-block").blur(render);
	}
}

function extractHref( str )
{
	return(str.split("\"")[1]);
}

function render( evt )
{
	var t = $(this);
	clearTimeout(render.timeout);
	render.timeout = setTimeout(function()
	{
		var blockIdx = t.attr("block");
		var source = t.text();
		console.log("render() "+blockIdx+" "+source);
		t.attr("source", source);
		var html = toHtml(source);
		console.log("	"+html);
		if( html.startsWith("<a href=\"") )
		{
			link = extractHref(html);
			console.log("	link = '"+link+"'");
			$(".left-icon-block[block="+blockIdx+"]").html("<span class='left-icon'><a target='_blank' href='"+link+"'>"+RIGHTPOINTER+"</a></span>");
			$(".left-icon-block[block="+blockIdx+"]").attr("link",link);
		}
		else if( html.startsWith("http://") || html.startsWith("https://") || html.startsWith("file:////") )
		{
			link = html;
			$(".left-icon-block[block="+blockIdx+"]").html("<span class='left-icon'><a target='_blank' href='"+link+"'>"+RIGHTPOINTER+"</a></span>");
			$(".left-icon-block[block="+blockIdx+"]").attr("link",link);
		}
		else
		{
			if( html == "" )
				$(".left-icon-block[block="+blockIdx+"]").html("<span class='left-icon' onclick='createLinkedItem( $(this) );'>"+DASH+"</span>");
			else
				$(".left-icon-block[block="+blockIdx+"]").html("<span class='left-icon' onclick='createLinkedItem( $(this) );'>"+DIAMOND+"</span>");
		}
		t.html(html);
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
		console.log("edit() "+itemIdx+" "+source);
		t.text(source);
	}, 1);
}

function populate(item)
{
	// set the webpage's title
	document.title = "PIMP: "+item.title;

	localItem = item;
	console.log("item.title = '"+item.title+"'");
	if( item.title == " " )
		$(".item-title").html("...");
	else
		$(".item-title").html(item.title);
	for( var i = 0; i < item.doc.length; i++ )
	{
		for( var key in item.doc[i] )
		{
			var val = item.doc[i][key];
			if( $.isPlainObject(val) )
			{
				//addNewRow( i, key, val.text, val.url);
				var title = val.text;
				var url = val.url;
				val = "["+title+"]("+val.url+")";
			}
			addNewRow( i, key, val);
		}
	}
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
	range	= sel.getRangeAt(0);
	range.collapse(true);
	range.setStart(aNode.childNodes[0], aOffset),
	// range.setEnd(aNode.childNodes[0], aOffset+1),				
	sel.removeAllRanges();
	sel.addRange(range);
}

function pprint()
{
	var firsttimethru = true;
	var str = "{\n";
	$(".item tbody").children("tr").each(function() {
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
	$(".item tbody").children("tr").each(function() {
		var key = $(this).find(".left-text-block").text();
		var $rightTextBlock = $(this).find(".right-text-block");
		value = $rightTextBlock.attr("source");
		if( first_time_thru )
		{
			first_time_thru = false;
			jitem["title"] = value;
		}
		if( $rightTextBlock.attr("link") != null )
		{
			value = {"text": value, "url": $rightTextBlock.attr("link")}
		}
		var obj = {};
		obj[key] = value;
		jitem["doc"].push(obj);
	});
	return jitem;
}

function start()
{
	$(function() { //DOM Ready

		itemId = window.location.hash.substr(1);

		$(".editable").click(function(){
			$(this).attr("contenteditable","true");
			$(this).focus();
		}).blur(function(){
		});

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
/*
		$(".right-icon").click(function() {
			createLinkedItem( "TEST TEXT", $(this) );
		});
*/
		if( itemId != "" )
		{
			ajaxLoad("pimp/"+itemId, ajaxOnResult);
		}
		else
		{
			addNewRow("","");
		}
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
	$(document).keypress( function(e)
	{
		var pos = getCaretCharacterOffsetWithin(document.activeElement);
		var text = $(document.activeElement).text();
		var end = text.length;
		if( e.which == 13 ) // ENTER
		{
			if( !e.shiftKey )
			{
				var newStr = "";
				var oldStr = "";
				oldStr = text.substring(0,pos);
				newStr = text.substring(pos,end);
				if( pos < end )
					e.preventDefault();
				var activeBlockIdx = $(document.activeElement).attr("block");
				blockIdx++;
				var $newRow = $('<tr/>', {'class':'block-row', 'block':blockIdx});
				var $newLeft = $('<td/>', {'class':'left-text-block', 'contenteditable':true, 'block':blockIdx});
				var $newLeftIcon = $('<td/>', {'class':'left-icon-block', 'block':blockIdx});
				var $newRight = $('<td/>', {'class':'right-text-block', 'contenteditable':true, 'block':blockIdx});
				var $newRightIcon = $('<td/>', {'class':'right-icon-block', 'block':blockIdx});
				$newRightIcon.html("&nbsp;");
				$newLeftIcon.html("<span class='left-icon' onclick='createLinkedItem( $(this) );'>"+DASH+"</span>");
				$newRow.append($newLeft);
				$newRow.append($newLeftIcon);
				$newRow.append($newRight);
				$newRow.append($newRightIcon);
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
					console.log("oldStr = "+oldStr+", newStr = "+newStr);
					$(".right-text-block[block='"+activeBlockIdx+"']").attr("source", oldStr);
					$newRight.attr("source", newStr);
					$(".right-text-block[block='"+activeBlockIdx+"']").text(oldStr);
					$newRight.text(newStr);
					$newRight.focus(edit);
					$newRight.blur(render);
					$newRight.focus();
				}
			}
			saveItem();
		}
		else if( $(document.activeElement).hasClass("right-text-block") && e.which == 8 && $(document.activeElement).text().length == 1 )
		{
			$(".left-icon-block[block='"+$(document.activeElement).attr("block")+"']").html("<span class='left-icon' onclick='createLinkedItem( $(this) );'>"+DASH+"</span>");
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
					$(".left-icon-block[block='"+$(document.activeElement).attr("block")+"']").html("<span class='left-icon' onclick='createLinkedItem( $(this) );'>"+DIAMOND+"</span>");
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
