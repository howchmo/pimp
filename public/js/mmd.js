;function mmd(src)
{
	var h='';

	function escape(t)
	{
		return new Option(t).innerHTML;
	}
	function inlineEscape(s)
	{
		var returnStr = escape(s)
			.replace(/!\[([^\]]*)]\(([^(]+)\)/g, '<img alt="$1" src="$2">')
			.replace(/\[([^\]]+)]\(([^(]+)\)/g, '<span href="$2" class="link">$1<span>')
			.replace(/<a /g, '<a class="link" ')
			.replace(/ \| /g, '</td><td>')
			.replace(/`([^`]+)`/g, '<code>$1</code>')
			.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
			.replace(/\*([^*]+)\*/g, '<em>$1</em>');
		return returnStr;
	}

	src
	.replace(/^\s+|\r|\s+$/g, '')
	.replace(/\t/g, '    ')
	.split(/\n\n+/)
	.forEach(function(b, f, R)
	{
		f=b[0];
		R=
		{
			'*':[/\n\* /,'<li>','</li>'],
			// '1':[/\n[1-9]\d*\.? /,'<ol><li>','</li></ol>'],
			' ':[/\n    /,'<pre><code>','</pre></code>','\n'],
			'>':[/\n> /,'<blockquote>','</blockquote>','\n'],
//			'+':[/\n\+ /,'<input type="checkbox">',''],
//			'-':[/\n\- /,'<input type="checkbox" checked>',''],
			'-':[/\n\- /,'&#9744;&nbsp;',''],
			'+':[/\n\+ /,'&#x2611;&nbsp;',''],
			'?':[/\n\? /,'&#0;&nbsp;',''],
			'!':[/\n\! /,'&#128161;&nbsp;',''],
			'%':[/\n\% /,'&#128338;&nbsp;',''],
			'|':[/\n\| /,'<table class="internal-table"><tr><td>','</tr></table>'],
			':':[/\n\: /,'<table class="internal-table"><thead><tr><td>','</td></tr></thead></table>']
		}[f];
		h+=
			(R && b[1]==" ")?R[1]+('\n'+b)
				.split(R[0])
				.slice(1)
				.map(R[3]?escape:inlineEscape)
				.join(R[3]||'</li>\n<li>')+R[2]:
			f=='#'?'<h'+(f=b.indexOf(' '))+'>'+inlineEscape(b.slice(f+1))+'</h'+f+'>':
			f=='<'?b:
			''+inlineEscape(b)+'';
	});
	return h;
};
