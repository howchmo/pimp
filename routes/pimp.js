var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;

var Server = mongo.Server,
Db = mongo.Db,
BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('pimp', server);

db.open(function(err, db) {
if(!err) {
console.log("Connected to 'pimp' database");
db.collection('items', {strict:true}, function(err, collection) {
if (err) {
console.log("The 'items' collection doesn't exist. Creating it with sample data...");
populateDB();
}
});
}
});

exports.findById = function(req, res) {
	var id = req.params.id;
	console.log('Retrieving item: ' + id);
	db.collection('items', function(err, collection) {
		var oid = new ObjectID(id);
		collection.find({'_id':oid}).limit(1).next( function(err, item) {
			res.send(item);
		});
	});
};

exports.findAll = function(req, res) {
db.collection('items', function(err, collection) {
collection.find().toArray(function(err, items) {
res.send(items);
});
});
};

exports.addItem = function(req, res)
{
	var item = JSON.parse(req.body.string);
	console.log("addItem( title = '"+item.title+"')");
	db.collection('items').insertOne ( item, function( err, result ) {
		console.log('Success:');
		console.log('     ' + result.insertedId);
		res.send(result.insertedId);
	});
}
 
exports.updateItem = function(req, res)
{
	var id = req.params.id;
	var item = JSON.parse(req.body["string"]);
	console.log("Update item: " +id + " : "+ JSON.stringify(item));
	db.collection('items').updateOne({'_id':ObjectID(id)}, item, {safe:true},
		function(err, result)
		{
			if (err)
			{
				console.log('Error updating item: ' + err);
				res.send({'error':'An error has occurred'});
			}
			else
			{
				console.log('' + result + ' document(s) updated');
				item._id = id;
				console.log(JSON.stringify(item));
				res.send(item);
			}
		}
	);
}
 
exports.deleteItem = function(req, res) {
var id = req.params.id;
console.log('Deleting item: ' + id);
db.collection('items', function(err, collection) {
collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
if (err) {
res.send({'error':'An error has occurred - ' + err});
} else {
console.log('' + result + ' document(s) deleted');
res.send(req.body);
}
});
});
}
 
