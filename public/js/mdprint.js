$(document).ready(start());

var marginFactor = 40;
var indent = 0;
var firstTime = true;

function ajaxLoad(uri, callback)
{
	$.ajax({
		async:false,
		url: uri,
		type: "GET",
		contentType: "application/json",
		success: callback
	});

}

function firstAjaxOnResult( data, status )
{
  if( status == "success" )
  {
		mdprint(data);
	}
}

function ajaxOnResult( data, status )
{
  if( status == "success" )
  {
			printItem(data);
  }
  else
  {
    console.log("HTTP status: "+status);
  }
}

var p = "";
var urls = [];
function printIndentDiv()
{
	var str = "";
	for( i=0;i<indent;i++ )
				str += "#";
	return str;
}

function mdprint( item )
{
	console.log("mdprint");
	printItem(item);
	p += '<!-- Markdeep: --><style class="fallback">body{visibility:hidden;white-space:pre;font-family:monospace}</style><script src="js/markdeep.min.js" charset="utf-8"></script><script>window.alreadyProcessedMarkdeep||(document.body.style.visibility="visible")</script>';
}

function printItem( item )
{
	p += "\n";
	console.log("printItem(\""+item.title+"\") " + indent);
	if( indent > 0 )
	{
		p += printIndentDiv();
		p += " "+item.title+"\n";
		console.log(p);
	}
	else
		p += "   **"+item.title+"**\n";
  for( var i = 0; i < item.doc.length; i++ )
  {
    for( var key in item.doc[i] )
    {
			if( key != "" )
			{
				p += "**"+key+":** ";
			}
			var line = item.doc[i][key].text;
			if( line != undefined )
			{
				if( line.startsWith("[") )
				{
					var parsed = line.split("](");
					var text = parsed[0].substring(1);
					var url = parsed[1].slice(0,-1);
					if( url.startsWith("#") )
					{
						console.log(urls.indexOf(url));
						if( urls.indexOf(url) < 0 )
						{
							urls.push(url);
							indent++;
							ajaxLoad("pimp/"+url.substring(1), ajaxOnResult);
						}
					}
					else
					{
						p += line;
					}
				}
				else if( line.startsWith("http") || line.startsWith("https") )
				{
					p += "["+line+"]("+line+")"
				}
				else if( line.startsWith("> ") )
				{
					p += ">\n"+line;
				}
				else if( line.startsWith("- ") )
				{
					p += "[ ] "+line.substring(2);
				}
				else if( line.startsWith("+ ") )
				{
					p += "[x] "+line.substring(2);
				}
				else if( line.startsWith("! ") )
					p += "&#x1f4a1; "+line.substring(2);
				else if( line.startsWith("? ") )
					p += "&#x2754; "+line.substring(2);
				else if( line.startsWith("% ") )
					p += "&#x1f558; "+line.substring(2);
				else
					p += line;
				p += "\n\n"
			}
		}
	}
	p += "\n---\n";
	if( indent > 0 )
		indent--;
}

function start()
{
	$(function() {
		itemId = window.location.hash.substr(1);
		urls.push("#"+itemId);
		ajaxLoad("pimp/"+itemId, firstAjaxOnResult);
		$("body").html(p);
		// var newDoc = document.open("text/html", "replace");
		// newDoc.write(p);
		// newDoc.close();
	});
}	

