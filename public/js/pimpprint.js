$(document).ready(start());

var marginFactor = 40;
var indent = 0;

function ajaxLoad(uri, callback)
{
	$.ajax({
		async:false,
		url: uri,
		type: "GET",
		contentType: "application/json",
		success: ajaxOnResult
	});

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
	margin = marginFactor;
	console.log("margin = "+indent+" * "+marginFactor);
	return "<div style=\"margin-left:"+margin+"px;\"><hr/>";
}

function printItem( item )
{
	console.log("printItem(\""+item.title+"\")");
	if( indent > 0 )
		p += printIndentDiv();
	p += "<span style=\"font-size:120%;\"><b><u>"+item.title+"</u></b></span>";
  for( var i = 0; i < item.doc.length; i++ )
  {
    for( var key in item.doc[i] )
    {
			if( key != "" )
			{
				p += "<dt><b><i>"+key+":</i></b><dt/>";
			}
			var line = item.doc[i][key].text;
			if( line != undefined )
			{
				if( line.startsWith("[!") )
				{
					var parsed = line.split("](");
					var text = parsed[0].substring(3);
					var imgUrl = parsed[1].slice(0,-1);
					var url = parsed[2].slice(0,-1);
					if( text != "" )
						text+=" - ";
					p += "<dd><img height=200 src=\""+imgUrl+"\"></img> ("+text+"<a href=\""+url+"\">"+url+"</a>)</dd>"
				}
				else if( line.startsWith("[") )
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
							// p += "<dd>"+text+"</dd>";
							ajaxLoad("pimp/"+url.substring(1), ajaxOnResult);
						}
					}
					else
					{
						p += "<dd>"+text+" (<a href=\""+url+"\">"+url+"</a>)</dd>"
					}
				}
				else if( line.startsWith("http") )
				{
					p += "<dd><a href=\""+line+"\">"+line+"</a></dd>";
				}
				else if( line.startsWith("![") )
				{
					var parsed = line.split("](");
					var text = parsed[0].substring(1);
					var url = parsed[1].slice(0,-1);
					p += "<dd><img height=200 src=\""+url+"\"></img></dd>"
						
				}
				else
					p += "<dd>"+line+"<dd/>";
			}
		}
	}
	if( indent > 0 )
	{
		indent--;
		p += "<hr/></div>";
	}
}

function start()
{
	$(function() {
		itemId = window.location.hash.substr(1);
		urls.push("#"+itemId);
		ajaxLoad("pimp/"+itemId, ajaxOnResult);		
		$("body").append(p);
	});
}	