/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {
 
var items = [
{
	"title":"GIFT+SIMILE Release Meeting",
	"born":"Fri Sep 05 2014 14:04:20 GMT-0400 (Eastern Standard Time)",
	"doc":[
		{"title":"GIFT+SIMILE Release Meeting"},
		{"type":"meeting"},
		{"date":"2014/09/05"},
		{"time":"1300-1400"},
		{"project":"GIFT+SIMILE"},
		{"notes":"hunky-dory version"},
		{"bugs":"namespace issues"},
		{"":"Ben Goldberg's stuff was not up-to-date"},
		{"action":"write a note to Mike Hoffman indicating that the stuff we delivered was not included in the latest build despite notes to the contrary"},
		{"process improvement":"ask Mike to let us know when things have been committed so we can test"},
		{"process improvement":"send Mike a diff patch file out of SVN"},
		{"":""},
		{"issue":"TUI scenario"},
		{"action":"look at the TUI scenario"},
		{"":""},
		{"":"Run the explicit models"},
		{"":""},
		{"":"VBS2 testing"},
		{"":""},
		{"SCALE":"Rodney Long"},
		{"":"Chuck Amburn"},
		{"action":"present them our work on PULSAR"}
	]
},
{
	"title":"TeleICU Kickoff",
	"born":"Fri Sep 05 2014 15:04:35 GMT-0400 (Eastern Standard Time)",
	"doc":[
		{"title":"TeleICU Kickoff"},
		{"date":"2014/09/05"},
		{"time":"1400-1500"},
		{"in-attendance":"Metcalf"},
		{"":"Kayne"},
		{"":"Taber"},
		{"":"3 other people from UCF"},
		{"":"Broshears"},
		{"":"Woods"},
		{"":"Mall"},
		{"":""},
		{"notes":""},
		{"action":"setup task tracking between the teams"},
		{"kickoff meeting ?":"2014/09/22"},
		{"D1":"Leslie Dubow"},
		{"D2":"Leslie Dobson"},
		{"question":"Metcalf asks: \"Do the people from Wright Patterson come down for the kickoff?\""},
		{"answer":"no"},
		{"notes":"All of 3 is yours, all of 4 is yours"},
		{"":"Task 1 goes from Month 3 to Month 10"},
		{"":"Ben Quintero is going to be our Technical Lead"},
		{"":"Dave Broshears is going to be the project manager"},
		{"idea":"task interoperability"},
		{"directive from Larry":"call them sub-clinics"},
		{"action":"get together to put together our contractor - sub-contractor collaboration process"},
		{"action":"Shane Taber and Dave Broshears included in METIL getting information about the architecture of the environment from the Discovery Lab"},
		{"":"they talk about contracts"},
		{"action":"Get the contracting together"},
		{"notes":"assumptions"},
		{"":"acceptance criteria"},
		{"question":"Who is the person who will handle all the stuff having to do with the mobile application gallery?  Who is the operational belly-button for this?"},
		{"":"Worked with Edwin Mallory from Cocoa"},
		{"question":"How are we going to maintain situational awareness about scope creep and keeping to the letter of the contract versus the actual intent?"},
		{"testing":"Metcalf says, \"System Level and Acceptance Testing will be handled by ECS, Inc.?\""},
		{"note":"There is only the Tachycardia scenario"},
		{"info":"UCF is doing a OR simulation for meta-cognition for Google Glass from VA through PEOSTRI and ARL "},
		{"notes":"UCF has a contract vehicle that could be quicker or to take care of extra requirements that might need to be taken care of"},
		{"":"Metcalf said this is something that can be important for business strategy"},
		{"":""},
		{"meeting plan":"Handling the architect"},
		{"":"Schedule"},
		{"":"how to work together"},
		{"task breakdown":"2 is half and half"},
		{"":"3 & 4 is all UCF"},
		{"":"3 & 4 already has burdened time for us to support you"},
		{"":""}
	]
}
,
{
	"title":"Sr Mgr Meeting",
	"born":"Mon Sep 08 2014 12:03:09 GMT-0400 (Eastern Standard Time)",
	"doc":[
		{"title":"Sr Mgr Meeting"},
		{"":"<br>"},
		{"notes":"Kristy Murray will be attending the management meetings and PMR's"},
		{"":"VT MAK interested in working with us"},
		{"":"Autodesk is also interested in us"},
		{"":"Bank of America DOD is in to lunch"},
		{"":"Tele-ICU Game was awarded"},
		{"":"Who was available from "},
		{"appointment":"Manny is in on the 15th"},
		{"to do":"IITSEC Slides"},
		{"":"IR&amp;D money from Autodesk to look at automating the pipeline"},
		{"to do":"get req for VBS3 professional"},
		{"to do":"talk to Larry about the VBS3 license"},
		{" ":"Flight Center is asking for 5 people"},
		{"":"Havoc does not want to do services"},
		{"":"2 major proposals in draft"},
		{"":"2 minor proposals in draft"},
		{"":"Check 6 company"},
		{"think":"BIG DATA and geo-spatial information management system - Common Operational Picture (COP)<br>"},
		{"":"<br>"},
		{"idea":"Eric and Denis as possible guys on this Flight Center Havoc project"},
		{"idea":"\"Tell the story of my learning\""},
		{"":"<br>"}
	]
}
,
{
	"title":"Meeting with Ben Goldberg<br>",
	"born":"Mon Sep 15 2014 14:10:27 GMT-0400 (Eastern Standard Time)",
	"doc":[
		{"title":"Meeting with Ben Goldberg<br>"},
		{"date":"2014/09/15"},
		{"time":"1300-1405"},
		{"":"<br>"},
		{"notes":"How do we handle timing and counting in SIMILE?"},
		{"":"RulesOfEngagement reset in the DKF"},
		{"":""},
		{"":"Check to see if the text change is boolean versus 1 and 0"},
		{"":""},
		{"":"Check the Wall Segments so that we have good&nbsp; "},
		{"":""},
		{"":"Tweak the distance from the wall based on the thickness of the wall"},
		{"":""},
		{"":"If you are in the right posture the transition does not transition back"},
		{"":"Escalating feedback, can we stack the tactics so the DefaultStrategyHandler should be able to handle that through the GIFT mechanism"},
		{"":"Go back and check to make sure that several tactics will output the correct DKF stuff"},
		{"":"<br>"},
		{"BUG":"Fully close down the runtime when we "},
		{"":""},
		{"IGNORE":"We can't solve the problem with DIS doing dead reckoning"},
		{"":""},
		{"":"Make sure that the issues with "},
		{"":""},
		{"":"DKF authoring of the AAR scoring - is this something that can be authored within the Workbench or must be handled in the DKF authoring tool"},
		{"":"need to specify in documentation how this will be handled"},
		{"":""}
	]
}
,
{
	"title":"PULSAR Program Management Review",
	"born":"Thu Sep 18 2014 11:28:05 GMT-0400 (Eastern Standard Time)",
	"doc":[
		{"title":"PULSAR Program Management Review"},
		{"project":{"text":"PULSAR","url":"#project_pulsar"}},
		{"date":"2014/09/18"},
		{"start time":"1000"},
		{"end time":"1130<br>"},
		{"":""},
		{"in attendance":"Paula<br>"},
		{"":"Damon<br>"},
		{"":"Alan"},
		{"":""},
		{"from ECS":"Eric"},
		{"":"Howard"},
		{"":"Lynn<br>"},
		{"":"<br>"},
		{"on phone":"Fritz"},
		{"":"Andy"},
		{"":"DJ<br>"},
		{"":""},
		{"note":"Paula thought our approach to Affective State and NLP was very original and interesting"},
		{"":"Damon agreed with this"},
		{"request from ADL":"architecture slide with RUSSELL, DECALS, and PULSAR"},
		{"note":"Paula asked have you considered levels of knowledge in terms of Bloom's level"},
		{"":"Fritz mentioned that the content is being evaluated at high levels of Bloom's taxonomy"},
		{"":"While the learning levels are only at Bloom's levels 1 and 2"},
		{"":"Well knowledge about judgement becomes a more dicey issue"},
		{"":"Paula asked why the efficiency of processing resources is important, "},
		{"":"Paula asks how do you determine relevance?"},
		{"":"Fritz: We will be hand checking the algorithm based on building a matrix so that we can look at that"},
		{"":"Eric said that we will be working with ADL to evaluate the alignment to determine whether our experimental plan is appropriate"},
		{"":"Paula said You are talking about estimating a capacity for a resource to satisfy a competency"},
		{"":"Paula asked these are the things that we can measure but it does not tell me how you are going to use them"},
		{"":"Fritz responded that we are using them to provide inputs to an AI algorithm that will be trained on determining the teachable moment"},
		{"":"Nothing yet, but we will provide more technical data at TIMs"},
		{"":"Takeaway was acceptable<br>"},
		{"to do":"Let's make sure that we all look at the SOW and make sure that we understand the task of (a) Walk the learner through mulitple scenarios"},
		{"":"showed her the language and she was fine with our interpretation<br>"},
		{"to do":"provide updated schedule in Excel format"},
		{"note":"Fritz is bringing up quizlets (WTF?)"},
		{"":"PALMS &amp; SAVE are interesting PAL projects that you may want o to connect to, however Howard said and Paula agreed that that is out of scope<br>"},
		{"":"However, it would be interesting to have some quizlets and other assessment content in the repo without collecting xAPI statements since this stuff has not been instrumented yet"},
		{"":" "},
		{"":"<br>"}
	]
}
,
{
	"title":"If you could see through my eyes...",
	"born":"2014/08/23 10:45:00 (GMT-5)",
	"doc": [
		{"title":"If you could see through my eyes..."},
		{"presenter":"Sudikoff"},
		{"conference":"HEATT"},
		{"type":"conference talk"},
		{"icon":"<img height='24' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAIAAAADnC86AAADjElEQVRYhb2WXWxTZRjHfzC20e5LsgwNXnttnHFxTOayBccUiGO6KYKZkhDiRjR6wSSLRi+WKNEbDXihNyJ+lMnac87WndN2bbfRJUwHJAJJ+55+IWvpIRkzmnCnF53ERo/r19k/z9X7/J/zy8mb53leKEpVlRwfYPQIturiPlCs2ptZmWHFz7EDGwv+1U1ikrjCin8Dqcf6WA0Sk4gpGF4+fXtDqFuriLoQEledyJ8jZG65adpmPbi7lZRKVOWFbtoeJ6qSUunt2GQ5OHyBpMIVlYcaaahhwU3cxb2QxdT3j7IaRJ/h5PDayd5OxDyGl9MnLKPat3L1W3QJEcg5X5TQZX5xUGe3BtzVguFDn+GlfTnnnTvRAxg+jvZaAzY8xCVmz1Ob+2dVW5g+R0yy5qazvSsCfDj8H9nhAcQCd3yMDZWVWmMjLqPL3Jg19VybQsikNLaXsae7W1lWiar07jb1dDxJVCWlcaCzfOCIk6TCokJjg6mnzs6Ci4TM3UCZqKOvsxpEBBnsX8fZ00EkhOHli3dLptqqueZAuIj42ZyH/ycJXSY8QUNtaeC9uzB86D76nsnL39mC7iHj4cRgaeC0RkJm7kfqavLyV1bi/p6Yi3shNhW9OI7s57dZRJCPCtm4b75M5BKGl1NvFUWttXFzCl0m4iu49ooDIWN4eXh74eCeNtIaUZW+7oJrn24lqpL28OpzhYNvjJNUWCrqdVFvJyQTL2J6jwzy+zwiwPHDBVOz6mlHhLit8dV7edfYqrk+jnAhzCdzPlqQ0BV0F9vq8yvoaSPjRffR/2xJ4KceQ9fIeHnnUH4Ft9wkZOYc1OfXu2aqrMD9zVpPV6w79ob6WQ2i+zk1UhI1q0P7CC9yW+PM/0/v+3s3EiwDNatLXyNklqfZ0WRu6mohpa2zdwvVzifWevrgHnNTYpKEwuVpHmwsG9hejd9JTOLPn00cY0PcDSD8DL9SNmpWXS2Ii2Q8fDn6r1ytnevn0aVSe9dMc3/v6QfqchMDu9fezM8XPpnz0a5mdC+Gj5HXchOZ7N79oeSXg4m2VOA+S1zij3k23+/psSHu+ND9fHbSEmpWh/cTXiKtcfYDAOprSMgIibA1t/tPXT6HkEl72NEEB/eQUokpLE3iuIBTsirGJ7joIqaQUnnjRTgzQlojOUVS4aZsbSRlklMsq3hOw6OP8N0Yzk+Y2KgY/5j2Zv4CAJzyMWmDVfYAAAAASUVORK5CYII=' alt=''>"},
		{"schedule":"2014/08/23 10:45am - 11:15am (GMT-5)"},
		{"location":"Room F7"},
		{"notes":"Patient Care"},
		{"":"Tele-collaboration: \"See what I see\", \"I am your proxy\""},
		{"":"Expert on call"},
		{"":"Google Glass challenge in medicine"},
		{"":"Delivery of Care"},
		{"":"Information Access"},
		{"":"Tele-health"},
		{"":"Mediated tele-presence with VNA"},
		{"":"Information Access big at the Google Glass challenge"},
		{"":"Dictate notes"},
		{"":"surgical video in training - a POV mounted camera is ideal!"},
		{"":"one issue with google glass is that the camera sits above the eye"},
		{"idea":"eye tracking in smart glasses could help to figure out what to record with a high resolution, wide angle camera"},
		{"notes":"google glass shows the doctors at what they are looking"},
		{"":"good rehearsal of understanding how you are perceived by patients and family members"},
		{"":"people you need to find"},
		{"":"* technology startups can only do one thing, I need something that is comprehensive"},
		{"":"* EHR - EPEC (?)"},
		{"":"* Legal"},
		{"":"* Compliance"},
		{"":"* IT Security"},
		{"":"* Patient Security"},
		{"":"* Senior Administration (Advocate)"},
		{"":"* Patient and Family"},
		{"":"* Public Relations"},
		{"":""},
		{"questions":"Surgeon in training?"},
		{"":"It is used in the UK for surgical training"},
		{"idea":"After-Market Wide Angle lens for Google Glass"},
		{"questions":"Google glass for patient education?"},
		{"":"IP at Universities is an obstacle in terms of getting things done in terms of technology partners"},
		{"":"Human Factors person on my team, what about a simple head mounted camera versus Google Glass"},
		{"":"Surgical procedure is more important than the video"},
		{"":"Video of practice makes legal and security an issue"},
		{"":"Because of legal nobody wants to record their procedures"},
		{"":""}
	]
}
,
{
	"title":"ITAR Meeting<br>",
	"born":"Mon Sep 08 2014 11:47:25 GMT-0400 (Eastern Standard Time)",
	"doc":[
		{"title":"ITAR Meeting<br>"},
		{"date":"Thursday, August 21, 2014, 4:00:32 PM<br>"},
		{"notes":"<ul><li>UK - Allies</li><li>F.M.S. = Foreign Military Sales</li><li>F.M.S. or ITAR commercial sale</li><li>What is the price tag?</li><li>FMS v ITAR is both would take the same amount of time</li><li>Transitioned to PM-CATT</li><li>Leslie would now be the one who gets the system</li><li>TC3 Curriculum changes</li><li>\"I have Program Level Interest with TC3sim,\" said COL Todd.</li><li>Would we be able to export?&nbsp; It all depends on the TTP's</li><li>standalone versus VBS2/3 - what would be the case with having the capability within VBSx</li><li>If we decide to do an FMS then the Army needs to assign a value to this</li></ul>"},
		{"":"<br>"}
	]
}
,
{
	"title":"Mall, Howard",
	"born":"204/08/21 02:34:56 (GMT-5)",
	"doc":[
		{"title":"={last name}, {first name}"},
		{"type":"person"},
		{"first name":"Howard"},
		{"last name":"Mall"},
		{"address":"3098 Lake Mirage Blvd."},
		{"city":"Orlando"},
		{"state":"FL"},
		{"zip":"32817"},
		{"phone":"321 895 4693"},
		{"résumé":"=link(\"Howard Mall's Resume\", \"file:///c:/stuff/HowardMall.docx\")"},
		{"conversations":"=find({type:\"email\",from:\"Howard Mall\",to:\"me\"})"},
		{"notes":"We the people in order to form a more perfect union, establish justice and pure domestic tranquility, provide for the common defense, promote the general welfare and secure the blessings of liberty for ourselves and our posterity to ordain and establish this Constitution of the United States of America."},
		{"wife":"Jill"},
		{"email":"<table class='internal-table'><thead><tr><td>when</td><td>from</td><td>subject</td></tr></thead><tbody> <tr><td>2014/08/22 12:48</td><td>Joan Smith</td><td>I Love You!</td></tr> <tr><td>2014/08/21 13:45</td><td>John Smith</td><td>About My Wife?</td></tr> <tr><td>2014/08/26 08:14</td><td>Albert Einstein</td><td>Solved It!</td></tr> </tbody></table>"}
	]
}
,
{
	"title":"No plastic, no metal travel coffee mugs",
	"born":"2014/08/28 22:34:00 GMT-5",
	"doc": 
	[
		{"title":"No plastic, no metal travel coffee mugs"},
		{"amazon links":"<a href='http://www.amazon.com/Vandor-99251-Ceramic-Silicone-12-Ounce/dp/B0088YRRLA/ref=sr_1_1?ie=UTF8&qid=1409087716&sr=8-1&keywords=double+walled+ceramic+travel+coffee+mug'>Vandor LLC 99251 Star Wars Double Wall Ceramic Travel Mug with Silicone Lid, 12-Ounce, Black and Gray</a>"},
		{"":"<a href='http://www.amazon.com/GLASSEN-Double-Heatproof-Silicone-capacity/dp/B008FT78DU/ref=pd_sim_k_5?ie=UTF8&refRID=1MDCBTCH43F9S3X8GW35'>GLASSEN (Black) Double Walled Heatproof Glass (Hand Made) Travel Mug with Silicone Grip and lid- Larger capacity 425 ml, 15 fl. oz capacity</a>"},
		{"":"<a href='http://www.amazon.com/Smart-Planet-Double-Wall-Coffee-Travel/dp/B005PQK7I4/ref=pd_sim_k_4?ie=UTF8&refRID=1HGDRAJDZCPXJTXSKD2R'>Smart Planet EC-46 Double-Wall Glass Coffee Travel Mug, Black</a>"},
		{"":"<a href='http://www.amazon.com/Takeya-Double-Coffee-Tumbler-bottle/dp/B006CQDIUA/ref=pd_sim_k_2?ie=UTF8&refRID=1HGDRAJDZCPXJTXSKD2R'>Takeya - Takeya Double Wall Glass Tea/Coffee Tumbler Black, 1 bottle</a>"},
		{"":"<a href='http://www.amazon.com/DCI-Not-Paper-Cup-Chalkboard/dp/B007MOZHI2/ref=sr_1_14?ie=UTF8&qid=1409087716&sr=8-14&keywords=double+walled+ceramic+travel+coffee+mug'>DCI \"I Am Not A Paper Cup\" - Chalkboard Thermal Ceramic Mug 12 fl. oz</a>"},
		{"":"<a href='http://www.amazon.com/Liquid-Logic-Commuter-Silicone-16-Ounce/dp/B003Y3KEH4/ref=pd_bxgy_k_img_z'>Liquid Logic Commuter Single Wall Ceramic Tumbler with Silicone Sleeve and Lid (16-Ounce, White)</a>"}
	]
}
,
{
	"title":"Notebook",
	"born":"Sat Sep 06 2014 10:29:14 GMT-0400 (Eastern Standard Time)",
	"doc":[
		{"title":"Notebook"},
		{"notes":"<a href='#weekly'>Projects</a>"},
		{"":"<a href='#20140905_140443_giftsimilemeeting'>GIFT+SIMILE Release Meeting</a>"},
		{"":"<a href='#20140905_150423_teleicu'>Tele ICU Meeting</a>"},
		{"":"<a href='#weekly20140905'>Engineering Weekly - 2014/09/05</a>"},
		{"":"<a href='#weirdgames'>Weird Games</a>"},
		{"":"<a href='#heatt2014'>HEATT 2014</a>"},
		{"":"<a href='#mug'>Mug</a>"},
		{"":"<a href='#mall'>Mall</a>"}
	]
}
,
{
	"title":"Engineering Weekly - 2014/09/05",
	"born":"Fri Sep 05 2014 10:48:15 GMT-0400 (Eastern Standard Time)",
	"doc":[
		{"title":"Engineering Weekly - 2014/09/05"},
		{"author":"Howard Mall"},
		{"":""},
		{"VA-VMC":"They have divided the work into sprints and Andy and Dave are working with the team to use the task tracking tools they have been given"},
		{"":"QA Engineer search continues with an interview with Jordan Everett occurring next Monday at 4:00.  Kayne will be OOO but we can record the interview and he can follow up on his return."},
		{"":""},
		{"OVAMC":"Alex is creating some libraries for use in this area.  Jim is assisting him."},
		{"":"Dave had a design review scheduled but this has been rescheduled to next week due to Gametech."},
		{"":""},
		{"DHS":"Assisted Frank Colletti in his estimates.  We actually used historical data to make the estimate and Frank already knows how to constrain the designs based on this historical data - WIN!"},
		{"":"Frank and I talked about reusing and generalizing Alex's library for this and there is time in there for that."},
		{"":""},
		{"PULSAR":"The packet was taken over last Thursday and we are awaiting some "},
		{"":"Received feedback from the Technical Team at ADL"},
		{"":""},
		{"GIFT":"Dignitas provided use cases to test."},
		{"":"Eric drafted a review of the history of SIMILE+GIFT based on the GIFT code repository."},
		{"issue":"Eric is concerned that Dignitas is trying to scapegoat us for their missed delivery or attempting to put their new editing tool in to "},
		{"":""},
		{"TRADEM":"Eduworks delivered a test plan."},
		{"":"We began testing their Michiko stuff."},
		{"":""},
		{"GAMETE":"Still owe them a re-look of our estimates. "},
		{"":"Thinking about open sourcing SIMILE as it stands now"},
		{"":""},
		{"BPA":""},
		{"Tele-ICU":"Meeting with UCF this afternoon"},
		{"":"Task planning needs to occur"},
		{"":""},
		{"Call Order #2":"Proposals went in"},
		{"":"Ben Quintero was briefed on these projects"},
		{"":""},
		{"Ranger":"Feedback received from the last drop"},
		{"":""},
		{"MTC2-AART":"Denis has been ramped up and we just need to establish a good task plan"},
		{"":"Ben Quintero will be managing this, yes?"},
		{"":""},
		{"CTCC":"Completed the Gap Analysis report"},
		{"":""},
		{"Gametech 2014":"Shane and I presented.  The conference was not well attended but was interesting"},
		{"":""},
		{"REVEAL":"That proposal went in to Matthew Hackett.  He has requested two more options.  One of them is to update TC3sim."},
		{"":""},
		{"ARL Clinical Mobile App":"Brent is writing a proposal at the behest of Teresita Sotomayor.  Standing by to do estimates of this work."},
		{"":""},
		{"NCD Haptic":"Made delivery.  Met at SIMETRI to show off the stuff to Sotomayor.  Tere is coordinating to set up the data collection meetings."}
	]
}
,
{
	"title":"Engineering Weekly - 2014/09/12",
	"born":"Fri Sep 12 2014 17:21:46 GMT-0400 (Eastern Standard Time)",
	"doc":[
		{"title":"Engineering Weekly - 2014/09/12"},
		{"author":"Howard Mall"},
		{"":""},
		{"VA-VMC":"Andy expressed some concern that progress is not being made on refactoring and again asked for the possibility of another engineer for the project"},
		{"":"Sept 16 is the next release<br>"},
		{"":"Some concerns are being brought up about locking on the scene file in version control to avoid weird merges.&nbsp; I am researching strategies for this."},
		{"":"Interviewed Jordan Everett as QA.&nbsp; He has been doing testing and leading teams.&nbsp; He is ambitious and wants to grow.<br>"},
		{"":"Mary Ann rejected Troy Chapman as not useful to EMST.&nbsp; She wants somebody who can set up automated tests and other more engineering oriented activities.<br>"},
		{"":""},
		{"OVAMC":"The design review went well.&nbsp; Many issues got resolved by the team and they are captured in the review notes in Redmine<br>"},
		{"":"The notes of the reviews were captured as comments here: https://redmine.ecsorl.com/projects/va-omc/issues?query_id=80<br>"},
		{"":""},
		{"DHS":"Engineering did not do anything with regards to this project, however resources will need to be allocated for next month."},
		{"":""},
		{"PULSAR":"The Contracts packet was delivered and commentary was returned"},
		{"":"MSR was drafted and reviewed to reflect the commentary<br>"},
		{"":"Schedule was updated to reflect the commentary"},
		{"":"Monthly Meeting Slides were drafted<br>"},
		{"":"Several Scrums were held to discuss these items and to move forward on a consistent plan that covers the base SOW<br>"},
		{"":""},
		{"GIFT":"A meeting was held with Ben Goldberg<br>"},
		{"":""},
		{"TRADEM":"They did not discuss TRADEM in the TRADEM meeting.&nbsp; It was all about PULSAR.<br>"},
		{"":""},
		{"GAMETE":"Still owe them a re-look of our estimates. "},
		{"":"Thomas Santarelli checked in to see where we were<br>"},
		{"":"Thinking about open sourcing SIMILE as it stands now"},
		{"":""},
		{"BPA":""},
		{"Tele-ICU":"Draft UCF IST sub-contract SOW was written and put out to review to the Contracts department <br>"},
		{"":"Task planning needs to occur"},
		{"":"Ben Quintero participated in all discussions"},
		{"":"I spent a good hour and half brain-dumping with him in a Hangout<br>"},
		{"":""},
		{"Call Order #2":"Received updated requirements on the Palliative Care scenario"},
		{"":"Interviewed Patrick Rasmussen and Mrs. Nicholas in preparation for award<br>"},
		{"":""},
		{"Ranger":"Bill and Doug visited on Thursday"},
		{"":"We are moving this thing forward by hitting base hits instead of homeruns<br>"},
		{"":""},
		{"MTC2-AART":"Meeting is set up to start planning for this work"},
		{"issue":"Denis needs tasking<br>"},
		{"":""},
		{"EPG":"Gametech 2014 overview was presented last Friday"},
		{"":""},
		{"ARL Clinical Mobile App":"Brent delivered the draft proposal"},
		{"":"Howard completed the base BOE and is working the other 5 options"},
		{"":"Bogey is $100K"},
		{"":"<br>"},
		{"Flyte Center":"5 Havoc engineers?"},
		{"":"Need to post Req for these positions<br>"},
		{"":""},
		{"Serious Simulations":"We did not win the follow on work"},
		{"":"I am fine with that.&nbsp; It was more of a distraction<br>"}
	]
}
,
{
	"title":"Engineering Weekly - 2014/09/19",
	"born":"Sun Sep 21 2014 18:20:35 GMT-0400 (Eastern Standard Time)",
	"doc":[
		{"title":"Engineering Weekly - 2014/09/19"},
		{"author":"Howard Mall"},
		{"":""},
		{"VA-VMC":"Live Interview with <a href='https://redmine.ecsorl.com/issues/5471'>Troy Chapman</a>"},
		{"":"Interview with <a href='https://redmine.ecsorl.com/issues/5483'>Chris Macomber</a> - still needs to take test via e-mail"},
		{"":"Phone Interview with <a href='https://redmine.ecsorl.com/issues/5491'>William Jensen</a>"},
		{"":""},
		{"OVAMC":"Czarnopys is off the project, Sherrill is on.&nbsp; Sherrill has been spoken of for IRAD but I think Alvarado is more appropriate.<br>"},
		{"":""},
		{"DHS":"Met with Frank Colletti to discuss his future resource needs.&nbsp; Looks like he is going to need somebody in November<br>"},
		{"":""},
		{"PULSAR":"Monthly Program Management Review went very well"},
		{"":"Invoice is being approved<br>"},
		{"":"Raw minutes were sent out<br>"},
		{"":"<i>Kirkpatrick Level I Design Document draft was given to her</i>"},
		{"":"Spreadsheet as schedule was delivered to her<br>"},
		{"":"<br>"},
		{"GIFT":"Estimate of remaining work was sent out and those things should be done next week<br>"},
		{"":""},
		{"TRADEM":"Our interns having been doing QA as usual,<br>"},
		{"":""},
		{"GAMETE":"Still owe them a re-look of our estimates. "},
		{"":""},
		{"BPA":""},
		{"Tele-ICU":"A lot of discussions with Quintero to help him plan<br>"},
		{"":""},
		{"Ranger":"Have some do outs<br>"},
		{"":"<br>"},
		{"MTC2":"Need to do the PMR and spend some deep time doing planning<br>"},
		{"":""},
		{"IITSEC 2014":"Completed the presentation slides and approved by Birddog awaiting some inputs from Tere Sotomayor<br>"},
		{"":""},
		{"VOP/R IR&D":"Alvarado is the right one for this work.&nbsp; Need to plan the work and collect the various parts of code<br>"},
		{"":""},
		{"ARL Clinical Mobile App":"Need to complete the options<br>"},
		{"":"<br>"},
		{"Flyte Center":"Not doing it<br>"},
		{"":""},
		{"EPG":"Putting together the Common Library process"},
		{"":"Re-collecting the project closeout process"},
		{"":"Request from Baker to teach UML design techniques<br>"}
	]
}
,
{
	"title":"Engineering Weekly - 2014/  /  ",
	"born":"Fri Aug 29 2014 17:50:14 GMT-0400 (Eastern Standard Time)",
	"doc":[
		{"title":"Engineering Weekly - 2014/ /  "},
		{"VA-VMC":""},
		{"OVAMC":""},
		{"PULSAR":""},
		{"GIFT":""},
		{"TRADEM":""},
		{"GAMETE":""},
		{"BPA":""},
		{"Call Order #1 (AKA Tele-ICU)":""},
		{"Call Order #2":""},
		{"Ranger":""},
		{"MTC2-AART":""},
		{"CTCC":""}
	]
}
,
{
	"title":"Weird Games for Wit and Wisdom",
	"born":"Thu Sep 04 2014 16:46:31 GMT-0400 (Eastern Standard Time)",
	"doc":[
		{"title":"Weird Games for Wit and Wisdom"},
		{"type":"conference presentation"},
		{"conference":"Gametech 2014"},
		{"who":"Peter Smith"},
		{"date":"2014/09/04"},
		{"schedule":"1600-1645"},
		{"weird game list":"20. Typing of the Dead  "},
		{"":"19. Hack'n'Slash"},
		{"":"18. Depression Quest"},
		{"":"17. Gaza"},
		{"":"16. Metrico"},
		{"":"15. I am Lonely"},
		{"":"14. Sex Squad "},
		{"":"13. Nothing to Hide"},
		{"":"12. That Dragon Cancer (Son with Terminal Cancer)"},
		{"":"11. The Sun Also Rises "},
		{"":"10. Rocko's Modern Midlife Crisis"},
		{"":"09."},
		{"":"08. Cart Life"},
		{"":"07. Papo & Yo"},
		{"":"06. Castle Doctrine"},
		{"":"05. Necrodancer"},
		{"":"04. Happy Night"},
		{"":"03. Safe Sex w/Friends"},
		{"":"02. Divorce Arcade"},
		{"":"01. Privates"},
		{"":""},
		{"prototyping tools":"<a href='https://www.scirra.com/construct2'>Construct 2</a>"},
		{"":"<a href='http://www.stencyl.com/'>Stencyl</a>"},
		{"":"<a href='http://gamesalad.com/'>GameSalad</a>"},
		{"":"<a href='https://www.yoyogames.com/studio'>GameMaker</a>"}
	]
}
];
 
db.collection('items', function(err, collection) {
collection.insert(items, {safe:true}, function(err, result) {});
});
 
};
